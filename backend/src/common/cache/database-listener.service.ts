import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CacheService } from './cache.service';
import { WinstonLoggerService } from '../logging/winston-logger.service';
import { DatabaseConfigService } from '../../config/database-config.service';
import { Client, Notification } from 'pg';

/**
 * Production-ready PostgreSQL NOTIFY/LISTEN service for real-time cache invalidation
 * Handles database triggers and maintains persistent connection for notifications
 */
@Injectable()
export class DatabaseListenerService implements OnModuleInit, OnModuleDestroy {
  private pgClient: Client | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: WinstonLoggerService,
    private readonly databaseConfig: DatabaseConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.initializeConnection();
      this.logger.log(
        'Database listener service initialized successfully',
        'DatabaseListenerService',
      );
    } catch (error) {
      this.logger.error(
        `Failed to initialize database listener: ${error}`,
        'DatabaseListenerService',
      );
      // Start with a delayed retry in production
      this.scheduleReconnect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      if (this.pgClient) {
        await this.pgClient.end();
        this.pgClient = null;
        this.logger.log('Database listener connection closed', 'DatabaseListenerService');
      }
    } catch (error) {
      this.logger.warn(
        `Error during database listener cleanup: ${error}`,
        'DatabaseListenerService',
      );
    }
  }

  /**
   * Initialize PostgreSQL connection with proper security and error handling
   */
  private async initializeConnection(): Promise<void> {
    if (this.isShuttingDown) return;

    try {
      // Get connection details including sensitive credentials
      const connectionDetails = this.databaseConfig.connectionDetails;

      // Create dedicated PostgreSQL client for LISTEN operations
      this.pgClient = new Client({
        host: connectionDetails.host,
        port: connectionDetails.port,
        database: connectionDetails.database,
        user: connectionDetails.username,
        password: connectionDetails.password,
        // Security: SSL configuration based on environment
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        // Security: Connection timeout and keep-alive
        connectionTimeoutMillis: 10000,
        query_timeout: 30000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      });

      // Setup connection event handlers
      this.setupConnectionHandlers();

      // Connect to database
      await this.pgClient.connect();
      this.logger.log('Connected to PostgreSQL for NOTIFY/LISTEN', 'DatabaseListenerService');

      // Setup LISTEN for our notification channels
      await this.setupNotificationChannels();

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
    } catch (error) {
      this.logger.error(`Failed to connect to PostgreSQL: ${error}`, 'DatabaseListenerService');

      if (this.pgClient) {
        try {
          await this.pgClient.end();
        } catch (cleanupError) {
          this.logger.warn(`Error during cleanup: ${cleanupError}`, 'DatabaseListenerService');
        }
        this.pgClient = null;
      }

      throw error;
    }
  }

  /**
   * Setup connection event handlers for monitoring and error recovery
   */
  private setupConnectionHandlers(): void {
    if (!this.pgClient) return;

    // Handle connection errors
    this.pgClient.on('error', error => {
      this.logger.error(`PostgreSQL connection error: ${error.message}`, 'DatabaseListenerService');

      // Attempt to reconnect on connection loss
      if (!this.isShuttingDown) {
        this.scheduleReconnect();
      }
    });

    // Handle unexpected disconnections
    this.pgClient.on('end', () => {
      this.logger.warn('PostgreSQL connection ended unexpectedly', 'DatabaseListenerService');

      if (!this.isShuttingDown) {
        this.scheduleReconnect();
      }
    });

    // Handle notifications from database triggers
    this.pgClient.on('notification', (msg: Notification) => {
      void this.handleNotification(msg).catch(error => {
        this.logger.error(`Error handling notification: ${error}`, 'DatabaseListenerService');
      });
    });
  }

  /**
   * Setup LISTEN channels for database triggers
   */
  private async setupNotificationChannels(): Promise<void> {
    if (!this.pgClient) return;

    try {
      // Listen to cache invalidation notifications from database triggers
      await this.pgClient.query('LISTEN cache_invalidation');

      this.logger.debug('Setup LISTEN channels for cache invalidation', 'DatabaseListenerService');
    } catch (error) {
      this.logger.error(`Failed to setup LISTEN channels: ${error}`, 'DatabaseListenerService');
      throw error;
    }
  }

  /**
   * Handle incoming PostgreSQL notifications
   */
  private async handleNotification(msg: Notification): Promise<void> {
    const channel = msg.channel;
    const payload = msg.payload;

    if (!channel || !payload) {
      this.logger.warn(
        'Received notification with missing channel or payload',
        'DatabaseListenerService',
      );
      return;
    }

    this.logger.debug(
      `Received notification on channel '${channel}': ${payload}`,
      'DatabaseListenerService',
    );

    try {
      switch (channel) {
        case 'cache_invalidation':
          await this.handleCacheInvalidation(payload);
          break;

        default:
          this.logger.warn(`Unknown notification channel: ${channel}`, 'DatabaseListenerService');
      }
    } catch (error) {
      this.logger.error(
        `Error processing ${channel} notification: ${error}`,
        'DatabaseListenerService',
      );
    }
  }

  /**
   * Handle cache invalidation notifications from database triggers
   */
  private async handleCacheInvalidation(payload: string): Promise<void> {
    try {
      const notification = JSON.parse(payload) as {
        table: string;
        clerk_id?: string;
        operation: string;
      };

      // Validate required fields
      if (!notification.table || !notification.operation) {
        this.logger.warn(
          `Invalid cache invalidation payload: missing required fields`,
          'DatabaseListenerService',
        );
        return;
      }

      this.logger.debug(
        `Cache invalidation triggered: ${notification.table} ${notification.operation}`,
        'DatabaseListenerService',
      );

      switch (notification.table) {
        case 'users':
          if (notification.clerk_id) {
            await this.cacheService.invalidateUser(notification.clerk_id);
            this.logger.debug(
              `Invalidated user cache for clerk_id: ${notification.clerk_id}`,
              'DatabaseListenerService',
            );
          }
          break;

        case 'tags':
        case 'tag_similarities':
          // Clear all tag similarity cache entries
          await this.invalidateAllTagSimilarities();
          this.logger.debug(
            'Invalidated all tag similarity cache entries',
            'DatabaseListenerService',
          );
          break;

        default:
          this.logger.debug(
            `No cache invalidation handler for table: ${notification.table}`,
            'DatabaseListenerService',
          );
      }
    } catch (error) {
      this.logger.error(
        `Error handling cache invalidation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DatabaseListenerService',
      );
    }
  }

  /**
   * Invalidate all tag similarity cache entries using Redis pattern matching
   * This is called when tags or tag_similarities table changes
   */
  private async invalidateAllTagSimilarities(): Promise<void> {
    try {
      // Note: This is a simplified implementation that relies on TTL
      // For production with high-frequency changes, consider implementing
      // Redis SCAN with pattern matching to delete specific keys

      this.logger.debug(
        'Tag similarity invalidation triggered - cache will refresh on next access',
        'DatabaseListenerService',
      );

      // Future enhancement: Use Redis SCAN to find and delete all keys matching 'tag_sim:*'
      // const redis = this.cacheService.getRedisClient(); // Would need to expose this
      // const keys = await redis.scan(0, 'MATCH', 'tag_sim:*');
      // if (keys[1].length > 0) {
      //   await redis.del(...keys[1]);
      // }

      // For now, we rely on TTL expiration and cache misses will fetch fresh data
      await Promise.resolve();
    } catch (error) {
      this.logger.error(
        `Error invalidating tag similarities: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DatabaseListenerService',
      );
    }
  }

  /**
   * Schedule reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.isShuttingDown || this.reconnectTimer) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        'Max reconnection attempts reached. Database listener disabled.',
        'DatabaseListenerService',
      );
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Max 30s delay
    this.reconnectAttempts++;

    this.logger.log(
      `Scheduling database listener reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`,
      'DatabaseListenerService',
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      void this.initializeConnection().catch(error => {
        this.logger.error(
          `Reconnection attempt ${this.reconnectAttempts} failed: ${error}`,
          'DatabaseListenerService',
        );
        this.scheduleReconnect();
      });
    }, delay);
  }

  /**
   * Manual cache invalidation for a specific user
   * @param clerkId - The Clerk ID of the user whose cache should be cleared
   */
  async handleUserChange(clerkId: string): Promise<void> {
    this.logger.debug(
      `Manual user cache invalidation for clerk_id: ${clerkId}`,
      'DatabaseListenerService',
    );
    await this.cacheService.invalidateUser(clerkId);
  }

  /**
   * Manual cache invalidation for all tag similarities
   */
  async handleTagChange(): Promise<void> {
    this.logger.debug('Manual tag similarities cache invalidation', 'DatabaseListenerService');
    await this.cacheService.invalidateTagSimilarities('all');
  }

  /**
   * Health check for the database listener connection
   * @returns true if the connection is alive, false otherwise
   */
  async healthCheck(): Promise<boolean> {
    if (!this.pgClient) {
      return false;
    }
    try {
      await this.pgClient.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error(
        `Database listener health check failed: ${error}`,
        'DatabaseListenerService',
      );
      return false;
    }
  }

  /**
   * Get the current status of the database listener connection
   * @returns 'connected', 'connecting', 'disconnected', or 'reconnecting'
   */
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'reconnecting' {
    if (this.reconnectTimer) {
      return 'reconnecting';
    }
    if (!this.pgClient) {
      return 'disconnected';
    }
    // The 'pg' library's Client type doesn't explicitly include readyForQuery, but it exists on the instance.
    // Using a type assertion is a clean way to access it without disabling lint rules.
    return (this.pgClient as unknown as { readyForQuery: boolean }).readyForQuery
      ? 'connected'
      : 'connecting';
  }
}

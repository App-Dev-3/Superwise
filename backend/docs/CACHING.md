# Caching Strategy

## Overview

The Superwise application uses Redis as a distributed cache to improve performance by reducing database queries for frequently accessed data. We cache two main types of data:

1. **User Data** - Cached after authentication to avoid repeated database lookups
2. **Tag Similarities** - Cached to speed up the matching algorithm calculations

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Client    │────▶│   Backend   │────▶│    Redis     │
└─────────────┘     └─────────────┘     └──────────────┘
                           │                     ▲
                           ▼                     │
                    ┌─────────────┐             │
                    │  PostgreSQL  │─────────────┘
                    └─────────────┘   (Triggers)
```

## What Gets Cached

### User Data

- **Key Format**: `user:{clerkId}`
- **TTL**: 20 minutes (configurable via `USER_CACHE_TTL`)
- **Content**: User object from database (without sensitive fields)
- **When Cached**: On successful JWT authentication
- **When Invalidated**: Automatically via database triggers on user table changes

### Tag Similarities

- **Key Format**: `tag_sim:{tagId1}:{tagId2}` (IDs are sorted alphabetically)
- **TTL**: 24 hours (configurable via `TAG_SIMILARITY_CACHE_TTL`)
- **Content**: Similarity score (0.0 to 1.0)
- **When Cached**: On first calculation during matching
- **When Invalidated**: Manually when tags are bulk imported via admin interface

## Cache Invalidation Strategy

### Automatic Invalidation (Database Triggers)

PostgreSQL triggers send notifications when data changes:

```sql
-- Example: User table trigger
CREATE TRIGGER trigger_users_cache_invalidation
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_cache_invalidation();
```

The `DatabaseListenerService` listens for these notifications and invalidates the appropriate cache entries.

### Manual Invalidation

- Tag similarities are manually invalidated in `AdminService.tagsBulkImport()` since tags only change through admin imports

## Configuration

Add these environment variables to your `.env` file:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Cache TTL Configuration (in milliseconds)
USER_CACHE_TTL=1200000             # 20 minutes
TAG_SIMILARITY_CACHE_TTL=86400000  # 24 hours
CACHE_MAX_ITEMS=1000              # Max items in cache
```

## Monitoring & Troubleshooting

### Health Check

The cache service provides a health check endpoint:
```typescript
await cacheService.healthCheck(); // Returns true if Redis is accessible
```

### Common Issues

1. **Cache Miss on Recently Updated Data**
   - This is expected behavior - the cache was invalidated
   - The next request will fetch fresh data and cache it

2. **Redis Connection Errors**
   - Check Redis is running: `redis-cli ping`
   - Verify connection settings in `.env`
   - Check logs for connection errors

3. **Stale Data**
   - For users: Check if database triggers are working
   - For tags: Ensure admin service is invalidating cache after imports

## Development Tips

### Clear All Cache (Development Only)

```bash
redis-cli FLUSHALL
```

### Monitor Cache Activity

```bash
redis-cli MONITOR
```

### Check Specific Key

```bash
redis-cli GET "user:user_12345"
```

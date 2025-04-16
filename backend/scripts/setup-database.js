#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const DEFAULT_DB_NAME = 'superwise';
const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 5432;
const DEFAULT_ADMIN_USER = process.env.PGUSER || 'postgres'; // Default admin user (can be overridden)
const ENV_FILE_PATH = path.join(__dirname, '..', '.env');
const SCHEMA = 'public';

// --- Argument Parsing ---
// Example: node setup-database.js newUser newPass [dbName] [host] [port] [--admin-user adminUser] [--admin-password adminPass]
const args = process.argv.slice(2);
let positionalArgs = [];
let adminUserOverride = null;
let adminPasswordOverride = null; // New variable for admin password

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--admin-user' && i + 1 < args.length) {
    adminUserOverride = args[i + 1];
    i++; // Skip value
  } else if (args[i] === '--admin-password' && i + 1 < args.length) { // Parse admin password flag
    adminPasswordOverride = args[i + 1];
    i++; // Skip value
  } else {
    positionalArgs.push(args[i]);
  }
}

const targetUser = positionalArgs[0];
const targetPassword = positionalArgs[1];
const targetDb = positionalArgs[2] || DEFAULT_DB_NAME;
const dbHost = positionalArgs[3] || DEFAULT_HOST;
const dbPort = parseInt(positionalArgs[4] || DEFAULT_PORT, 10);

const adminUser = adminUserOverride || DEFAULT_ADMIN_USER;
// Use provided admin password, otherwise pg library relies on env/pgpass
const adminPassword = adminPasswordOverride; 

if (!targetUser || !targetPassword) {
  console.error('Usage: node setup-database.js <username> <password> [database_name] [host] [port] [--admin-user <admin_username>] [--admin-password <admin_password>]');
  console.error('Error: Target username and password are required.');
  process.exit(1);
}

if (isNaN(dbPort)) {
    console.error(`Error: Invalid port number provided: ${positionalArgs[4]}`);
    process.exit(1);
}

// --- Helper Functions ---
// Simplified executeQuery - takes a fully constructed SQL string
async function executeQuery(client, queryString, ignoreErrorCodes = []) {
  try {
    console.log(`Executing SQL: ${queryString}`);
    await client.query(queryString);
    console.log(' -> Success');
  } catch (err) {
    if (ignoreErrorCodes.includes(err.code)) {
      console.log(` -> Ignored error: ${err.code} (${err.message})`);
    } else {
      console.error(` -> SQL Error (${err.code}): ${err.message}`);
      console.error(` -> Failed Query: ${queryString}`); // Log the query that failed
      throw err; // Re-throw error to stop execution
    }
  }
}

function updateEnvFile(username, password, dbname, host, port, schema) {
  const databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${dbname}?schema=${schema}`;
  console.log(`
Updating ${ENV_FILE_PATH} with DATABASE_URL...`);
  console.log(`Connection String: ${databaseUrl}`);

  try {
    let content = '';
    if (fs.existsSync(ENV_FILE_PATH)) {
      content = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    } else {
      console.log('.env file not found, creating it.');
      // Create a basic structure if file doesn't exist
      content = '# Environment variables for Superwise\n\n';
    }

    const urlLine = `DATABASE_URL="${databaseUrl}"`;
    const regex = /^DATABASE_URL=.*$/m; // Match entire line starting with DATABASE_URL=

    if (regex.test(content)) {
      console.log('Updating existing DATABASE_URL...');
      content = content.replace(regex, urlLine);
    } else {
      console.log('Adding DATABASE_URL...');
      content += (content.endsWith('\n') ? '' : '\n') + urlLine + '\n';
    }

    fs.writeFileSync(ENV_FILE_PATH, content, 'utf8');
    console.log('.env file updated successfully.');
  } catch (err) {
    console.error(`Error updating .env file: ${err.message}`);
    console.error('Please manually set the DATABASE_URL in your .env file:');
    console.error(`DATABASE_URL="${databaseUrl}"`);
    // Don't exit, DB might be set up correctly, but inform user.
  }
}


// --- Main Execution ---
(async () => {
  console.log(`Starting database setup for user '${targetUser}' and database '${targetDb}' on ${dbHost}:${dbPort}...`);
  console.log(`Attempting initial connection as admin user: '${adminUser}'`);

  // Initial connection configuration
  const clientConfig = {
    user: adminUser,
    host: dbHost,
    database: 'postgres',
    port: dbPort,
    // Explicitly pass password if provided via flag, otherwise let pg handle env/pgpass
    password: adminPassword, 
  };
  const client = new Client(clientConfig);

  try {
    console.log(`Connecting to database 'postgres' as user '${adminUser}'...`);
    await client.connect();
    console.log('Connected successfully.');

    // Escape identifiers and literals correctly
    const escapedTargetUser = client.escapeIdentifier(targetUser);
    const escapedTargetPassword = client.escapeLiteral(targetPassword);
    const escapedTargetDb = client.escapeIdentifier(targetDb);

    // 1. Create User (ignore if exists)
    const createUserSql = `CREATE USER ${escapedTargetUser} WITH PASSWORD ${escapedTargetPassword} CREATEDB`;
    await executeQuery(
      client,
      createUserSql,
      ['42710'] // 42710 = duplicate_object (role already exists)
    );

    // 2. Alter User (ensure password/CREATEDB if user already existed)
    const alterUserSql = `ALTER USER ${escapedTargetUser} WITH PASSWORD ${escapedTargetPassword} CREATEDB`;
    await executeQuery(
        client,
        alterUserSql
        // No specific error code to ignore here, should succeed if user exists
    );

    // 3. Create Database (ignore if exists)
    const createDbSql = `CREATE DATABASE ${escapedTargetDb} WITH OWNER = ${escapedTargetUser}`;
    await executeQuery(
      client,
      createDbSql,
      ['42P04'] // 42P04 = duplicate_database
    );

     // 4. Alter Database Owner (ensure owner if DB already existed)
     const alterDbOwnerSql = `ALTER DATABASE ${escapedTargetDb} OWNER TO ${escapedTargetUser}`;
     await executeQuery(
        client,
        alterDbOwnerSql
        // No specific error code to ignore here, should succeed if DB exists
     );

    console.log('Database and user setup/verification complete.');

  } catch (err) {
    console.error('\n--- Database Setup Failed ---');

    // Provide specific guidance based on common errors
    if (err.message && err.message.includes('role') && err.message.includes('does not exist')) { 
        console.error(`The admin user '${adminUser}' used for the initial connection does not exist.`);
        console.error(`Please verify your PostgreSQL admin username and retry using the --admin-user flag:`);
        console.error(`  npm run db:setup -- ${targetUser} ${targetPassword} --admin-user <your_actual_admin_user>`);
    } else if (err.code === '28P01' || (err.message && err.message.includes('password authentication failed'))) { // Invalid password
        console.error(`Authentication failed for admin user '${adminUser}'.`);
        console.error('If this user requires a password, you need to provide it.');
        console.error('Option 1 (Recommended): Set PGPASSWORD environment variable before running:');
        console.error('  (e.g., export PGPASSWORD=\'your_pass\'; npm run ...)');
        console.error('Option 2 (Less Secure): Use the --admin-password flag (password may appear in logs/history):');
        console.error(`  npm run db:setup -- ${targetUser} ${targetPassword} --admin-user ${adminUser} --admin-password <admin_password>`);
    } else if (err.code === 'ECONNREFUSED'){
        console.error(`Connection refused connecting to ${dbHost}:${dbPort}. Is PostgreSQL running and accessible?`);
    } else if (err.code === '3D000' && err.message.includes('does not exist')) { // Invalid database
        console.error(`Database 'postgres' does not exist or admin user '${adminUser}' cannot access it.`);
        console.error('Please ensure the \'postgres\' database exists and the admin user has connection rights.');
    } else {
        console.error('An unrecoverable error occurred during initial connection or SQL execution.');
        console.error(`Error details: Code=${err.code || 'N/A'} Message=${err.message}`);
    }
    console.error('-----------------------------');
    process.exit(1); // Exit with error code
  } finally {
    if (client) {
      await client.end();
      console.log('Disconnected from database.');
    }
  }

  // Update .env file outside the try/catch for DB connection
  updateEnvFile(targetUser, targetPassword, targetDb, dbHost, dbPort, SCHEMA);

  console.log('Setup script finished.');
  process.exit(0);

})(); 
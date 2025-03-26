# MatchMaker API

A backend REST API for matching students with thesis supervisors. The system provides a platform where students can view real-time supervisor availability and research interests, submit structured requests, and gives supervisors tools to manage their capacity and respond efficiently.

## Current State

This is a basic setup with a simple 'Hello World' endpoint. The project structure is configured but minimal functionality has been implemented.

## Tech Stack

- **NestJS** with TypeScript
- **Prisma ORM** with PostgreSQL
- **@nestjs/config** for environment variables
- **@nestjs/jwt** for authentication
- **nodemailer** for email notifications
- **Jest** for testing
- **Swagger/OpenAPI** for API documentation

## Prerequisites

- Node.js (v20 or higher)
- npm (comes with Node.js)
- PostgreSQL (installed and running)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env` and update the variables:
   ```bash
   # macOS/Linux
   cp .env.example .env
   
   # Windows (Command Prompt)
   copy .env.example .env
   ```

## Database Setup

### macOS/Linux

```bash
# 1. Create a PostgreSQL user
createuser --createdb <username>

# 2. Set password for the user
psql -d postgres -c "ALTER USER <username> WITH PASSWORD '<password>';"

# 3. Create database with the user as owner
createdb --owner=<username> matchmaker

# 4. Update your .env file with your connection string
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/matchmaker?schema=public"

# 5. Run migrations to create the database tables
npx prisma migrate dev
```

### Windows

```cmd
# 1. Create a PostgreSQL user
psql -U postgres -c "CREATE USER <username> WITH PASSWORD '<password>' CREATEDB;"

# 2. Create database with the user as owner
psql -U postgres -c "CREATE DATABASE matchmaker WITH OWNER = <username>;"

# 3. Update your .env file with your connection string
# DATABASE_URL="postgresql://<username>:<password>@localhost:5432/matchmaker?schema=public"

# 4. Run migrations to create the database tables
npx prisma migrate dev
```

Replace `<username>` and `<password>` with your desired values.

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

[http://localhost:3000/api]


## Current Project Structure

- `src/` - Source code
  - `main.ts` - Application entry point
  - `app.module.ts` - Root module
  - `app.controller.ts` - Basic controller with hello world endpoint
  - `app.service.ts` - Basic service
  - `prisma/` - Prisma service and module for database access

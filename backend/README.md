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
- **uuid** for ID generation

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

## Available Commands

This project utilizes several commands for development, building, testing, and database management.

### npm Scripts (from `package.json`)

- `npm run build`: Compiles the TypeScript application into JavaScript using the NestJS CLI (`nest build`). The output is placed in the `dist` folder.
- `npm run format`: Formats all `.ts` files in the `src` and `test` directories using Prettier.
- `npm run start`: Starts the application using the NestJS CLI (`nest start`). This is typically used for quick starts but `start:dev` is recommended for development.
- `npm run start:dev`: Starts the application in development mode using `nest start --watch`. This enables hot-reloading, automatically restarting the server when code changes are detected.
- `npm run start:debug`: Starts the application in debug mode with file watching (`nest start --debug --watch`). Allows attaching a debugger.
- `npm run start:prod`: Starts the compiled application directly using Node (`node dist/main`). This is intended for production environments after running `npm run build`.
- `npm run lint`: Lints the codebase using ESLint (`eslint "{src,apps,libs,test}/**/*.ts" --fix`) and attempts to automatically fix linting errors.
- `npm run test`: Runs unit tests using Jest.
- `npm run test:watch`: Runs unit tests in watch mode, re-running tests when files change.
- `npm run test:cov`: Runs unit tests and generates a code coverage report in the `coverage` directory.
- `npm run test:debug`: Runs unit tests in debug mode, allowing you to attach a debugger.
- `npm run test:e2e`: Runs end-to-end tests using Jest with a specific configuration (`./test/jest-e2e.json`).

### NestJS CLI (`nest`)

The NestJS CLI is used internally by many npm scripts but can also be used directly for tasks like generating code:

- `npx nest build`: Compiles the application (same as `npm run build`).
- `npx nest start`: Starts the application (same as `npm run start`).
- `npx nest generate <schematic> <name> [options]` (alias: `npx nest g`): Generates NestJS building blocks.
  - Examples:
    - `npx nest g module users` (Creates a `users` module)
    - `npx nest g controller users` (Creates a `users` controller)
    - `npx nest g service users` (Creates a `users` service)

### Prisma CLI (`prisma`)

Prisma is used for database interactions:

- `npx prisma migrate dev`: Creates and applies database migrations based on changes in your `prisma/schema.prisma` file. This command is crucial during development for keeping the database schema in sync with the Prisma schema definition. It will also generate the Prisma Client types.
- `npx prisma studio`: Opens a GUI tool in your browser to view and manipulate data in your database.
- `npx prisma generate`: Generates the Prisma Client based on your schema. This is often run automatically by other commands like `prisma migrate dev` or `npm install`.

## Current Project Structure

- `src/` - Source code
  - `main.ts` - Application entry point
  - `app.module.ts` - Root module
  - `app.controller.ts` - Basic controller with hello world endpoint
  - `app.service.ts` - Basic service
  - `prisma/` - Prisma service and module for database access


## This is a simple test for Jira

HIHIHIHI

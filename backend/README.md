# Superwise API

A backend REST API for matching students with thesis supervisors, named Superwise. The system provides a platform where students can view real-time supervisor availability and research interests, submit structured requests, and gives supervisors tools to manage their capacity and respond efficiently.

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

- Node.js (v20 or higher recommended)
- npm (comes with Node.js)
- PostgreSQL (v17 installed and running, see below)

### PostgreSQL Installation

**macOS (using Homebrew):**

```bash
# Install PostgreSQL
brew install postgresql

# Start the PostgreSQL service
brew services start postgresql
```

**Linux (Debian/Ubuntu):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```
**(For other Linux distros:** Follow specific instructions for your package manager.)

**Windows:**

These steps follow the general process outlined in the [W3Schools PostgreSQL Installation Guide](https://www.w3schools.com/postgresql/postgresql_install.php).

1.  **Download:** Get the PostgreSQL installer from the [official PostgreSQL website](https://www.postgresql.org/download/windows/). Choose the PG version 17 installer.
2.  **Run Installer:** Execute the downloaded installer file.
3.  **Installation Directory:** You can keep the default location (e.g., `C:\Program Files\PostgreSQL\<version>`) or specify a custom one.
4.  **Select Components:** Ensure at least the following are selected:
    *   `PostgreSQL Server`: The core database engine.
    *   `Command Line Tools`: Installs `psql` and other necessary command-line utilities used by the setup scripts.
    *   `pgAdmin 4` is a useful GUI tool for managing databases but is not strictly required for this project.
    *   `Stack Builder` is used to download and install additional drivers and tools *after* the main installation is complete. You can deselect it or simply cancel it if it runs at the end of the setup; it's not needed for the basic setup.
5.  **Data Directory:** Choose where the database data will be stored (the default dir is fine).
6.  **Password:** Set a strong password for the default PostgreSQL superuser (usually `postgres`). **Remember this password and the username**, as you might need it for initial connections or troubleshooting, even though our setup script creates a dedicated user for the application.
7.  **Port:** Keep the default port (5432) unless you have a specific reason to change it.
8.  **Locale:** Select your preferred locale settings.
9.  **Complete Installation:** Review the summary and proceed with the installation.
10. **Add PATH to System Evironment:** After installation, add the PostgreSQL `bin` directory (e.g., `C:\Program Files\PostgreSQL\17\bin`) to your system's PATH environment variable. This allows `psql` to be run from any terminal. This [Guide by ComputerHope](https://www.computerhope.com/issues/ch000549.htm#0) explains how to do this on Win10 & Win11.
11. **Restart your Computer**: This ensures the updated PATH environment variable is loaded correctly by all applications, including your terminal. **Otherwise it doesn't work!**


## Installation

1.  Clone the repository (if you haven't already).
2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
3.  Install dependencies (this now includes the `pg` client used by the setup script):
    ```bash
    npm install
    ```
4.  Create the `.env` file from the example:
    ```bash
    # macOS/Linux/Git Bash
    cp .env.example .env

    # Windows (Command Prompt)
    copy .env.example .env

    # Windows (PowerShell)
    copy-item .env.example .env
    ```
    *(The database URL will be configured in the next step)*

## Database Setup

This project includes a Node.js script (`scripts/setup-database.js`) to automate the creation of the necessary PostgreSQL user and the `superwise` database.

1.  **Ensure PostgreSQL service is running** and accessible (usually on `localhost:5432`).

2.  **Run the Setup Command:**
    From the `backend` directory, run the script providing the desired username and password for the *new* application user:
    ```bash
    npm run db:setup -- <app_user> <app_pass>
    ```
    *Remember to separate the script arguments (`<app_user>`, `<app_pass>`) from the npm command using `--`.*

3.  **Troubleshooting Failures:**
    The script needs to connect as an existing PostgreSQL *administrator* to create the new user/database. If the command above fails, check the error message:

    *   **If the error is `The admin user '<user>' used for the initial connection does not exist`:**
        This means the script couldn't find the default admin user (e.g., `postgres`). You need to tell it your actual admin username.
        *   **Fix:** Find your admin username (often `postgres` on Linux/Windows, your OS username on macOS/Homebrew, or custom). Re-run the command with the `--admin-user` flag:
            ```bash
            npm run db:setup -- <app_user> <app_pass> --admin-user <your_pg_admin_user>
            ```

    *   **If the error is `Authentication failed for admin user '<user>'`:**
        This means the admin user exists, but requires a password.
        *   **Fix 1 (Recommended): Use `PGPASSWORD` Environment Variable.** Set this temporarily in your terminal before running the command (more secure):
            ```bash
            # Linux/macOS Example:
            export PGPASSWORD='your_admin_password'
            npm run db:setup -- <app_user> <app_pass> --admin-user <your_pg_admin_user>
            unset PGPASSWORD # Optional: clear after use
            ```
            *(Adapt for Windows CMD/PowerShell)*
        *   **Fix 2 (Less Secure): Use `--admin-password` Flag.**
            ```bash
            npm run db:setup -- <app_user> <app_pass> --admin-user <your_pg_admin_user> --admin-password <your_admin_password>
            ```
            *(Warning: Password may appear in shell history)*

    *   **If the error is `Connection refused`:** Ensure your PostgreSQL server is running.

4.  **On Success:** The script will:
    *   Create the `<app_user>` with `<app_pass>` and necessary privileges.
    *   Create the `superwise` database owned by `<app_user>`.
    *   Update your `backend/.env` file with the correct `DATABASE_URL`.

5.  **Verify `.env`:** Double-check that `backend/.env` contains the correct `DATABASE_URL`.

6.  **Apply Migrations:** Run the migrations to set up the database schema:
    ```bash
    npx prisma migrate dev
    ```

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
- `npm run db:setup -- <username> <password> [db_name] [host] [port] [--admin-user <admin_username>] [--admin-password <admin_password>]`: Runs the Node.js database setup script (`scripts/setup-database.js`). Creates the specified PostgreSQL user/password for the application database (default: `superwise`), sets owner, and updates `.env`. Requires `<username>` and `<password>`. If initial connection fails, use `--admin-user` to specify your PG admin user and `--admin-password` (less secure) or `PGPASSWORD` env var if authentication is needed. Remember `--` before script arguments.

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

- `npx prisma migrate dev`: Creates and applies database migrations based on changes in your `prisma/schema.prisma` file. This command is crucial during development for keeping the `superwise` database schema in sync with the Prisma schema definition. It will also generate the Prisma Client types.
- `npx prisma studio`: Opens a GUI tool in your browser to view and manipulate data in your database.
- `npx prisma generate`: Generates the Prisma Client based on your schema. This is often run automatically by other commands like `prisma migrate dev` or `npm install`.

## Current Project Structure

- `src/` - Source code
  - `main.ts` - Application entry point
  - `app.module.ts` - Root module
  - `app.controller.ts` - Basic controller with hello world endpoint
  - `app.service.ts` - Basic service
- `prisma/` - Prisma schema and migration files
- `scripts/` - Database setup script (`setup-database.js`)
- `.env.example` - Example environment variables

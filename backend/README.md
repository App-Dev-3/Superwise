# Superwise API

A backend REST API for matching students with thesis supervisors, named Superwise. The system provides a platform where students can view real-time supervisor availability and research interests, submit structured requests, and gives supervisors tools to manage their capacity and respond efficiently.

## Current State

This is a basic setup with a simple 'Hello World' endpoint. The project structure is configured but minimal functionality has been implemented.

### Tech Stack

- **NestJS** with TypeScript
- **Prisma ORM** with PostgreSQL
- **@nestjs/config** for environment variables
- **@nestjs/jwt** for authentication
- **nodemailer** for email notifications
- **Jest** for testing
- **Swagger/OpenAPI** for API documentation
- **uuid** for ID generation

### Project Structure

- `src/` - Source code
  - `main.ts` - Application entry point
  - `app.module.ts` - Root module
  - `app.controller.ts` - Basic controller with hello world endpoint
  - `app.service.ts` - Basic service
- `prisma/` - Prisma schema and migration files
- `.env.example` - Example environment variables

## How to Install

### Prerequisites

- Node.js (v20 or higher recommended)
- npm (comes with Node.js)
- PostgreSQL (v17 installed and running, see below)

#### PostgreSQL Installation

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
12. **Verify Service Status:**
    *   After restarting, check if the PostgreSQL service is running. Open the Windows Services app (press `WinKey+R` and type `services.msc`).
    *   Find the service (`postgresql-x64-17`). Its status should be "Running".
    *   If not running, right-click it and select "Start".
    *   If it fails to start, consult the Windows Event Viewer (Application/System logs) or PostgreSQL logs (`data/log` subdirectory) for errors. Re-running the installer or checking permissions might be needed.

### Project Installation

1.  Clone the repository (if you haven't already).
2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
3.  Install dependencies:
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

### Database Setup

Follow these steps to set up the database and user for the application. Run these commands from your terminal.

**Note:** You may need to provide the password for the `postgres` user depending on your PostgreSQL configuration.

1.  **Create PostgreSQL User:**
    Replace `<username>` and `<password>` with your desired credentials. Ensure the password is in single quotes.
    *(If your chosen `<username>` contains uppercase letters, spaces, or special characters, enclose it in double quotes: `"<username>"`)*
    ```bash
    psql -U postgres -c "CREATE USER <username> WITH PASSWORD '<password>' CREATEDB;"
    ```

2.  **Create Database:**
    Replace `<username>` with the user created in the previous step.
    *(Use double quotes `"<username>"` if needed, as mentioned above)*
    ```bash
    psql -U postgres -c "CREATE DATABASE superwise WITH OWNER = <username>;"
    ```

3.  **Update `.env` File:**
    Open the `backend/.env` file. Find or add the `DATABASE_URL` variable and set it to your connection string, replacing placeholders:
    ```dotenv
    DATABASE_URL="postgresql://<username>:<password>@localhost:5432/superwise?schema=public"
    ```

4.  **Run Migrations:**
    Navigate to the `backend` directory in your terminal and run:
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

This project provides several scripts and uses CLI tools for common development tasks. While many commands are available, the primary ones you'll use after initial setup are `npm run start:dev` (to run the app) and `npx prisma migrate dev` (to update the database schema). Other commands listed below are optional quality-of-life helpers or used for specific scenarios like production builds or advanced code generation.

### Running the Application

-   `npm run start:dev`:
    Starts the application in development mode with hot-reloading (`nest start --watch`). This is the recommended command for development.
-   `npm run start`: Starts the application using `nest start`. Less common for development than `start:dev`.
-   `npm run start:prod`:
    Starts the compiled application from the `dist` folder (`node dist/main`). Use this *after* running `npm run build` for production-like environments.
-   `npm run start:debug`:
    Starts in development mode with the debugger attached (`nest start --debug --watch`).

### Database (Prisma)

-   `npx prisma migrate dev`:
    **Essential command.** Compares your `prisma/schema.prisma` file to the database and applies any necessary changes as a new migration. Also generates/updates the Prisma Client.
-   `npx prisma studio`:
    Opens a GUI in your browser to view and interact with your database data.
-   `npx prisma generate`:
    Manually generates the Prisma Client based on the schema. Usually run automatically by `migrate dev`.

### Testing (Jest)

-   `npm run test`: Runs all unit tests.
-   `npm run test:watch`: Runs unit tests in watch mode, rerunning on file changes.
-   `npm run test:cov`: Runs unit tests and generates a code coverage report.
-   `npm run test:e2e`: Runs end-to-end tests (requires separate configuration/setup).
-   `npm run test:debug`: Runs unit tests with the Node debugger attached.

### Code Formatting & Linting

-   `npm run format`: Formats code in `src` and `test` directories using Prettier.
-   `npm run lint`: Lints code in `src`, `apps`, `libs`, and `test` using ESLint and attempts to auto-fix issues.

### Building

-   `npm run build`:
    Compiles the TypeScript application to JavaScript in the `dist` folder using `nest build`.

### Code Generation (NestJS CLI)

The NestJS CLI (`nest`) can be used directly (via `npx nest ...`) for advanced tasks, primarily generating modules, controllers, services, etc. It's used internally by some npm scripts (`build`, `start`).

- `npx nest generate <schematic> <name> [options]` (or `npx nest g ...`):
Generates NestJS components.
- Example: `npx nest g module users`
- Example: `npx nest g controller users`
- Example: `npx nest g service users`

Learn more in the [NestJS CLI Usage Documentation](https://docs.nestjs.com/cli/usages#generate-alias-g).

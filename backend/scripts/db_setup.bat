@echo off
rem db_setup.bat: Creates a PostgreSQL user and database for the Superwise app.
rem Prompts the user to manually update the .env file.

rem Usage: db_setup.bat <username> <password> [database_name] [host] [port]
rem   <username>: Desired PostgreSQL username.
rem   <password>: Desired password for the new user.
rem   [database_name]: Optional. Name for the database (default: superwise).
rem   [host]: Optional. Database host (default: localhost).
rem   [port]: Optional. Database port (default: 5432).

setlocal

rem --- Configuration ---
set "DEFAULT_DB_NAME=superwise"
set "DEFAULT_HOST=localhost"
set "DEFAULT_PORT=5432"
set "ENV_FILE=..\.env" REM Relative path to the .env file

rem --- Input Validation ---
if "%~1"=="" (
    echo Usage: %~n0 ^<username^> ^<password^> [database_name] [host] [port]
    echo Error: Username is required.
    goto :eof
)
if "%~2"=="" (
    echo Usage: %~n0 ^<username^> ^<password^> [database_name] [host] [port]
    echo Error: Password is required.
    goto :eof
)

set "USERNAME=%~1"
set "PASSWORD=%~2"
set "DB_NAME=%~3"
set "HOST=%~4"
set "PORT=%~5"
set "SCHEMA=public"

if "%DB_NAME%"=="" set "DB_NAME=%DEFAULT_DB_NAME%"
if "%HOST%"=="" set "HOST=%DEFAULT_HOST%"
if "%PORT%"=="" set "PORT=%DEFAULT_PORT%"

rem --- Prerequisite Check ---
where psql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: 'psql' command not found. Please ensure PostgreSQL client tools are installed and added to your PATH.
    echo You might need to add the PostgreSQL bin directory (e.g., C:\Program Files\PostgreSQL\<version>\bin) to your system's PATH environment variable.
    goto :eof
)

rem --- Database and User Creation ---
echo Attempting to create PostgreSQL user '%USERNAME%' for database '%DB_NAME%'...
rem Use psql for user creation as 'createuser.exe' might not be in PATH or easily accessible
psql -U postgres -c "CREATE USER \"%USERNAME%\" WITH PASSWORD '%PASSWORD%' CREATEDB;" > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo User '%USERNAME%' might already exist or another error occurred.
    echo Attempting to set password and grant CREATEDB privilege...
    psql -U postgres -c "ALTER USER \"%USERNAME%\" WITH PASSWORD '%PASSWORD%' CREATEDB;"
    if %ERRORLEVEL% neq 0 (
        echo Error: Failed to set password/grant privilege for user '%USERNAME%'. Check PostgreSQL logs and permissions.
        goto :eof
    ) else (
        echo Password set and CREATEDB privilege granted for existing user '%USERNAME%'.
    )
) else (
    echo User '%USERNAME%' created successfully.
)

echo Attempting to create database '%DB_NAME%' with owner '%USERNAME%'...
rem Use psql for database creation as 'createdb.exe' might not be in PATH or easily accessible
psql -U postgres -c "CREATE DATABASE \"%DB_NAME%\" WITH OWNER = \"%USERNAME%\";" > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Database '%DB_NAME%' might already exist. Attempting to set owner...
    psql -U postgres -c "ALTER DATABASE \"%DB_NAME%\" OWNER TO \"%USERNAME%\";"
    if %ERRORLEVEL% neq 0 (
        echo Warning: Could not set owner for database '%DB_NAME%'. It might not exist or you lack permissions.
    ) else (
        echo Owner set for database '%DB_NAME%'.
    )
) else (
    echo Database '%DB_NAME%' created successfully.
)

rem --- Display Connection String and Instructions ---
set "DATABASE_URL=postgresql://%USERNAME%:%PASSWORD%@%HOST%:%PORT%/%DB_NAME%?schema=%SCHEMA%"

echo.
echo **************************************************************************
echo *
rem echo * --- Action Required --- 
rem echo * Please manually add or update the DATABASE_URL in your '%ENV_FILE%' file.
rem echo *
if not exist "%ENV_FILE%" (
    echo * Creating placeholder '%ENV_FILE%' file...
    echo # Environment variables for Superwise > "%ENV_FILE%"
    echo. >> "%ENV_FILE%"
)
rem echo *
echo * Action Required: Add or update the following line in '%ENV_FILE%':
echo *
echo * DATABASE_URL=%DATABASE_URL%
echo *
echo **************************************************************************
echo.

echo Database setup script completed.

endlocal 
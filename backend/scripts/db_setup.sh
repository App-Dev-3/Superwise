#!/bin/bash

# db_setup.sh: Creates a PostgreSQL user and database for the Superwise app,
# and attempts to configure the DATABASE_URL in the .env file.

# Usage: ./db_setup.sh <username> <password> [database_name] [host] [port]
#   <username>: Desired PostgreSQL username.
#   <password>: Desired password for the new user.
#   [database_name]: Optional. Name for the database (default: superwise).
#   [host]: Optional. Database host (default: localhost).
#   [port]: Optional. Database port (default: 5432).

# --- Configuration ---
DEFAULT_DB_NAME="superwise"
DEFAULT_HOST="localhost"
DEFAULT_PORT="5432"
ENV_FILE="../.env" # Relative path to the .env file from the script's location

# --- Input Validation ---
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <username> <password> [database_name] [host] [port]"
  echo "Error: Username and password are required."
  exit 1
fi

USERNAME=$1
PASSWORD=$2
DB_NAME=${3:-$DEFAULT_DB_NAME}
HOST=${4:-$DEFAULT_HOST}
PORT=${5:-$DEFAULT_PORT}
SCHEMA="public" # Default schema

# --- Helper Functions ---
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# --- Prerequisite Check ---
if ! command_exists psql; then
  echo "Error: 'psql' command not found. Please ensure PostgreSQL client tools are installed and in your PATH."
  echo "On macOS with Homebrew, try: brew install postgresql"
  exit 1
fi

if ! command_exists createuser; then
    echo "Error: 'createuser' command not found. Please ensure PostgreSQL server tools are installed and in your PATH."
    echo "On macOS with Homebrew, try: brew install postgresql"
    exit 1
fi

if ! command_exists createdb; then
    echo "Error: 'createdb' command not found. Please ensure PostgreSQL server tools are installed and in your PATH."
    echo "On macOS with Homebrew, try: brew install postgresql"
    exit 1
fi


# --- Database and User Creation ---
echo "Attempting to create PostgreSQL user '$USERNAME' for database '$DB_NAME'..."
if createuser --createdb "$USERNAME"; then
  echo "User '$USERNAME' created successfully or already exists."
else
  echo "Failed to create user '$USERNAME'. Check PostgreSQL permissions or if the user already exists without CREATEDB privilege."
  # Attempting to grant CREATEDB just in case the user exists but lacks the permission
  psql -d postgres -c "ALTER USER \"$USERNAME\" CREATEDB;" || echo "Could not grant CREATEDB to user '$USERNAME'."
fi

echo "Setting password for user '$USERNAME'..."
# Use standard_conforming_strings=on to handle potential special characters in password
psql -d postgres -c "SET standard_conforming_strings=on; ALTER USER \"$USERNAME\" WITH PASSWORD '$PASSWORD';"
if [ $? -ne 0 ]; then
  echo "Error: Failed to set password for user '$USERNAME'. Check privileges."
  exit 1
fi
echo "Password set successfully."

echo "Attempting to create database '$DB_NAME' with owner '$USERNAME'..."
if createdb --owner="$USERNAME" "$DB_NAME"; then
  echo "Database '$DB_NAME' created successfully."
else
  echo "Database '$DB_NAME' might already exist. Attempting to set owner..."
  psql -d postgres -c "ALTER DATABASE \"$DB_NAME\" OWNER TO \"$USERNAME\";"
  if [ $? -ne 0 ]; then
    echo "Warning: Could not set owner for database '$DB_NAME'. It might not exist or you lack permissions."
  else
    echo "Owner set for database '$DB_NAME'."
  fi
fi


# --- .env File Update ---
DATABASE_URL="postgresql://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME}?schema=${SCHEMA}"
echo "Database connection string for '$DB_NAME': $DATABASE_URL"

if [ ! -f "$ENV_FILE" ]; then
  echo "Creating '$ENV_FILE'..."
  touch "$ENV_FILE"
fi

echo "Attempting to update '$ENV_FILE' with DATABASE_URL..."

# Escape potential special characters in the URL for sed
ESCAPED_DATABASE_URL=$(printf '%s\n' "$DATABASE_URL" | sed -e 's/[\/&]/\\&/g')

if grep -q '^DATABASE_URL=' "$ENV_FILE"; then
  # Variable exists, replace the line
  echo "Updating existing DATABASE_URL in $ENV_FILE..."
  sed -i.bak "s/^DATABASE_URL=.*/DATABASE_URL=${ESCAPED_DATABASE_URL}/" "$ENV_FILE"
  rm "${ENV_FILE}.bak" # Remove backup file on success
else
  # Variable doesn't exist, append it
  echo "Adding DATABASE_URL to $ENV_FILE..."
  echo "" >> "$ENV_FILE" # Add a newline for separation
  echo "DATABASE_URL=${DATABASE_URL}" >> "$ENV_FILE"
fi

if [ $? -eq 0 ]; then
    echo "Successfully updated DATABASE_URL in '$ENV_FILE'."
else
    echo "Error: Failed to update '$ENV_FILE'. Please manually set:"
    echo "DATABASE_URL=${DATABASE_URL}"
    exit 1 # Exit with error if sed failed
fi

echo "Database setup script completed successfully."
exit 0 
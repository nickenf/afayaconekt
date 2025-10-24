#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
while ! pg_isready -h db -U afyaconnect_user -d afyaconnect; do
  sleep 1
done

echo "Database is ready!"

# Run database migrations/initialization if needed
# (Add your migration commands here)

# Start the backend server
echo "Starting AfyaConnect backend..."
cd backend && npm start &

# Start nginx for frontend
echo "Starting nginx for frontend..."
nginx -g "daemon off;" &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
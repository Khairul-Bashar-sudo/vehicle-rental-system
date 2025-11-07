#!/bin/sh
set -e

echo "Starting MySQL/MariaDB server..."

# Start MySQL/MariaDB server in the background
mysqld --user=mysql --datadir=/var/lib/mysql --skip-networking=0 --bind-address=0.0.0.0 --skip-grant-tables &
MYSQL_PID=$!

echo "Waiting for MySQL to be ready..."
sleep 5

# Wait for MySQL to be ready
until mysqladmin ping -h localhost --silent > /dev/null 2>&1; do
  echo "MySQL is unavailable - sleeping"
  sleep 2
done

echo "MySQL is up - initializing database..."

# Set root password and create database user (no password needed with skip-grant-tables)
mysql -u root <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'rootpassword';
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
EOF

# Restart MySQL without skip-grant-tables
echo "Restarting MySQL with authentication enabled..."
kill $MYSQL_PID
wait $MYSQL_PID || true
sleep 2

mysqld --user=mysql --datadir=/var/lib/mysql --skip-networking=0 --bind-address=0.0.0.0 &
MYSQL_PID=$!

sleep 3

echo "Database ready - calling initialization API..."

# Start the Next.js server in the background
yarn start &
SERVER_PID=$!

# Wait for the server to be ready
echo "Waiting for Next.js server to start..."
sleep 10

# Initialize database schema via API
echo "Initializing database schema and seed data..."
wget --post-data='' http://localhost:3000/api/init-db -O - 2>/dev/null || echo "Database initialization API call completed"

echo "Setup complete - server is running"

# Keep both MySQL and Next.js running
wait -n $MYSQL_PID $SERVER_PID

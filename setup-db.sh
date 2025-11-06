#!/bin/bash

# Vehicle Rental System - Database Setup Script
# This script helps automate the MySQL database setup

set -e

echo "🚗 Vehicle Rental System - Database Setup"
echo "=========================================="
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt update && sudo apt install mysql-server"
    echo ""
    echo "macOS:"
    echo "  brew install mysql"
    echo ""
    exit 1
fi

echo "✅ MySQL is installed"
echo ""

# Get MySQL credentials
read -p "Enter MySQL root username [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Enter MySQL root password: " DB_PASSWORD
echo ""

read -p "Enter database name [vehicle_rental]: " DB_NAME
DB_NAME=${DB_NAME:-vehicle_rental}

read -p "Enter admin username [admin]: " ADMIN_USERNAME
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}

read -sp "Enter admin password [admin123]: " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
echo ""
echo ""

# Create database
echo "Creating database..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' created successfully"
else
    echo "❌ Failed to create database. Please check your credentials."
    exit 1
fi

# Create .env.local file
echo ""
echo "Creating .env.local file..."
cat > .env.local << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# Admin Authentication
ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD

# API URL (for production deployment)
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

echo "✅ .env.local file created"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    if command -v yarn &> /dev/null; then
        yarn install
    else
        npm install
    fi
    echo "✅ Dependencies installed"
    echo ""
fi

echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start the development server:"
echo "   yarn dev (or npm run dev)"
echo ""
echo "2. Open http://localhost:3000 in your browser"
echo ""
echo "3. Go to http://localhost:3000/admin and login with:"
echo "   Username: $ADMIN_USERNAME"
echo "   Password: ****"
echo ""
echo "4. Click 'Initialize Database' button to create tables and seed data"
echo ""
echo "Happy coding! 🚀"

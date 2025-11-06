# Database Setup Instructions

This document provides instructions for setting up the MySQL database for the Vehicle Rental System.

## Prerequisites

- MySQL 8.0 or higher installed
- Node.js 18+ and npm/yarn

## Setup Steps

### 1. Install MySQL

If you don't have MySQL installed:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Windows:**
Download and install from [MySQL official website](https://dev.mysql.com/downloads/mysql/)

### 2. Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

### 3. Create Database

Login to MySQL:
```bash
mysql -u root -p
```

Create the database:
```sql
CREATE DATABASE vehicle_rental;
EXIT;
```

### 4. Configure Environment Variables

Update the `.env.local` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vehicle_rental

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 5. Install Dependencies

```bash
yarn install
# or
npm install
```

### 6. Initialize Database Tables

Start the development server:
```bash
yarn dev
# or
npm run dev
```

Then initialize the database by visiting:
- Open your browser and go to `http://localhost:3000/admin`
- Login with credentials (default: username: `admin`, password: `admin123`)
- Click the "Initialize Database" button

This will:
- Create all necessary tables (vehicles, bookings, admin_users)
- Seed the database with initial vehicle data

### 7. Verify Setup

Check that tables were created:
```bash
mysql -u root -p vehicle_rental

SHOW TABLES;
SELECT * FROM vehicles;
EXIT;
```

## Admin Panel

Access the admin panel at: `http://localhost:3000/admin`

Default credentials:
- Username: `admin`
- Password: `admin123`

**⚠️ Important:** Change these credentials in production!

## Features

### Admin Panel Capabilities:
- ✅ Add new vehicles
- ✅ Edit existing vehicles (name, type, seats, price, availability)
- ✅ Delete vehicles
- ✅ View all vehicles in a table format
- ✅ Initialize/reset database

### API Endpoints:
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/[id]` - Get single vehicle
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Delete vehicle
- `POST /api/init-db` - Initialize database tables

## Database Schema

### Vehicles Table
```sql
CREATE TABLE vehicles (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  seats INT NOT NULL,
  pricePerDay DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500),
  description TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id VARCHAR(255) NOT NULL,
  vehicle_name VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
```

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check MySQL is running:**
```bash
sudo systemctl status mysql
```

2. **Verify credentials:**
```bash
mysql -u root -p
```

3. **Check firewall:**
```bash
sudo ufw allow 3306
```

4. **Reset MySQL password if needed:**
```bash
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

### Permission Errors

If you get permission denied errors:

```sql
GRANT ALL PRIVILEGES ON vehicle_rental.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Port Already in Use

If port 3306 is already in use:
```bash
sudo lsof -i :3306
# Kill the process or change DB_PORT in .env.local
```

## Production Deployment

For production:

1. Use environment variables for all sensitive data
2. Change default admin credentials
3. Use SSL/TLS for database connections
4. Implement proper authentication (e.g., NextAuth.js)
5. Add rate limiting to API routes
6. Enable database backups
7. Use connection pooling (already implemented)

## Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [mysql2 Package](https://github.com/sidorares/node-mysql2)

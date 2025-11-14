# SQL Queries Documentation - Vehicle Rental System

This document contains all SQL queries used in the Vehicle Rental System Next.js application, organized by functionality.

---

## Table of Contents

1. [Database Schema Creation](#database-schema-creation)
2. [Vehicle Management](#vehicle-management)
3. [User Management](#user-management)
4. [Authentication & Sessions](#authentication--sessions)
5. [Booking Management](#booking-management)
6. [Admin Operations](#admin-operations)

---

## Database Schema Creation

### Create Vehicles Table

**Location:** `lib/db.ts` - `initializeDatabase()`

```sql
CREATE TABLE IF NOT EXISTS vehicles (
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
)
```

**Purpose:** Stores all vehicle information including pricing, availability, and metadata.

**Fields:**
- `id`: Unique identifier for each vehicle (e.g., "sedan-1", "suv-1")
- `name`: Display name of the vehicle
- `type`: Vehicle category (Sedan, SUV, Van, Coupe, Motorcycle)
- `seats`: Number of passengers the vehicle can accommodate
- `pricePerDay`: Daily rental price in dollars
- `image`: Path to vehicle image
- `description`: Detailed vehicle description
- `available`: Boolean flag indicating if vehicle is available for rent
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last modified

---

### Create Users Table

**Location:** `lib/db.ts` - `initializeDatabase()`

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Purpose:** Stores registered user accounts.

**Fields:**
- `id`: Auto-incrementing primary key
- `name`: User's full name
- `email`: Unique email address (used for login)
- `password_hash`: Hashed password using crypto (never stores plain text)
- `phone`: Optional phone number
- `created_at`: Account creation timestamp

---

### Create Sessions Table

**Location:** `lib/db.ts` - `initializeDatabase()`

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_token (session_token),
  INDEX idx_expires_at (expires_at)
)
```

**Purpose:** Manages user authentication sessions.

**Fields:**
- `id`: Auto-incrementing primary key
- `user_id`: Reference to users table
- `session_token`: Hashed token stored in HTTP-only cookie
- `expires_at`: Session expiration time (30 days from creation)
- `created_at`: Session creation timestamp

**Indexes:**
- `idx_session_token`: Fast lookup by session token
- `idx_expires_at`: Efficient expiration checking

**Constraints:**
- Foreign key cascade delete: removes sessions when user is deleted

---

### Create Admin Users Table

**Location:** `lib/db.ts` - `initializeDatabase()`

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Purpose:** Stores admin accounts for administrative dashboard access.

**Fields:**
- `id`: Auto-incrementing primary key
- `username`: Unique admin username
- `password_hash`: Hashed admin password
- `created_at`: Account creation timestamp

**Note:** Currently using environment variables for simplicity. This table is prepared for future admin user management.

---

### Create Bookings Table

**Location:** `lib/db.ts` - `initializeDatabase()`

```sql
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id VARCHAR(255) NOT NULL,
  vehicle_name VARCHAR(255) NOT NULL,
  user_id INT,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
)
```

**Purpose:** Stores all vehicle booking/reservation records.

**Fields:**
- `id`: Auto-incrementing primary key
- `vehicle_id`: Reference to booked vehicle
- `vehicle_name`: Denormalized vehicle name for historical records
- `user_id`: Reference to user who made the booking (nullable)
- `customer_name`: Name of the customer
- `customer_email`: Contact email
- `customer_phone`: Contact phone number
- `start_date`: Rental start date
- `end_date`: Rental end date
- `days`: Number of rental days
- `total_price`: Total booking price
- `created_at`: Booking creation timestamp

**Constraints:**
- Cascade delete when vehicle is deleted
- Set NULL when user is deleted (preserves booking history)

---

## Vehicle Management

### Get All Vehicles (with Filtering and Sorting)

**Location:** `app/api/vehicles/route.ts` - `GET`

```sql
SELECT * FROM vehicles
WHERE [conditions]
ORDER BY [sort_field] [ASC|DESC]
```

**Dynamic WHERE Conditions:**

```sql
-- Filter by vehicle type
type = ?

-- Filter by minimum seats
seats >= ?

-- Filter by maximum price
pricePerDay <= ?

-- Filter by availability (available only)
available = 1

-- Filter by availability (unavailable only)
available = 0
```

**Dynamic ORDER BY Options:**

```sql
-- Sort by name (default)
ORDER BY name ASC

-- Sort by price (low to high)
ORDER BY pricePerDay ASC

-- Sort by price (high to low)
ORDER BY pricePerDay DESC

-- Sort by seats (low to high)
ORDER BY seats ASC

-- Sort by seats (high to low)
ORDER BY seats DESC
```

**Example Combined Query:**

```sql
-- Get SUVs with 5+ seats under $100/day, sorted by price
SELECT * FROM vehicles
WHERE type = 'SUV' 
  AND seats >= 5 
  AND pricePerDay <= 100
ORDER BY pricePerDay ASC
```

**Parameters:** Dynamic array based on filters applied

**Returns:** Array of vehicle objects matching the criteria

---

### Get Single Vehicle by ID

**Location:** `app/api/vehicles/[id]/route.ts` - `GET`

```sql
SELECT * FROM vehicles 
WHERE id = ?
```

**Parameters:** `[vehicleId]`

**Example:**
```sql
SELECT * FROM vehicles WHERE id = 'sedan-1'
```

**Returns:** Single vehicle object or 404 if not found

---

### Insert New Vehicle

**Location:** `app/api/vehicles/route.ts` - `POST`

```sql
INSERT INTO vehicles (id, name, type, seats, pricePerDay, image, description, available)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
```

**Parameters:** `[id, name, type, seats, pricePerDay, image, description, available]`

**Example:**
```sql
INSERT INTO vehicles (id, name, type, seats, pricePerDay, image, description, available)
VALUES ('sedan-5', 'Honda Accord', 'Sedan', 5, 55.00, '/images/accord.jpg', 
        'Reliable midsize sedan with excellent fuel economy.', true)
```

**Constraints:**
- `id` must be unique (PRIMARY KEY)
- Will return error 409 if duplicate ID

---

### Update Vehicle

**Location:** `app/api/vehicles/[id]/route.ts` - `PUT`

```sql
UPDATE vehicles 
SET name = ?, 
    type = ?, 
    seats = ?, 
    pricePerDay = ?, 
    image = ?, 
    description = ?, 
    available = ?
WHERE id = ?
```

**Parameters:** `[name, type, seats, pricePerDay, image, description, available, id]`

**Example:**
```sql
UPDATE vehicles 
SET name = 'Honda Accord Sport', 
    type = 'Sedan', 
    seats = 5, 
    pricePerDay = 60.00, 
    image = '/images/accord-sport.jpg', 
    description = 'Sporty midsize sedan with upgraded features.', 
    available = true
WHERE id = 'sedan-5'
```

**Returns:** Success message or 404 if vehicle not found

---

### Delete Vehicle

**Location:** `app/api/vehicles/[id]/route.ts` - `DELETE`

```sql
DELETE FROM vehicles 
WHERE id = ?
```

**Parameters:** `[vehicleId]`

**Example:**
```sql
DELETE FROM vehicles WHERE id = 'sedan-5'
```

**Note:** Cascade deletes associated bookings due to FOREIGN KEY constraint

---

### Seed Initial Vehicle Data

**Location:** `app/api/init-db/route.ts` - `POST`

```sql
-- Check if vehicles table is empty
SELECT COUNT(*) as count FROM vehicles
```

```sql
-- Insert initial vehicle data (repeated for each vehicle)
INSERT INTO vehicles (id, name, type, seats, pricePerDay, image, description, available)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
```

**Initial Vehicle Seed Data:**

1. **Compact Sedan** - 'sedan-1', 5 seats, $45/day
2. **Family SUV** - 'suv-1', 7 seats, $85/day
3. **Cargo Van** - 'van-1', 2 seats, $70/day
4. **Luxury Coupe** - 'lux-1', 4 seats, $160/day
5. **Kawasaki Ninja H2** - 'bike-1', 2 seats, $200/day
6. **Royal Enfield Continental GT 650** - 'bike-2', 2 seats, $75/day
7. **Ducati Panigale V4** - 'bike-3', 2 seats, $250/day
8. **Harley-Davidson Street Glide** - 'bike-4', 2 seats, $120/day
9. **BMW S 1000 RR** - 'bike-5', 2 seats, $180/day

---

## User Management

### Create New User (Signup)

**Location:** `app/api/auth/signup/route.ts` - `POST`

```sql
-- Check if user already exists
SELECT id FROM users 
WHERE email = ?
```

```sql
-- Create new user
INSERT INTO users (name, email, password_hash, phone)
VALUES (?, ?, ?, ?)
```

**Parameters:** `[name, email, hashedPassword, phone]`

**Example:**
```sql
-- Check existence
SELECT id FROM users WHERE email = 'john.doe@example.com'

-- If not exists, insert
INSERT INTO users (name, email, password_hash, phone)
VALUES ('John Doe', 'john.doe@example.com', 
        '$2a$10$...hashedPassword...', '+1234567890')
```

**Validation:**
- Email format validation (regex)
- Password minimum 6 characters
- Returns 409 if email already exists

---

### Find User by Email (Login)

**Location:** `app/api/auth/login/route.ts` - `POST`

```sql
SELECT * FROM users 
WHERE email = ?
```

**Parameters:** `[email]`

**Example:**
```sql
SELECT * FROM users WHERE email = 'john.doe@example.com'
```

**Process:**
1. Find user by email
2. Verify password hash matches
3. Generate session token if valid
4. Return 401 if invalid credentials

---

### Get User by ID

**Location:** `app/api/auth/session/route.ts` - `GET`

```sql
SELECT id, name, email 
FROM users 
WHERE id = ?
```

**Parameters:** `[userId]`

**Example:**
```sql
SELECT id, name, email FROM users WHERE id = 42
```

**Returns:** User object without password hash

---

## Authentication & Sessions

### Create Session (Login)

**Location:** `app/api/auth/login/route.ts` - `POST`

```sql
INSERT INTO sessions (user_id, session_token, expires_at) 
VALUES (?, ?, ?)
```

**Parameters:** `[userId, hashedSessionToken, expiresAt]`

**Example:**
```sql
INSERT INTO sessions (user_id, session_token, expires_at) 
VALUES (42, 'a1b2c3d4e5f6...hashedToken...', '2025-12-07 10:30:00')
```

**Notes:**
- Session token is randomly generated and hashed
- Expiration set to 30 days from creation
- Token stored in HTTP-only cookie on client

---

### Validate Session

**Location:** `app/api/auth/session/route.ts` - `GET`

```sql
SELECT user_id, expires_at 
FROM sessions 
WHERE session_token = ?
```

**Parameters:** `[hashedSessionToken]`

**Example:**
```sql
SELECT user_id, expires_at 
FROM sessions 
WHERE session_token = 'a1b2c3d4e5f6...hashedToken...'
```

**Process:**
1. Retrieve session from cookie
2. Hash the token
3. Query session from database
4. Check if expired
5. Delete if expired, return user if valid

---

### Verify Active Session

**Location:** `app/api/bookings/route.ts` - `GET` and `POST`

```sql
SELECT user_id 
FROM sessions 
WHERE session_token = ? 
  AND expires_at > NOW()
```

**Parameters:** `[hashedSessionToken]`

**Example:**
```sql
SELECT user_id 
FROM sessions 
WHERE session_token = 'a1b2c3d4e5f6...hashedToken...' 
  AND expires_at > NOW()
```

**Purpose:** Verifies user is authenticated before accessing protected resources

---

### Delete Session (Logout)

**Location:** `app/api/auth/logout/route.ts` - `POST`

```sql
DELETE FROM sessions 
WHERE session_token = ?
```

**Parameters:** `[hashedSessionToken]`

**Example:**
```sql
DELETE FROM sessions 
WHERE session_token = 'a1b2c3d4e5f6...hashedToken...'
```

**Also:** Clears the session cookie on client side

---

### Delete Expired Session

**Location:** `app/api/auth/session/route.ts` - `GET`

```sql
DELETE FROM sessions 
WHERE session_token = ?
```

**Parameters:** `[hashedSessionToken]`

**Triggered when:** Session is found but expiration date has passed

---

## Booking Management

### Get User's Bookings

**Location:** `app/api/bookings/route.ts` - `GET`

```sql
SELECT * FROM bookings 
WHERE user_id = ? 
ORDER BY created_at DESC
```

**Parameters:** `[userId]`

**Example:**
```sql
SELECT * FROM bookings 
WHERE user_id = 42 
ORDER BY created_at DESC
```

**Returns:** Array of all bookings for the authenticated user, newest first

**Authentication:** Requires valid session token

---

### Create New Booking

**Location:** `app/api/bookings/route.ts` - `POST`

```sql
INSERT INTO bookings 
  (vehicle_id, vehicle_name, user_id, customer_name, customer_email, 
   customer_phone, start_date, end_date, days, total_price) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

**Parameters:** 
```
[vehicleId, vehicleName, userId, customerName, customerEmail, 
 customerPhone, startDate, endDate, days, totalPrice]
```

**Example:**
```sql
INSERT INTO bookings 
  (vehicle_id, vehicle_name, user_id, customer_name, customer_email, 
   customer_phone, start_date, end_date, days, total_price) 
VALUES ('sedan-1', 'Compact Sedan', 42, 'John Doe', 'john.doe@example.com',
        '+1234567890', '2025-11-10', '2025-11-15', 5, 225.00)
```

**Returns:** Booking confirmation with generated booking ID

**Authentication:** Requires valid session token

**Validation:**
- All fields are required
- User must be authenticated
- Dates must be valid

---

## Admin Operations

### Get All Bookings (Admin)

**Location:** `app/api/admin/bookings/route.ts` - `GET`

```sql
SELECT * FROM bookings 
ORDER BY created_at DESC
```

**No Parameters**

**Returns:** All bookings in the system, sorted by most recent

**Purpose:** Admin dashboard to view all customer bookings

---

### Delete Booking (Admin)

**Location:** `app/api/admin/bookings/route.ts` - `DELETE`

```sql
DELETE FROM bookings 
WHERE id = ?
```

**Parameters:** `[bookingId]`

**Example:**
```sql
DELETE FROM bookings WHERE id = 123
```

**Purpose:** Allow admins to cancel/remove bookings

---

## Query Performance Optimizations

### Indexes

1. **sessions.session_token** - B-tree index for fast session lookups
2. **sessions.expires_at** - B-tree index for efficient expiration checks
3. **users.email** - Unique constraint provides implicit index
4. **vehicles.id** - Primary key provides implicit index

### Foreign Key Constraints

1. **bookings.vehicle_id → vehicles.id**
   - ON DELETE CASCADE: Removes bookings when vehicle is deleted

2. **bookings.user_id → users.id**
   - ON DELETE SET NULL: Preserves booking history when user is deleted

3. **sessions.user_id → users.id**
   - ON DELETE CASCADE: Removes sessions when user is deleted

---

## Database Connection Configuration

**Location:** `lib/db.ts` - `getPool()`

```typescript
mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vehicle_rental',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})
```

**Environment Variables:**
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 3306)
- `DB_USER` - Database username (default: root)
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (default: vehicle_rental)

---

## Security Best Practices

1. **Password Hashing**: All passwords are hashed using Node.js crypto module before storage
2. **Session Tokens**: Hashed before storage in database
3. **Prepared Statements**: All queries use parameterized queries to prevent SQL injection
4. **HTTP-Only Cookies**: Session tokens stored in HTTP-only cookies, not accessible via JavaScript
5. **Foreign Key Constraints**: Maintain referential integrity
6. **Email Uniqueness**: Prevents duplicate user accounts
7. **Session Expiration**: Automatic cleanup of expired sessions

---

## Common Query Patterns

### Authentication Flow

```sql
-- 1. User signs up
INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)

-- 2. User logs in
SELECT * FROM users WHERE email = ?

-- 3. Create session
INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)

-- 4. Validate session on each request
SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW()

-- 5. User logs out
DELETE FROM sessions WHERE session_token = ?
```

### Booking Flow

```sql
-- 1. Browse vehicles with filters
SELECT * FROM vehicles 
WHERE type = 'SUV' AND seats >= 5 
ORDER BY pricePerDay ASC

-- 2. View vehicle details
SELECT * FROM vehicles WHERE id = 'suv-1'

-- 3. Create booking (authenticated)
INSERT INTO bookings 
  (vehicle_id, vehicle_name, user_id, customer_name, customer_email, 
   customer_phone, start_date, end_date, days, total_price) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

-- 4. View user's bookings
SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC
```

### Admin Flow

```sql
-- 1. View all bookings
SELECT * FROM bookings ORDER BY created_at DESC

-- 2. View all vehicles
SELECT * FROM vehicles ORDER BY name ASC

-- 3. Add new vehicle
INSERT INTO vehicles (id, name, type, seats, pricePerDay, image, description, available)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)

-- 4. Update vehicle
UPDATE vehicles 
SET name = ?, type = ?, seats = ?, pricePerDay = ?, 
    image = ?, description = ?, available = ?
WHERE id = ?

-- 5. Delete vehicle
DELETE FROM vehicles WHERE id = ?

-- 6. Delete booking
DELETE FROM bookings WHERE id = ?
```

---

## Database Initialization

Run the initialization endpoint to create all tables and seed initial data:

**Endpoint:** `POST /api/init-db`

**What it does:**
1. Creates all required tables (vehicles, users, sessions, admin_users, bookings)
2. Checks if vehicles table is empty
3. Seeds initial vehicle data if empty
4. Returns success confirmation

**Manual Database Setup:**

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE vehicle_rental;

# Use database
USE vehicle_rental;

# Run initialization via API or manually execute CREATE TABLE statements
```

---

## Maintenance Queries

### Clean Up Expired Sessions

```sql
DELETE FROM sessions WHERE expires_at < NOW()
```

### View Database Statistics

```sql
-- Count vehicles by type
SELECT type, COUNT(*) as count, AVG(pricePerDay) as avg_price
FROM vehicles 
GROUP BY type

-- Count bookings by month
SELECT 
  DATE_FORMAT(created_at, '%Y-%m') as month,
  COUNT(*) as booking_count,
  SUM(total_price) as total_revenue
FROM bookings 
GROUP BY month 
ORDER BY month DESC

-- Active users
SELECT COUNT(*) as active_users 
FROM sessions 
WHERE expires_at > NOW()

-- Available vs unavailable vehicles
SELECT available, COUNT(*) as count 
FROM vehicles 
GROUP BY available
```

---

## Troubleshooting

### Common Issues

1. **Connection Error**: Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD environment variables
2. **Table Not Found**: Run `POST /api/init-db` to initialize database
3. **Foreign Key Constraint**: Ensure referenced records exist before insertion
4. **Duplicate Entry**: Check for unique constraints on id, email, session_token

### Debug Queries

```sql
-- Show all tables
SHOW TABLES;

-- Describe table structure
DESCRIBE vehicles;
DESCRIBE users;
DESCRIBE sessions;
DESCRIBE bookings;

-- Check indexes
SHOW INDEX FROM sessions;

-- Check foreign keys
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'vehicle_rental'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Database:** MySQL/MariaDB  
**Application:** Vehicle Rental System - Next.js 16

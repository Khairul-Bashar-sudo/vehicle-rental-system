# Vehicle Rental System

A modern web application for renting vehicles online. Built with Next.js, React, MySQL, and TypeScript.

## What This Project Does

Think of it as an online platform where customers can browse and book vehicles. The system has a user-friendly interface for browsing cars and an admin panel for managing inventory.

### For Customers

- Browse all available vehicles
- Filter by type, price, and capacity
- Create an account and login
- Book a vehicle for specific dates
- Track booking history

### For Admins

- Login to the admin panel
- Add new vehicles to the system
- Edit or delete existing vehicles
- Manage vehicle availability
- Initialize the database with sample data

## Project Structure

```
├── app/
│   ├── page.tsx                 → Homepage
│   ├── vehicles/                → Vehicle browsing pages
│   ├── bookings/                → Customer booking history
│   ├── login/ & signup/         → User authentication pages
│   ├── admin/                   → Admin management dashboard
│   ├── contact/                 → Contact page
│   ├── api/                     → Backend API routes
│   │   ├── vehicles/            → Vehicle CRUD operations
│   │   ├── bookings/            → Booking operations
│   │   ├── auth/                → User authentication
│   │   └── admin/               → Admin operations
│   └── components/              → Reusable React components
├── lib/
│   ├── db.ts                    → Database connection & queries
│   ├── auth.ts                  → Authentication helpers
│   └── AuthContext.tsx          → Authentication context
├── data/
│   └── vehicles.ts              → Sample vehicle data
├── public/
│   └── images/ & uploads/       → Static files
└── types/
    └── vehicle.ts              → TypeScript type definitions
```

## Technology Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Backend:** Next.js API Routes
- **Database:** MySQL
- **Styling:** CSS Modules
- **Authentication:** Custom session-based (cookies)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL server running locally or accessible
- npm or yarn package manager

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env.local` file in the project root:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=vehicle_rental
   
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

3. **Create the MySQL database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE vehicle_rental;
   EXIT;
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Visit the application:**
   - Homepage: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

6. **Initialize the database:**
   - Go to http://localhost:3000/admin
   - Login with admin/admin123
   - Click "Initialize Database" to create tables and sample data

## How It Works

### User Flow

#### Browsing & Booking (Customers)

1. User visits homepage and clicks "Browse Vehicles"
2. Sees all vehicles with filters (type, price, seats)
3. Clicks on a vehicle to see details
4. Needs to login/signup to make a booking
5. Fills in dates and confirms booking
6. Can view all their bookings in the Bookings page

#### Admin Management

1. Admin visits `/admin` and logs in
2. Views all vehicles in a table format
3. Can add new vehicles with details
4. Can edit existing vehicle information
5. Can toggle vehicle availability
6. Can delete vehicles from the system

### Data Flow

```
User Request (Browser)
        ↓
Next.js Page Component
        ↓
API Route Handler
        ↓
Database Query
        ↓
MySQL Database
        ↓
Returns Result
        ↓
JSON Response → React Component → Display to User
```

## Database Schema

The system uses 5 main tables:

### 1. Vehicles Table
Stores all vehicle information.

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
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

**Key Queries:**

- **Get all vehicles:**
  ```sql
  SELECT * FROM vehicles ORDER BY name ASC
  ```
  Used in: Vehicles listing page

- **Get filtered vehicles:**
  ```sql
  SELECT * FROM vehicles
  WHERE type = ? AND seats >= ? AND pricePerDay <= ?
  ORDER BY pricePerDay ASC
  ```
  Used in: Vehicle filter component with dynamic parameters

- **Get single vehicle:**
  ```sql
  SELECT * FROM vehicles WHERE id = ?
  ```
  Used in: Vehicle detail page

- **Create vehicle:**
  ```sql
  INSERT INTO vehicles (id, name, type, seats, pricePerDay, image, description, available, quantity)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ```
  Used in: Admin panel - Add Vehicle

- **Update vehicle:**
  ```sql
  UPDATE vehicles
  SET name = ?, type = ?, seats = ?, pricePerDay = ?, image = ?, description = ?, available = ?, quantity = ?
  WHERE id = ?
  ```
  Used in: Admin panel - Edit Vehicle

- **Delete vehicle:**
  ```sql
  DELETE FROM vehicles WHERE id = ?
  ```
  Used in: Admin panel - Delete Vehicle

### 2. Users Table
Stores customer account information.

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Key Queries:**

- **Check if email exists:**
  ```sql
  SELECT id FROM users WHERE email = ?
  ```
  Used in: Signup validation

- **Get user by email:**
  ```sql
  SELECT * FROM users WHERE email = ?
  ```
  Used in: Login authentication

- **Create new user:**
  ```sql
  INSERT INTO users (name, email, password_hash, phone)
  VALUES (?, ?, ?, ?)
  ```
  Used in: User signup

### 3. Sessions Table
Manages user login sessions (who is logged in).

```sql
CREATE TABLE sessions (
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

**Key Queries:**

- **Verify user session:**
  ```sql
  SELECT user_id FROM sessions
  WHERE session_token = ? AND expires_at > NOW()
  ```
  Used in: Every protected API route (bookings, user profile)

- **Create new session:**
  ```sql
  INSERT INTO sessions (user_id, session_token, expires_at)
  VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
  ```
  Used in: Login endpoint

- **Clean up expired sessions:**
  ```sql
  DELETE FROM sessions WHERE expires_at < NOW()
  ```
  Used in: Maintenance (manual cleanup)

### 4. Bookings Table
Stores all vehicle rental reservations.

```sql
CREATE TABLE bookings (
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

**Key Queries:**

- **Get user's bookings:**
  ```sql
  SELECT * FROM bookings
  WHERE user_id = ?
  ORDER BY created_at DESC
  ```
  Used in: User bookings page

- **Check vehicle availability:**
  ```sql
  SELECT COUNT(*) as booked_count
  FROM bookings
  WHERE vehicle_id = ?
    AND start_date <= ?
    AND end_date >= ?
  ```
  Used in: Booking validation (count overlapping bookings)

- **Create new booking:**
  ```sql
  INSERT INTO bookings (vehicle_id, vehicle_name, user_id, customer_name, customer_email, customer_phone, start_date, end_date, days, total_price)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ```
  Used in: Booking creation endpoint

- **Get booking details:**
  ```sql
  SELECT * FROM bookings WHERE id = ?
  ```
  Used in: Booking confirmation page

### 5. Admin Users Table
Stores admin credentials.

```sql
CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Key Query:**

- **Admin login:**
  ```sql
  SELECT * FROM admin_users WHERE username = ?
  ```
  Used in: Admin panel authentication

## Key Features Explained

### Authentication

The app uses **session-based authentication** with HTTP-only cookies:

1. User logs in with email and password
2. Password is hashed using PBKDF2 (never stored as plain text)
3. A session token is created and stored in the database
4. Token is sent to browser as an HTTP-only cookie
5. On next request, token is verified against database
6. Session expires after 30 days

**Security features:**
- Passwords hashed with salt (PBKDF2)
- Session tokens hashed before storage
- HTTP-only cookies (can't be accessed by JavaScript)
- Sessions automatically expire

### Vehicle Filtering

When users filter vehicles, the system:

1. Reads filter parameters from URL (type, price, seats, etc.)
2. Builds a SQL WHERE clause dynamically
3. Applies sorting (by name, price, or seats)
4. Returns matching vehicles

**Supported filters:**
- Vehicle type (Sedan, SUV, Van, etc.)
- Minimum seats (1+)
- Maximum price per day
- Availability (available/unavailable)
- Sorting options (name, price, seats)

### Booking System

When a customer books a vehicle:

1. Checks if user is logged in
2. Verifies vehicle availability for requested dates
3. Counts overlapping bookings
4. Compares against vehicle quantity
5. If space available, creates booking record
6. Calculates total price = daily rate × number of days

**Availability logic:**
- Each vehicle has a `quantity` (e.g., 3 Sedans available)
- Bookings check for overlapping date ranges
- Can accept bookings if quantity > booked count for those dates

## API Endpoints

### Public Endpoints (No Login Required)

**GET /api/vehicles**
- Returns all vehicles or filtered results
- Accepts query parameters: type, minSeats, maxPrice, availability, sortBy

**GET /api/vehicles/[id]**
- Returns details of a single vehicle

**POST /api/auth/signup**
- Create new user account
- Body: { name, email, password, phone }

**POST /api/auth/login**
- User login
- Body: { email, password }

**GET /api/auth/session**
- Check if user is logged in
- Returns current user info

### Protected Endpoints (Login Required)

**GET /api/bookings**
- Get current user's bookings
- Requires valid session

**POST /api/bookings**
- Create new booking
- Body: { vehicleId, startDate, endDate, ... }

**PUT /api/bookings/[id]**
- Update booking details

**DELETE /api/bookings/[id]**
- Cancel booking

### Admin Endpoints

**POST /api/admin/auth**
- Admin login
- Body: { username, password }

**POST /api/vehicles**
- Admin: Create new vehicle
- Body: { id, name, type, seats, pricePerDay, image, description, available, quantity }

**PUT /api/vehicles/[id]**
- Admin: Update vehicle details

**DELETE /api/vehicles/[id]**
- Admin: Delete vehicle

**POST /api/init-db**
- Admin: Initialize database with tables and sample data

## Key Components

### VehicleFilter Component
- Displays filter options (type, price, seats, availability)
- Updates URL parameters on filter change
- Used in: Vehicles page

**How it works:**
1. Receives all available vehicles
2. Extracts unique types and max price
3. Shows filter sliders and dropdowns
4. Updates URL on change
5. Displays filtered results below

### VehicleCard Component
- Shows single vehicle card with image, name, and price
- Used in: Vehicle list

### BookingForm Component
- Date picker to select rental dates
- Calculates number of days and total price
- Submits booking to API
- Shows confirmation message
- Used in: Vehicle detail page

### Header Component
- Navigation menu (Homepage, Vehicles, Bookings, Admin)
- Shows login status
- Logout button for logged-in users

### ThemeToggle Component
- Switches between light and dark mode
- Stores preference in browser

### AuthContext
- Provides authentication state to entire app
- Tracks logged-in user
- Manages session

## Environment Variables

Create a `.env.local` file with these variables:

```
# Database
DB_HOST=localhost              # MySQL server address
DB_PORT=3306                   # MySQL port
DB_USER=root                   # MySQL username
DB_PASSWORD=your_password      # MySQL password
DB_NAME=vehicle_rental         # Database name

# Admin
ADMIN_USERNAME=admin           # Admin panel username
ADMIN_PASSWORD=admin123        # Admin panel password
```

## Running the Application

### Development Mode
```bash
npm run dev
```
- Starts Next.js development server on http://localhost:3000
- Hot reload enabled (changes apply instantly)

### Production Build
```bash
npm run build
npm start
```
- Optimized production build
- Better performance and smaller bundle size

### Linting
```bash
npm run lint
```
- Checks code for errors and style issues
- Uses ESLint for code quality

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env.local`
- Ensure database `vehicle_rental` exists

### Admin Login Fails
- Verify ADMIN_USERNAME and ADMIN_PASSWORD in `.env.local`
- Clear browser cache/cookies
- Try incognito mode

### Bookings Not Showing
- Make sure you're logged in
- Check that bookings exist in database
- Verify session hasn't expired (30 days)

### Images Not Displaying
- Check image path is correct
- Ensure file exists in `/public/images/`
- Verify image URL in database

## Future Enhancements

- Email notifications for bookings
- Payment integration
- Advanced filtering and search
- User profile management
- Booking modifications
- Vehicle maintenance tracking
- Customer reviews and ratings
- Multi-language support

## Security Considerations

- Always keep `.env.local` secret (never commit to git)
- Use strong admin password in production
- Regularly backup MySQL database
- Update Node.js packages regularly
- Enable HTTPS in production
- Use environment-specific configs
- Validate all user inputs

## License

This project is private. Unauthorized use is prohibited.

## Team & Contributions

This project was developed as a group project.

Contributions:
- Yaksh Baria: Core application logic and feature implementation
- Khairul Bashar: Database design and management (schema design, queries, data handling)

---

**Questions?** Check the `.env.example` file for configuration template or review the IMPLEMENTATION_SUMMARY.md for detailed implementation notes.

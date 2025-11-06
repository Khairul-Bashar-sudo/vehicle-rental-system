# 🚗 Vehicle Rental System

A modern, full-stack vehicle rental system built with Next.js 15, TypeScript, and MySQL. Features a complete admin panel for managing vehicles, dynamic pricing, and a beautiful responsive UI.

## ✨ Features

- 🎨 Modern, responsive UI with dark/light/system theme support
- 🔐 Admin authentication and management panel
- 📊 Complete CRUD operations for vehicle management
- 💾 MySQL database integration with connection pooling
- 🚀 Server-side rendering with Next.js 15
- 📱 Mobile-friendly design
- 🎯 Type-safe with TypeScript
- 🔄 Real-time data updates
- 🛡️ Input validation and error handling

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MySQL 8.0+
- **Styling**: CSS Modules
- **ORM**: mysql2 with connection pooling

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0 or higher
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd vehicle-rental-system
```

### 2. Install dependencies

```bash
yarn install
# or
npm install
```

### 3. Set up MySQL Database

Install MySQL if you haven&apos;t:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

Create the database:
```bash
mysql -u root -p
```

```sql
CREATE DATABASE vehicle_rental;
EXIT;
```

### 4. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Update `.env.local` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vehicle_rental

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 5. Start the Development Server

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Initialize the Database

1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click **"Initialize Database"** button

This will create all necessary tables and seed initial vehicle data.

## 🔐 Admin Panel

Access the admin panel at: `http://localhost:3000/admin`

### Admin Features:
- ✅ Add new vehicles with all details
- ✅ Edit existing vehicles (name, type, seats, price per day, availability)
- ✅ Delete vehicles
- ✅ View all vehicles in a table
- ✅ Toggle vehicle availability
- ✅ Initialize/reset database

**⚠️ Security Note:** Change the default admin credentials in production!

## 📁 Project Structure

```
vehicle-rental-system/
├── app/
│   ├── admin/              # Admin panel
│   │   ├── page.tsx        # Admin dashboard
│   │   └── Admin.module.css
│   ├── api/                # API routes
│   │   ├── vehicles/       # Vehicle CRUD endpoints
│   │   ├── admin/          # Admin authentication
│   │   └── init-db/        # Database initialization
│   ├── components/         # React components
│   ├── vehicles/           # Vehicle pages
│   ├── bookings/           # Booking pages
│   └── contact/            # Contact page
├── lib/
│   └── db.ts              # Database connection & queries
├── types/
│   └── vehicle.ts         # TypeScript types
├── data/
│   └── vehicles.ts        # Initial data (legacy)
└── public/
    └── images/            # Vehicle images
```

## 🔌 API Endpoints

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/[id]` - Get single vehicle
- `POST /api/vehicles` - Create new vehicle (admin)
- `PUT /api/vehicles/[id]` - Update vehicle (admin)
- `DELETE /api/vehicles/[id]` - Delete vehicle (admin)

### Admin
- `POST /api/admin/auth` - Admin authentication
- `POST /api/init-db` - Initialize database tables

## 🗄️ Database Schema

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

## 🎨 Theme Support

The application supports three theme modes:
- 🌞 Light mode
- 🌙 Dark mode  
- 💻 System preference

Toggle themes using the theme switcher in the header.

## 🧪 Development

```bash
# Run development server
yarn dev

# Run linter
yarn lint

# Build for production
yarn build

# Start production server
yarn start
```

## 📦 Build

```bash
yarn build
```

This will create an optimized production build in the `.next` directory.

## 🐛 Troubleshooting

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed troubleshooting steps.

### Common Issues:

**Database connection failed:**
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env.local`
- Ensure database exists: `SHOW DATABASES;`

**Port 3000 already in use:**
```bash
# Kill the process
lsof -i :3000
kill -9 <PID>
```

## 🔒 Security Considerations

For production deployment:

1. ✅ Change default admin credentials
2. ✅ Use strong passwords and hashing (bcrypt)
3. ✅ Implement proper authentication (NextAuth.js)
4. ✅ Enable HTTPS/SSL
5. ✅ Add rate limiting
6. ✅ Sanitize user inputs
7. ✅ Use environment variables for secrets
8. ✅ Enable CORS restrictions
9. ✅ Regular security audits

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, visit the [Contact Page](http://localhost:3000/contact).

---

Built with ❤️ using Next.js and TypeScript

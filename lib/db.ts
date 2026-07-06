import { AnyARecord } from 'dns';
import mysql from 'mysql2/promise';
import { AnyActionArg } from 'react';

// Database connection pool
let pool: mysql.Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function query<T = unknown>(sql: string, params?: any[]): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results as T;
  } finally {
    connection.release();
  }
}

// Initialize database and tables
export async function initializeDatabase() {
  const connection = await getPool().getConnection();
  try {
    // Create vehicles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS vehicles (
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
    `);

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await connection.execute(`
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
    `);

    // Create admin users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bookings table
    await connection.execute(`
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
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Seed initial vehicle data
export async function seedVehicles() {
  const initialVehicles = [
    ['sedan-1', 'Compact Sedan', 'Sedan', 5, 45, '/images/sedan.jpg', 'A fuel efficient compact sedan, easy to park and comfortable for city trips.', true, 3],
    ['suv-1', 'Family SUV', 'SUV', 7, 85, '/images/suv.jpg', 'Spacious SUV with room for luggage and family. Great for longer trips.', true, 2],
    ['van-1', 'Cargo Van', 'Van', 2, 70, '/images/van.jpg', 'Reliable cargo van for moving goods or group trips with lots of gear.', false, 1],
    ['lux-1', 'Luxury Coupe', 'Coupe', 4, 160, '/images/coupe.jpg', 'Premium coupe for a stylish ride and elevated comfort.', true, 1],
    ['bike-1', 'Kawasaki Ninja H2', 'Motorcycle', 2, 200, '/images/kawasaki-ninja.jpg', 'Supercharged hypersport beast with cutting-edge technology. Experience raw power and precision.', true, 2],
    ['bike-2', 'Royal Enfield Continental GT 650', 'Motorcycle', 2, 75, '/images/royal-enfield.jpg', 'Classic café racer with modern reliability. Perfect blend of retro styling and contemporary performance.', true, 3],
    ['bike-3', 'Ducati Panigale V4', 'Motorcycle', 2, 250, '/images/ducati.jpg', 'Italian superbike excellence with MotoGP-derived technology. Pure racing DNA on two wheels.', true, 1],
    ['bike-4', 'Harley-Davidson Street Glide', 'Motorcycle', 2, 120, '/images/harley-davidson.jpg', 'Iconic American cruiser with legendary Milwaukee-Eight engine. Built for long-distance touring.', true, 2],
    ['bike-5', 'BMW S 1000 RR', 'Motorcycle', 2, 180, '/images/bmw-bike.jpg', 'German engineering at its finest. Track-ready superbike with advanced electronics and sublime handling.', true, 2],
  ];

  for (const vehicle of initialVehicles) {
    await query(
      `INSERT IGNORE INTO vehicles (id, name, type, seats, pricePerDay, image, description, available, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      vehicle
    );
  }

  console.log('Vehicle data seeded successfully');
}

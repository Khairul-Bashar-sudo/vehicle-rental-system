import { NextResponse } from 'next/server';
import { initializeDatabase, query } from '@/lib/db';

// Initialize database tables
export async function POST() {
  try {
    await initializeDatabase();
    
    // Check if we need to seed initial data
    const vehicles: { count: number }[] = await query('SELECT COUNT(*) as count FROM vehicles');
    
    if (vehicles[0].count === 0) {
      // Seed initial vehicle data
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
          `INSERT INTO vehicles (id, name, type, seats, pricePerDay, image, description, available, quantity)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          vehicle
        );
      }
    }

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      seeded: vehicles[0].count === 0 
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: (error as Error).message },
      { status: 500 }
    );
  }
}

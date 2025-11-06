import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Vehicle } from '@/types/vehicle';

// GET all vehicles
export async function GET() {
  try {
    const vehicles = await query<Vehicle[]>('SELECT * FROM vehicles ORDER BY created_at DESC');
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

// POST create new vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, seats, pricePerDay, image, description, available } = body;

    // Validate required fields
    if (!id || !name || !type || !seats || !pricePerDay) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO vehicles (id, name, type, seats, pricePerDay, image, description, available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, type, seats, pricePerDay, image || null, description || null, available ?? true]
    );

    return NextResponse.json({ message: 'Vehicle created successfully' }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating vehicle:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Vehicle ID already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Vehicle } from '@/types/vehicle';

// GET all vehicles with optional filtering and sorting
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get filter parameters
    const type = searchParams.get('type');
    const minSeats = searchParams.get('minSeats');
    const maxPrice = searchParams.get('maxPrice');
    const availability = searchParams.get('availability');
    const sortBy = searchParams.get('sortBy') || 'name';

    // Build the WHERE clause
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (type && type !== 'all') {
      conditions.push('type = ?');
      params.push(type);
    }

    if (minSeats && parseInt(minSeats) > 0) {
      conditions.push('seats >= ?');
      params.push(parseInt(minSeats));
    }

    if (maxPrice) {
      conditions.push('pricePerDay <= ?');
      params.push(parseFloat(maxPrice));
    }

    if (availability === 'available') {
      conditions.push('available = 1');
    } else if (availability === 'unavailable') {
      conditions.push('available = 0');
    }

    // Build the ORDER BY clause
    let orderClause = 'ORDER BY ';
    switch (sortBy) {
      case 'price-low':
        orderClause += 'pricePerDay ASC';
        break;
      case 'price-high':
        orderClause += 'pricePerDay DESC';
        break;
      case 'seats-low':
        orderClause += 'seats ASC';
        break;
      case 'seats-high':
        orderClause += 'seats DESC';
        break;
      case 'name':
      default:
        orderClause += 'name ASC';
        break;
    }

    // Build the complete query
    let sql = 'SELECT * FROM vehicles';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ' + orderClause;

    const vehicles = await query<Vehicle[]>(sql, params);
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
      `INSERT INTO vehicles (id, name, type, seats, pricePerDay, image, description, available, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, type, seats, pricePerDay, image || null, description || null, available ?? true, body.quantity || 1]
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

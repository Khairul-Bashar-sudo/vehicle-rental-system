import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

interface Booking {
  id: number;
  vehicle_id: string;
  vehicle_name: string;
  user_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  days: number;
  total_price: number;
  created_at: string;
}

interface Session {
  user_id: number;
}

export async function GET() {
  try {
    // Get session from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Hash the session token to match stored format
    const { hashSessionToken } = await import('@/lib/auth');
    const hashedToken = hashSessionToken(sessionToken);

    // Verify session and get user_id
    const sessions = await query<Session[]>(
      'SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW()',
      [hashedToken]
    );

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const userId = sessions[0].user_id;

    // Fetch user's bookings
    const bookings = await query<Booking[]>(
      `SELECT * FROM bookings 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Get session from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Hash the session token to match stored format
    const { hashSessionToken } = await import('@/lib/auth');
    const hashedToken = hashSessionToken(sessionToken);

    // Verify session and get user_id
    const sessions = await query<Session[]>(
      'SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW()',
      [hashedToken]
    );

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const userId = sessions[0].user_id;

    // Get request body
    const body = await request.json();
    const {
      vehicle_id,
      vehicle_name,
      customer_name,
      customer_email,
      customer_phone,
      start_date,
      end_date,
      days,
      total_price,
    } = body;

    // Validate required fields
    if (!vehicle_id || !vehicle_name || !customer_name || !customer_email || 
        !customer_phone || !start_date || !end_date || !days || !total_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Check vehicle availability
    const vehicles = await query<Array<{ quantity: number; available: boolean }>>(
      'SELECT quantity, available FROM vehicles WHERE id = ?',
      [vehicle_id]
    );

    if (vehicles.length === 0) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const vehicle = vehicles[0];

    if (!vehicle.available) {
      return NextResponse.json(
        { error: 'This vehicle is currently unavailable' },
        { status: 400 }
      );
    }

    // Count overlapping bookings
    const bookingCounts = await query<Array<{ booked_count: number }>>(
      `SELECT COUNT(*) as booked_count 
       FROM bookings 
       WHERE vehicle_id = ? 
         AND start_date <= ? 
         AND end_date >= ?`,
      [vehicle_id, end_date, start_date]
    );

    const bookedCount = bookingCounts[0].booked_count;
    const totalQuantity = vehicle.quantity || 1;
    const availableCount = totalQuantity - bookedCount;

    if (availableCount <= 0) {
      return NextResponse.json(
        { error: 'No vehicles available for the selected dates. Please choose different dates.' },
        { status: 400 }
      );
    }

    // Create booking
    const result = await query(
      `INSERT INTO bookings 
       (vehicle_id, vehicle_name, user_id, customer_name, customer_email, 
        customer_phone, start_date, end_date, days, total_price) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id,
        vehicle_name,
        userId,
        customer_name,
        customer_email,
        customer_phone,
        start_date,
        end_date,
        days,
        total_price,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: (result as { insertId: number }).insertId,
        vehicle_id,
        vehicle_name,
        customer_name,
        customer_email,
        start_date,
        end_date,
        days,
        total_price,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

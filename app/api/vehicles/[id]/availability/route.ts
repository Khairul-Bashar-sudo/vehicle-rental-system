import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Vehicle } from '@/types/vehicle';

interface BookingCount {
  booked_count: number;
}

// GET vehicle availability for a date range
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Get vehicle info
    const vehicles = await query<Vehicle[]>(
      'SELECT id, name, quantity, available FROM vehicles WHERE id = ?',
      [id]
    );

    if (vehicles.length === 0) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const vehicle = vehicles[0];

    // If vehicle is not available at all, return unavailable
    if (!vehicle.available) {
      return NextResponse.json({
        available: false,
        totalQuantity: vehicle.quantity || 1,
        bookedCount: vehicle.quantity || 1,
        availableCount: 0,
        message: 'This vehicle is currently unavailable'
      });
    }

    // Count overlapping bookings
    // A booking overlaps if: (start_date <= endDate) AND (end_date >= startDate)
    const bookingCounts = await query<BookingCount[]>(
      `SELECT COUNT(*) as booked_count 
       FROM bookings 
       WHERE vehicle_id = ? 
         AND start_date <= ? 
         AND end_date >= ?`,
      [id, endDate, startDate]
    );

    const bookedCount = bookingCounts[0].booked_count;
    const totalQuantity = vehicle.quantity || 1;
    const availableCount = totalQuantity - bookedCount;

    return NextResponse.json({
      available: availableCount > 0,
      totalQuantity,
      bookedCount,
      availableCount,
      message: availableCount > 0 
        ? `${availableCount} of ${totalQuantity} available for selected dates`
        : 'No vehicles available for selected dates'
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

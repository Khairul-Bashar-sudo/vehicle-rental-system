import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

export async function GET() {
  try {
    const bookings = await query<Booking[]>(
      `SELECT * FROM bookings ORDER BY created_at DESC`
    );
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// DELETE a booking
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM bookings WHERE id = ?', [id]);

    return NextResponse.json({ 
      message: 'Booking deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}

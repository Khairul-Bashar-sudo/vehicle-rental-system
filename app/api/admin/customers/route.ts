import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export async function GET() {
  try {
    const customers = await query<Customer[]>(
      `SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC`
    );
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

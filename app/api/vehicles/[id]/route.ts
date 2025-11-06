import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Vehicle } from '@/types/vehicle';

// GET single vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicles = await query<Vehicle[]>(
      'SELECT * FROM vehicles WHERE id = ?',
      [id]
    );

    if (vehicles.length === 0) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicles[0]);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

// PUT update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, seats, pricePerDay, image, description, available } = body;

    // Validate required fields
    if (!name || !type || !seats || !pricePerDay) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query<{ affectedRows: number }>(
      `UPDATE vehicles 
       SET name = ?, type = ?, seats = ?, pricePerDay = ?, 
           image = ?, description = ?, available = ?
       WHERE id = ?`,
      [name, type, seats, pricePerDay, image || null, description || null, available ?? true, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

// DELETE vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await query<{ affectedRows: number }>('DELETE FROM vehicles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

// Simple authentication for admin (in production, use proper authentication like NextAuth)
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // For simplicity, using environment variables
    // In production, use hashed passwords stored in database
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
      return NextResponse.json({ 
        success: true,
        token: Buffer.from(`${username}:${password}`).toString('base64')
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error authenticating:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

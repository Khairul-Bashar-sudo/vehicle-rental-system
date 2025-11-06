import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { hashSessionToken } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (sessionToken) {
      const hashedToken = hashSessionToken(sessionToken);
      
      // Delete session from database
      await query(
        'DELETE FROM sessions WHERE session_token = ?',
        [hashedToken]
      );
    }

    // Clear cookie
    cookieStore.delete('session');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

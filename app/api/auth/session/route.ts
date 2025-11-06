import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { hashSessionToken } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null });
    }

    const hashedToken = hashSessionToken(sessionToken);

    // Find session
    const sessions = await query<Array<{
      user_id: number;
      expires_at: Date;
    }>>(
      'SELECT user_id, expires_at FROM sessions WHERE session_token = ?',
      [hashedToken]
    );

    if (sessions.length === 0) {
      return NextResponse.json({ user: null });
    }

    const session = sessions[0];

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await query('DELETE FROM sessions WHERE session_token = ?', [hashedToken]);
      cookieStore.delete('session');
      return NextResponse.json({ user: null });
    }

    // Get user data
    const users = await query<Array<{
      id: number;
      name: string;
      email: string;
    }>>(
      'SELECT id, name, email FROM users WHERE id = ?',
      [session.user_id]
    );

    if (users.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
}

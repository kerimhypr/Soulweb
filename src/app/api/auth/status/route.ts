import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/connection';
import { currentUser } from '@/lib/auth';

export async function GET() {
  const user = await currentUser();
  const connection = user ? getConnection() : null;
  return NextResponse.json({ data: { authenticated: user !== null, email: user?.email ?? null, configured: connection !== null, username: connection?.username ?? null } });
}

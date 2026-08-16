import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/connection';

export async function GET() {
  const connection = getConnection();
  return NextResponse.json({ data: { configured: connection !== null, username: connection?.username ?? null } });
}

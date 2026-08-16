import { NextResponse } from 'next/server';
import { getConnectionStatus } from '@/lib/soulseek/client';
import { getConnection } from '@/lib/config/connection';
export async function GET() { return NextResponse.json({ data: await getConnectionStatus(getConnection()) }); }

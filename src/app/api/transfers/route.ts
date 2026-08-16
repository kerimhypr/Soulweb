import { NextResponse } from 'next/server';
import { getTransfers } from '@/lib/soulseek/client';
import { getConnection } from '@/lib/config/connection';
export async function GET() { try { return NextResponse.json({ data: await getTransfers(getConnection()) }); } catch { return NextResponse.json({ error: 'Transfer service is unavailable.' }, { status: 503 }); } }

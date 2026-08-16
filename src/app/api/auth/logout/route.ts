import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import { clearConnection } from '@/lib/config/connection';
export async function POST() { await destroySession(); clearConnection(); return NextResponse.json({ data: { loggedOut: true } }); }

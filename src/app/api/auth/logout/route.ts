import { NextResponse } from 'next/server';
import { clearConnection } from '@/lib/config/connection';
export async function POST() { clearConnection(); return NextResponse.json({ data: { loggedOut: true } }); }

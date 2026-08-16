import { NextRequest, NextResponse } from 'next/server';
import { searchSchema } from '@/lib/validation/schemas';
import { searchConnectedFiles } from '@/lib/soulseek/client';
import { getConnection } from '@/lib/config/connection';
export async function GET(request: NextRequest) { const parsed = searchSchema.safeParse({ query: request.nextUrl.searchParams.get('query') ?? '', format: request.nextUrl.searchParams.get('format') ?? 'all' }); if (!parsed.success) return NextResponse.json({ error: 'Provide a search query between 1 and 180 characters.' }, { status: 400 }); try { return NextResponse.json({ data: await searchConnectedFiles(parsed.data.query, parsed.data.format, getConnection()) }); } catch { return NextResponse.json({ error: 'Search service is unavailable.' }, { status: 503 }); } }

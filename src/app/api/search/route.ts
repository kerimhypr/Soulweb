import { NextRequest, NextResponse } from 'next/server';
import { searchSchema } from '@/lib/validation/schemas';
import { searchConnectedFiles } from '@/lib/soulseek/client';
import { getConnection } from '@/lib/config/connection';
import { requireUser } from '@/lib/auth';
import { getUserConnection } from '@/lib/config/user-connection';
export async function GET(request: NextRequest) { const parsed = searchSchema.safeParse({ query: request.nextUrl.searchParams.get('query') ?? '', format: request.nextUrl.searchParams.get('format') ?? 'all' }); if (!parsed.success) return NextResponse.json({ error: 'Provide a search query between 1 and 180 characters.' }, { status: 400 }); try { const user=await requireUser(); return NextResponse.json({ data: await searchConnectedFiles(parsed.data.query, parsed.data.format, await getUserConnection(user.id)) }); } catch (error) { if (error instanceof Error && error.message==='UNAUTHORIZED') return NextResponse.json({ error:'Authentication required.' },{status:401}); return NextResponse.json({ error: 'Search service is unavailable.' }, { status: 503 }); } }

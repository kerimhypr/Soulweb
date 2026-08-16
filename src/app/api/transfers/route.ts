import { NextResponse } from 'next/server';
import { getTransfers } from '@/lib/soulseek/client';
import { getConnection } from '@/lib/config/connection';
import { requireUser } from '@/lib/auth';
import { getUserConnection } from '@/lib/config/user-connection';
export async function GET() { try { const user=await requireUser(); return NextResponse.json({ data: await getTransfers(await getUserConnection(user.id)) }); } catch (error) { if (error instanceof Error && error.message==='UNAUTHORIZED') return NextResponse.json({error:'Authentication required.'},{status:401}); return NextResponse.json({ error: 'Transfer service is unavailable.' }, { status: 503 }); } }

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getConnection } from '@/lib/config/connection';
import { queueDownload } from '@/lib/soulseek/client';
import { requireUser } from '@/lib/auth';
import { getUserConnection } from '@/lib/config/user-connection';
const schema = z.object({ resultId: z.string().regex(/^[A-Za-z0-9_-]{4,2048}$/) });
export async function POST(request: NextRequest) { let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 }); } const parsed = schema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: 'Invalid search result.' }, { status: 400 }); try { const user=await requireUser(); await queueDownload(parsed.data.resultId, await getUserConnection(user.id)); return NextResponse.json({ data: { queued: true } }, { status: 202 }); } catch (error) { if(error instanceof Error&&error.message==='UNAUTHORIZED')return NextResponse.json({error:'Authentication required.'},{status:401}); return NextResponse.json({ error: 'Download could not be queued.' }, { status: 503 }); } }

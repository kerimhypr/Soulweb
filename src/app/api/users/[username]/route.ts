import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/connection';
import { getUser, getUserFiles } from '@/lib/soulseek/client';
import { requireUser } from '@/lib/auth';
import { getUserConnection } from '@/lib/config/user-connection';
const validUsername = (username: string) => /^[A-Za-z0-9_.-]{1,64}$/.test(username);
export async function GET(_request: NextRequest, { params }: { params: { username: string } }) { if (!validUsername(params.username)) return NextResponse.json({ error: 'Invalid username.' }, { status: 400 }); try { const appUser=await requireUser(); const connection=await getUserConnection(appUser.id); const [user, files] = await Promise.all([getUser(params.username, connection), getUserFiles(params.username, connection)]); return NextResponse.json({ data: { user, files } }); } catch (error) { if(error instanceof Error&&error.message==='UNAUTHORIZED')return NextResponse.json({error:'Authentication required.'},{status:401}); return NextResponse.json({ error: 'User information is unavailable.' }, { status: 503 }); } }

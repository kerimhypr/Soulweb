import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/connection';
import { getUser, getUserFiles } from '@/lib/soulseek/client';
const validUsername = (username: string) => /^[A-Za-z0-9_.-]{1,64}$/.test(username);
export async function GET(_request: NextRequest, { params }: { params: { username: string } }) { if (!validUsername(params.username)) return NextResponse.json({ error: 'Invalid username.' }, { status: 400 }); try { const connection = getConnection(); const [user, files] = await Promise.all([getUser(params.username, connection), getUserFiles(params.username, connection)]); return NextResponse.json({ data: { user, files } }); } catch { return NextResponse.json({ error: 'User information is unavailable.' }, { status: 503 }); } }

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { establishSession, verifyUser } from '@/lib/auth';
import { z } from 'zod';
const schema = z.object({ email: z.string().email().max(320), password: z.string().min(1).max(256) });
export async function POST(request: NextRequest) { let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 }); } const parsed = schema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 }); try { const user = await verifyUser(parsed.data.email.toLowerCase()); if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 }); await establishSession(user.id); return NextResponse.json({ data: { loggedIn: true } }); } catch { return NextResponse.json({ error: 'Login is unavailable.' }, { status: 503 }); } }

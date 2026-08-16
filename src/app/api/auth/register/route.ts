import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, establishSession } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({ email: z.string().email().max(320), password: z.string().min(12).max(256) });
export async function POST(request: NextRequest) {
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 }); }
  const parsed = schema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: 'Use a valid email and a password of at least 12 characters.' }, { status: 400 });
  try { const id = await createUser(parsed.data.email.toLowerCase(), await bcrypt.hash(parsed.data.password, 12)); await establishSession(id); return NextResponse.json({ data: { registered: true } }, { status: 201 }); }
  catch (error) { if (error instanceof Error && error.message.includes('duplicate key')) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 }); return NextResponse.json({ error: 'Registration is unavailable.' }, { status: 503 }); }
}

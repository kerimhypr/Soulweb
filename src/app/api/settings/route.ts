import { NextRequest, NextResponse } from 'next/server';
import { connectionSchema } from '@/lib/validation/schemas';
import { canPersistConnection, clearConnection, saveConnection } from '@/lib/config/connection';

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 }); }
  const parsed = connectionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please provide valid connection settings.' }, { status: 400 });
  if (!canPersistConnection()) return NextResponse.json({ error: 'Server-side encrypted session storage is unavailable. Set CONFIG_ENCRYPTION_KEY or use deployment environment variables.' }, { status: 503 });
  try { saveConnection(parsed.data); return NextResponse.json({ data: { saved: true } }); } catch (error) { const message = error instanceof Error ? error.message : 'Unable to save connection settings.'; return NextResponse.json({ error: message }, { status: 400 }); }
}
export async function DELETE() { clearConnection(); return NextResponse.json({ data: { cleared: true } }); }

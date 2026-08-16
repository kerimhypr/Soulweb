import { NextRequest, NextResponse } from 'next/server';
import { cancelTransfer, pauseTransfer, resumeTransfer } from '@/lib/soulseek/client';
import { transferActionSchema } from '@/lib/validation/schemas';
import { getConnection } from '@/lib/config/connection';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(params.id)) return NextResponse.json({ error: 'Invalid transfer ID.' }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 }); }
  const parsed = transferActionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid transfer action.' }, { status: 400 });
  try {
    if (parsed.data.action === 'pause') await pauseTransfer(params.id, getConnection());
    if (parsed.data.action === 'resume') await resumeTransfer(params.id, getConnection());
    if (parsed.data.action === 'cancel') await cancelTransfer(params.id, getConnection());
    return NextResponse.json({ data: { id: params.id, action: parsed.data.action } });
  } catch { return NextResponse.json({ error: 'Transfer action could not be completed.' }, { status: 503 }); }
}

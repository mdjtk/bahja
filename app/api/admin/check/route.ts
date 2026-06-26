import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const hasAdmin = cookie.split(';').some((c) => c.trim().startsWith('bahja_admin='));
  if (!hasAdmin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

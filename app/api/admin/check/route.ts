import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth-helpers';

export async function GET() {
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { origin } = new URL(req.url)
  return NextResponse.redirect(`${origin}/auth/login`)
}

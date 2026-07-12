import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { isAdmin } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const allUsers: any[] = []
    let pageToken: string | undefined

    do {
      const result = await adminAuth.listUsers(1000, pageToken)
      allUsers.push(...result.users.map((u) => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        phoneNumber: u.phoneNumber,
        photoURL: u.photoURL,
        createdAt: u.metadata.creationTime,
        lastSignInAt: u.metadata.lastSignInTime,
        provider: u.providerData.map((p) => p.providerId),
        disabled: u.disabled,
      })))
      pageToken = result.pageToken
    } while (pageToken)

    return NextResponse.json(allUsers)
  } catch (err: any) {
    console.error('Error in GET /api/admin/users:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

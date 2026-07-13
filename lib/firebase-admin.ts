import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

let cachedApp: ReturnType<typeof initializeApp> | null = null

function getAdminApp() {
  if (cachedApp) return cachedApp
  if (getApps().length) {
    cachedApp = getApp()
    return cachedApp
  }
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!json) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY env not set')
  }
  cachedApp = initializeApp({
    credential: cert(JSON.parse(json)),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
  return cachedApp
}

function getAdminAuth() {
  return getAuth(getAdminApp())
}

export { getAdminApp, getAdminAuth }

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!json) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY env not set')
  }
  return JSON.parse(json)
}

const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert(getServiceAccount()),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })

const adminAuth = getAuth(app)

export { app as adminApp, adminAuth }

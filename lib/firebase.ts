import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore"

export interface FirebaseConfig {
  apiKey?: string
  authDomain?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
}

export interface UserSubmission {
  id?: string
  name: string
  email: string
  category: string
  message: string
  createdAt?: string | { seconds: number; nanoseconds: number } | null
}

export const envFirebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export function isValidConfig(config: FirebaseConfig | null | undefined): boolean {
  if (!config) return false
  return Boolean(
    config.apiKey &&
    config.projectId &&
    !config.apiKey.includes("YOUR_") &&
    config.apiKey.trim().length > 10
  )
}

let activeApp: FirebaseApp | null = null
let activeDb: Firestore | null = null

export function initFirebase(customConfig?: FirebaseConfig) {
  const config = customConfig || envFirebaseConfig

  if (!isValidConfig(config)) {
    return { app: null, db: null, isConfigured: false }
  }

  try {
    if (!activeApp) {
      activeApp = getApps().length > 0 ? getApp() : initializeApp(config as Record<string, string>)
    }
    if (!activeDb && activeApp) {
      activeDb = getFirestore(activeApp)
    }
    return { app: activeApp, db: activeDb, isConfigured: true }
  } catch (error) {
    console.error("Firebase initialization failed:", error)
    return { app: null, db: null, isConfigured: false }
  }
}

const COLLECTION_NAME = "user_submissions"

export async function saveUserSubmission(
  submission: Omit<UserSubmission, "id" | "createdAt">,
  customConfig?: FirebaseConfig
): Promise<string> {
  const { db, isConfigured } = initFirebase(customConfig)
  if (!isConfigured || !db) {
    throw new Error("Firebase is not configured. Please provide valid Firebase credentials.")
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...submission,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

export function subscribeSubmissions(
  callback: (submissions: UserSubmission[]) => void,
  customConfig?: FirebaseConfig
): Unsubscribe | null {
  const { db, isConfigured } = initFirebase(customConfig)
  if (!isConfigured || !db) {
    return null
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))
    return onSnapshot(
      q,
      (snapshot) => {
        const items: UserSubmission[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<UserSubmission, "id">),
        }))
        callback(items)
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error)
      }
    )
  } catch (err) {
    console.error("Error setting up Firestore listener:", err)
    return null
  }
}

export async function deleteUserSubmission(
  id: string,
  customConfig?: FirebaseConfig
): Promise<void> {
  const { db, isConfigured } = initFirebase(customConfig)
  if (!isConfigured || !db) {
    throw new Error("Firebase is not configured.")
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id))
}

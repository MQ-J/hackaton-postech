import { db } from '@/lib/firebase'
import type { Account } from '@/lib/types'
import { doc, getDoc } from 'firebase/firestore'

/** Monta `Account` a partir do documento `users/{uid}` + `uid` do Auth. */
export function mapFirestoreProfileToAccount(
  phoneFromAuth: string,
  data: Partial<Account> | undefined,
  uid: string,
): Account {
  if (!data || Object.keys(data).length === 0) {
    return {
      userName: phoneFromAuth.split('@')[0] || 'Usuário',
      phone: phoneFromAuth,
      tasks: [],
      uid,
    }
  }

  const tasks = Array.isArray(data.tasks) ? data.tasks : []

  return {
    userName: typeof data.userName === 'string' ? data.userName : 'Usuário',
    phone:
      typeof data.phone === 'string' && data.phone.length > 0
        ? data.phone
        : phoneFromAuth,
    tasks,
    uid,
  }
}

export async function fetchUserAccountDocument(
  uid: string,
  emailFallback: string,
): Promise<Account> {
  const snap = await getDoc(doc(db, 'users', uid))
  const profile = snap.exists() ? (snap.data() as Partial<Account>) : undefined
  return mapFirestoreProfileToAccount(emailFallback, profile, uid)
}

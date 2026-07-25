import { auth } from '@/firebase/config'
import { db } from '@/lib/firebase'
import type { Account, FirestoreUserProfile } from '@/lib/types'
import { fetchUserAccountDocument } from '@/lib/user-account-from-firestore'
import {
  ConfirmationResult,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import React, { createContext, useCallback, useContext, useMemo } from 'react'

type SignUpMeta = {
  /** Nome completo — gravado em Firestore `users/{uid}` para o desafio. */
  userName?: string
  /** Chamado após sucesso no Auth/Firestore (fecha modal, toast, etc.). */
  onRegistered?: () => void
}

type AuthContextValue = {
  signUp: (
    phone: string,
    password: string,
    meta?: SignUpMeta,
  ) => Promise<void>
  /** Firebase Auth + perfil `users/{uid}`. Lança `FirebaseError` em falha. */
  sendVerificationCode: (phone: string) => Promise<ConfirmationResult>
  signIn: (verificationCode: string, trimmedPhone: string, confirmation: ConfirmationResult) => Promise<Account>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Evita travar o cadastro se o Firestore não existir ou ficar em retentativa infinita. */
const FIRESTORE_PROFILE_TIMEOUT_MS = 12_000

async function saveUserProfileToFirestore(
  uid: string,
  userName: string,
  phone: string,
): Promise<void> {
  const ref = doc(db, 'users', uid)
  const payload: FirestoreUserProfile = {
    userName,
    phone,
    tasks: [],
  }

  try {
    await Promise.race([
      setDoc(ref, payload),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              'Timeout: verifique se o Cloud Firestore foi criado no Firebase Console.',
            ),
          )
        }, FIRESTORE_PROFILE_TIMEOUT_MS)
      }),
    ])
  } catch (e) {
    console.log(
      'AuthProvider :: signUp - perfil não gravado no Firestore (usuário já existe no Auth). Crie o banco em Build → Firestore Database.',
      e,
    )
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const sendVerificationCode = useCallback(async (phone: string) => {
    const trimmedPhone = phone.trim()
    const confirmation = await signInWithPhoneNumber(
      auth,
      trimmedPhone,
    )

    return confirmation
  }, [])

  const signIn = useCallback(async (verificationCode: string, trimmedPhone: string, confirmation: ConfirmationResult) => {

    const userCredential = await confirmation.confirm(verificationCode)
    const phoneResolved = userCredential.user.phoneNumber ?? trimmedPhone
    return fetchUserAccountDocument(userCredential.user.uid, phoneResolved)
  }, [])

  const signUp = useCallback(
    (phone: string, password: string, meta?: SignUpMeta) => {
      return createUserWithEmailAndPassword(auth, phone, password)
        .then(async (userCredential) => {
          console.log(
            'AuthProvider :: signUp - usuário cadastrado com sucesso',
          )
          const uid = userCredential.user.uid

          if (meta?.userName) {
            await saveUserProfileToFirestore(uid, meta.userName, phone)
          }

          meta?.onRegistered?.()
        })
        .catch((err: unknown) => {
          console.log('AuthProvider :: signUp - falha', err)
          throw err
        })
    },
    [],
  )

  const value = useMemo(() => ({ signUp, sendVerificationCode, signIn }), [signUp, sendVerificationCode, signIn])

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}

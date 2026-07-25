export interface Item {
  id: string
  description: string
  checked: boolean
}
export interface Task {
  id: string
  title?: string
  description?: string
  items: Item[]
}

export interface Account {
  /** Firebase Auth UID — preenchido após login; usado para `users/{uid}` no Firestore. */
  uid?: string
  userName: string
  phone: string
  tasks: Task[]
}

/** Documento `users/{uid}` no Firestore (mesma forma que `Account` no app). */
export type FirestoreUserProfile = Account


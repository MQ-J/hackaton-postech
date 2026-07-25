import { db } from '@/lib/firebase'
import type { Task } from '@/lib/types'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot
} from 'firebase/firestore'

function taskForUserDoc(t: Task): Record<string, unknown> {
  const o: Record<string, unknown> = {
    id: t.id,
    items: t.items,
  }
  if (t.title !== undefined) o.receiptUrl = t.title
  if (t.description !== undefined) o.description = t.description
  return o
}

/** Atualiza saldo e espelho de tarefas em `users/{uid}` (além da subcoleção `accounts/.../tasks`). */
export async function updateUserProfileTasks(
  uid: string,
  tasks: Task[],
): Promise<void> {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, {
    tasks: tasks.map(taskForUserDoc),
  })
}

const PAGE_SIZE = 10

export interface FetchTasksResult {
  tasks: Task[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

function tasksCol(accountNumber: string) {
  return collection(db, 'accounts', accountNumber, 'tasks')
}

export async function fetchTasks(
  accountNumber: string,
  cursorDoc: QueryDocumentSnapshot<DocumentData> | null = null,
): Promise<FetchTasksResult> {
  const col = tasksCol(accountNumber)

  const constraints: Parameters<typeof query>[1][] = [orderBy('date', 'desc'), limit(PAGE_SIZE + 1)]

  if (cursorDoc) {
    constraints.push(startAfter(cursorDoc))
  }

  const q = query(col, ...constraints)
  const snapshot = await getDocs(q)
  const docs = snapshot.docs

  const hasMore = docs.length > PAGE_SIZE
  const pageDocs = hasMore ? docs.slice(0, PAGE_SIZE) : docs
  const lastDoc = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null

  const tasks: Task[] = pageDocs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Task, 'id'>),
  }))

  return { tasks, lastDoc, hasMore }
}

export async function fetchAllTasks(accountNumber: string): Promise<Task[]> {
  const col = tasksCol(accountNumber)
  const q = query(col, orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Task, 'id'>),
  }))
}

export async function addTaskDoc(
  accountNumber: string,
  task: Task,
): Promise<void> {
  const { id, ...data } = task
  await setDoc(doc(tasksCol(accountNumber), id), data)
}

/** `receiptUrl: null` remove o campo no documento (e o recibo deixa de aparecer no app). */
export type TaskDocUpdate = Partial<Omit<Task, 'id'>>

export async function updateTaskDoc(
  accountNumber: string,
  id: string,
  data: TaskDocUpdate,
): Promise<void> {
  const payload: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) payload[key] = value
  }

  await updateDoc(doc(tasksCol(accountNumber), id), payload)
}

export async function deleteTaskDoc(
  accountNumber: string,
  id: string,
): Promise<void> {
  await deleteDoc(doc(tasksCol(accountNumber), id))
}

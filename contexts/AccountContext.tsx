import { onAuthStateChangedListener, signOutSection } from '@/firebase/actions'
import { auth } from '@/firebase/config'
import {
  addTaskDoc,
  deleteTaskDoc,
  fetchAllTasks,
  updateTaskDoc,
  updateUserProfileTasks,
  type TaskDocUpdate,
} from '@/lib/firestore'
import { getSecureItem, removeSecureItem, setSecureItem } from '@/lib/storage'
import type { Account, Task } from '@/lib/types'
import { fetchUserAccountDocument } from '@/lib/user-account-from-firestore'
import React, { createContext, useContext, useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

const LOCAL_TASKS_STORAGE_KEY = 'localTasks'

function createLocalAccount(tasks: Task[] = []): Account {
  return {
    userName: '',
    phone: '',
    tasks,
  }
}

async function getStoredLocalTasks(): Promise<Task[]> {
  const storedTasks = await getSecureItem<Task[]>(LOCAL_TASKS_STORAGE_KEY)
  return Array.isArray(storedTasks) ? storedTasks : []
}

async function persistLocalTasks(tasks: Task[]): Promise<void> {
  await setSecureItem(LOCAL_TASKS_STORAGE_KEY, tasks)
}

interface AccountContextType {
  account: Account | null
  login: (accountData: Account) => Promise<void>
  logout: () => Promise<void>
  addTask: (taskData: Omit<Task, 'id'>, presetId?: string) => void
  updateTask: (id: string, updatedData: TaskDocUpdate) => void
  deleteTask: (id: string) => void
  isHydrated: boolean
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

async function mergeWithSubcollectionTasks(
  accountData: Account,
): Promise<Account> {
  try {
    const tasks = await fetchAllTasks(accountData.accountNumber)
    if (tasks.length > 0) {
      return { ...accountData, tasks }
    }
    return {
      ...accountData,
      tasks: accountData.tasks ?? [],
    }
  } catch {
    return {
      ...accountData,
      tasks: accountData.tasks ?? [],
    }
  }
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    void removeSecureItem('accountsList')
  }, [])

  useEffect(() => {
    let cancelled = false
    const unsub = onAuthStateChangedListener(async (user) => {
      if (cancelled) return

      if (!user) {
        const localTasks = await getStoredLocalTasks()
        if (cancelled) return
        setAccount(createLocalAccount(localTasks))
        await removeSecureItem('currentAccount')
        setIsHydrated(true)
        return
      }

      try {
        const base = await fetchUserAccountDocument(
          user.uid,
          user.email ?? '',
        )
        const merged = await mergeWithSubcollectionTasks(base)
        if (cancelled) return
        setAccount(merged)
        const { tasks: _, ...meta } = merged
        await setSecureItem('currentAccount', meta)
      } catch {
        if (!cancelled) setAccount(null)
      } finally {
        if (!cancelled) setIsHydrated(true)
      }
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  // Espelha conta logada no storage (sem lista de tarefas) — só controle de sessão local.
  useEffect(() => {
    const persist = async () => {
      if (account === null) {
        return
      }

      const hasAuthSession = Boolean(account.uid || auth.currentUser?.uid)
      if (!hasAuthSession) {
        return
      }

      const { tasks: _, ...meta } = account
      await setSecureItem('currentAccount', meta)
    }
    void persist()
  }, [account])

  const login = async (accountData: Account) => {
    const uid = accountData.uid ?? auth.currentUser?.uid
    const withUid = uid ? { ...accountData, uid } : accountData
    setAccount({ ...withUid, tasks: [] })
    try {
      const merged = await mergeWithSubcollectionTasks(withUid)
      setAccount(merged)
      const { tasks: _, ...meta } = merged
      await setSecureItem('currentAccount', meta)
    } catch {
      setAccount((prev) =>
        prev
          ? {
            ...prev,
            tasks: withUid.tasks,
          }
          : prev,
      )
    }
  }

  const logout = async () => {
    const localTasks = await getStoredLocalTasks()
    setAccount(createLocalAccount(localTasks))
    await removeSecureItem('currentAccount')
    try {
      await signOutSection()
    } catch {
      /* sessão já encerrada */
    }
  }

  const syncFirebaseAfterMutation = async (
    next: Account,
    subcollectionOp: () => Promise<void>,
    afterSuccess?: () => Promise<void>,
  ) => {
    const uid = next.uid ?? auth.currentUser?.uid
    try {
      await subcollectionOp()
      if (uid) {
        await updateUserProfileTasks(
          uid,
          next.tasks,
        )
      }
      await afterSuccess?.()
    } catch (e) {
      console.log('Erro ao sincronizar com Firebase:', e)
      // Toast.show({
      //   type: 'error',
      //   text1: 'Erro ao sincronizar',
      //   text2: 'Não foi possível salvar no Firebase. Verifique conexão e regras.',
      // })
    }
  }

  const addTask = (
    taskData: Omit<Task, 'id'>,
    presetId?: string,
  ) => {
    const baseAccount = account ?? createLocalAccount([])

    const newTask: Task = {
      ...taskData,
      id: presetId ?? Date.now().toString(),
    }

    const next: Account = {
      ...baseAccount,
      tasks: [...baseAccount.tasks, newTask],
    }

    setAccount(next)

    const hasAuthSession = Boolean(baseAccount.uid || auth.currentUser?.uid)
    const accountNumber = (baseAccount as Account & { accountNumber?: string }).accountNumber

    if (hasAuthSession && accountNumber) {
      void syncFirebaseAfterMutation(next, () =>
        addTaskDoc(accountNumber, newTask),
      )
      Toast.show({
        type: 'success',
        text1: 'Tarefa adicionada com sucesso',
      })
      return
    }

    void persistLocalTasks(next.tasks)
    Toast.show({
      type: 'success',
      text1: 'Tarefa salva com sucesso',
    })
  }

  const updateTask = (id: string, updatedData: TaskDocUpdate) => {
    const baseAccount = account ?? createLocalAccount([])

    const taskToUpdate = baseAccount.tasks.find((t) => t.id === id)
    if (!taskToUpdate) return

    const newTasks = baseAccount.tasks.map((t) => {
      if (t.id !== id) return t

      const mergedBase: Task = { ...t, ...updatedData, id }

      return mergedBase
    })

    const next: Account = {
      ...baseAccount,
      tasks: newTasks,
    }

    setAccount(next)

    const hasAuthSession = Boolean(baseAccount.uid || auth.currentUser?.uid)
    const accountNumber = (baseAccount as Account & { accountNumber?: string }).accountNumber

    if (hasAuthSession && accountNumber) {
      void syncFirebaseAfterMutation(
        next,
        () => updateTaskDoc(accountNumber, id, updatedData), undefined,
      )
      Toast.show({
        type: 'success',
        text1: 'Tarefa salva com sucesso',
      })
      return
    }

    void persistLocalTasks(next.tasks)
    Toast.show({
      type: 'success',
      text1: 'Tarefa salva com sucesso',
    })
  }

  const deleteTask = (id: string) => {
    const baseAccount = account ?? createLocalAccount([])

    const taskToDelete = baseAccount.tasks.find((t) => t.id === id)
    if (!taskToDelete) return

    const next: Account = {
      ...baseAccount,
      tasks: baseAccount.tasks.filter((t) => t.id !== id),
    }

    setAccount(next)

    const hasAuthSession = Boolean(baseAccount.uid || auth.currentUser?.uid)
    const accountNumber = (baseAccount as Account & { accountNumber?: string }).accountNumber

    if (hasAuthSession && accountNumber) {
      void syncFirebaseAfterMutation(
        next,
        () => deleteTaskDoc(accountNumber, id), undefined,
      )
      return
    }

    void persistLocalTasks(next.tasks)
  }

  return (
    <AccountContext.Provider
      value={{
        account,
        login,
        logout,
        addTask,
        updateTask,
        deleteTask,
        isHydrated,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
}

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
import { removeSecureItem, setSecureItem } from '@/lib/storage'
import type { Account, Task } from '@/lib/types'
import { fetchUserAccountDocument } from '@/lib/user-account-from-firestore'
import React, { createContext, useContext, useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

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
        setAccount(null)
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
    setAccount(null)
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
    if (!account) return

    const newTask: Task = {
      ...taskData,
      id: presetId ?? Date.now().toString(),
    }

    const next: Account = {
      ...account,
      tasks: [newTask, ...account.tasks],
    }

    setAccount(next)
    void syncFirebaseAfterMutation(next, () =>
      addTaskDoc(account.accountNumber, newTask),
    )
    Toast.show({
      type: 'success',
      text1: 'Tarefa adicionada com sucesso',
    })
  }

  const updateTask = (id: string, updatedData: TaskDocUpdate) => {
    if (!account) return

    const taskToUpdate = account.tasks.find((t) => t.id === id)
    if (!taskToUpdate) return

    const newTasks = account.tasks.map((t) => {
      if (t.id !== id) return t

      const mergedBase: Task = { ...t, ...updatedData, id }

      return mergedBase
    })

    const next: Account = {
      ...account,
      tasks: newTasks,
    }

    setAccount(next)
    void syncFirebaseAfterMutation(
      next,
      () => updateTaskDoc(account.accountNumber, id, updatedData), undefined,
    )
    Toast.show({
      type: 'success',
      text1: 'Tarefa atualizada com sucesso',
    })
  }

  const deleteTask = (id: string) => {
    if (!account) return

    const taskToDelete = account.tasks.find((t) => t.id === id)
    if (!taskToDelete) return

    const next: Account = {
      ...account,
      tasks: account.tasks.filter((t) => t.id !== id),
    }

    setAccount(next)
    void syncFirebaseAfterMutation(
      next,
      () => deleteTaskDoc(account.accountNumber, id), undefined,
    )
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

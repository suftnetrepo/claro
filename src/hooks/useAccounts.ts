import { useCallback } from 'react'
import { accountService } from '../services/accountService'
import type { Account, NewAccount } from '../db/schema'
import { useRecordsStore } from '../stores'
import { useAsync, type AsyncState } from './useAsync'

export function useAccounts(): AsyncState<Account[]> & {
  create:       (input: Omit<NewAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Account>
  update:       (id: string, input: Partial<Account>) => Promise<void>
  remove:       (id: string) => Promise<void>
  totalBalance: number
} {
  const { dataVersion } = useRecordsStore()

  const state = useAsync<Account[]>(
    () => accountService.getAll(),
    [],
    [dataVersion],
  )

  const create = useCallback(async (input: Omit<NewAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const acc = await accountService.create(input)
    state.refetch()
    return acc
  }, [state])

  const update = useCallback(async (id: string, input: Partial<Account>) => {
    await accountService.update(id, input)
    state.refetch()
  }, [state])

  const remove = useCallback(async (id: string) => {
    await accountService.remove(id)
    state.refetch()
  }, [state])

  const totalBalance = state.data.reduce((s, a) => s + a.balance, 0)

  return { ...state, create, update, remove, totalBalance }
}

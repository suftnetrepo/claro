import { useCallback } from 'react'
import { transactionService, type TransactionWithRefs } from '../services/transactionService'
import type { Transaction, NewTransaction } from '../db/schema'
import { useRecordsStore } from '../stores'
import { getMonthRange } from '../utils'
import { useAsync, type AsyncState } from './useAsync'

export type { TransactionWithRefs }

export function useTransactions(month?: Date): AsyncState<TransactionWithRefs[]> & {
  create:       (input: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  update:       (id: string, input: Partial<Transaction>) => Promise<void>
  remove:       (id: string) => Promise<void>
  totalIncome:  number
  totalExpense: number
  totalBalance: number
  grouped:      Record<string, TransactionWithRefs[]>
} {
  const { selectedMonth, dataVersion } = useRecordsStore()
  const target = month ?? selectedMonth

  const state = useAsync<TransactionWithRefs[]>(
    () => transactionService.getByMonth(target),
    [],
    [target.getMonth(), target.getFullYear(), dataVersion],
  )

  const create = useCallback(async (input: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    await transactionService.create(input)
    state.refetch()
  }, [state])

  const update = useCallback(async (id: string, input: Partial<Transaction>) => {
    await transactionService.update(id, input)
    state.refetch()
  }, [state])

  const remove = useCallback(async (id: string) => {
    await transactionService.remove(id)
    state.refetch()
  }, [state])

  const totalIncome  = state.data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = state.data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalBalance = totalIncome - totalExpense

  const grouped = state.data.reduce<Record<string, TransactionWithRefs[]>>((acc, tx) => {
    const key = tx.date.toDateString()
    if (!acc[key]) acc[key] = []
    acc[key].push(tx)
    return acc
  }, {})

  return { ...state, create, update, remove, totalIncome, totalExpense, totalBalance, grouped }
}

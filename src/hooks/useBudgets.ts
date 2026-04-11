import { useState, useEffect, useCallback } from 'react'
import { budgetService, type BudgetWithSpent } from '../services/budgetService'
import type { Category, NewBudget } from '../db/schema'
import { useRecordsStore } from '../stores'
import { formatMonthKey } from '../utils'
import { useAsync, type AsyncState } from './useAsync'

export type { BudgetWithSpent }

export function useBudgets(month?: Date): AsyncState<BudgetWithSpent[]> & {
  create:               (input: Omit<NewBudget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  update:               (id: string, limitAmount: number) => Promise<void>
  remove:               (id: string) => Promise<void>
  copyFromMonth:        (from: Date) => Promise<void>
  totalBudget:          number
  totalSpent:           number
  unbudgetedCategories: Category[]
} {
  const { selectedMonth, dataVersion } = useRecordsStore()
  const target   = month ?? selectedMonth
  const monthKey = formatMonthKey(target)

  const state = useAsync<BudgetWithSpent[]>(
    () => budgetService.getByMonth(target),
    [],
    [monthKey, dataVersion],
  )

  const [unbudgetedCategories, setUnbudgeted] = useState<Category[]>([])
  useEffect(() => {
    if (!state.loading) {
      budgetService.getUnbudgetedCategories(target).then(setUnbudgeted)
    }
  }, [state.data, state.loading])

  const create = useCallback(async (input: Omit<NewBudget, 'id' | 'createdAt' | 'updatedAt'>) => {
    await budgetService.create(input)
    state.refetch()
  }, [state])

  const update = useCallback(async (id: string, limitAmount: number) => {
    await budgetService.update(id, limitAmount)
    state.refetch()
  }, [state])

  const remove = useCallback(async (id: string) => {
    await budgetService.remove(id)
    state.refetch()
  }, [state])

  const copyFromMonth = useCallback(async (from: Date) => {
    await budgetService.copyFromMonth(from, target)
    state.refetch()
  }, [state, target])

  const totalBudget = state.data.reduce((s, b) => s + b.limitAmount, 0)
  const totalSpent  = state.data.reduce((s, b) => s + b.spent, 0)

  return { ...state, create, update, remove, copyFromMonth, totalBudget, totalSpent, unbudgetedCategories }
}

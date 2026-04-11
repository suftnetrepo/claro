import { useCallback } from 'react'
import { categoryService } from '../services/categoryService'
import type { Category, NewCategory } from '../db/schema'
import { useAsync, type AsyncState } from './useAsync'

export function useCategories(type?: 'expense' | 'income'): AsyncState<Category[]> & {
  create: (input: Omit<NewCategory, 'id' | 'createdAt'>) => Promise<Category>
  update: (id: string, input: Partial<Category>) => Promise<void>
  remove: (id: string) => Promise<void>
} {
  const state = useAsync<Category[]>(
    () => type ? categoryService.getByType(type) : categoryService.getAll(),
    [],
    [type ?? ''],
  )

  const create = useCallback(async (input: Omit<NewCategory, 'id' | 'createdAt'>) => {
    const cat = await categoryService.create(input)
    state.refetch()
    return cat
  }, [state])

  const update = useCallback(async (id: string, input: Partial<Category>) => {
    await categoryService.update(id, input)
    state.refetch()
  }, [state])

  const remove = useCallback(async (id: string) => {
    await categoryService.remove(id)
    state.refetch()
  }, [state])

  return { ...state, create, update, remove }
}

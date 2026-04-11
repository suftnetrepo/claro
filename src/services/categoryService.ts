import { eq, asc } from 'drizzle-orm'
import { db } from '../db'
import { categories } from '../db/schema'
import type { Category, NewCategory } from '../db/schema'
import { generateId } from '../utils'

export const categoryService = {

  getAll: (): Promise<Category[]> =>
    db.select().from(categories).orderBy(asc(categories.type), asc(categories.sortOrder)),

  getByType: (type: 'expense' | 'income'): Promise<Category[]> =>
    db.select().from(categories)
      .where(eq(categories.type, type))
      .orderBy(asc(categories.sortOrder)),

  getById: async (id: string): Promise<Category | null> => {
    const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
    return rows[0] ?? null
  },

  create: async (input: Omit<NewCategory, 'id' | 'createdAt'>): Promise<Category> => {
    const row: NewCategory = { ...input, id: generateId(), createdAt: new Date() }
    await db.insert(categories).values(row)
    return row as Category
  },

  update: async (id: string, input: Partial<Category>): Promise<void> => {
    await db.update(categories).set(input).where(eq(categories.id, id))
  },

  remove: async (id: string): Promise<void> => {
    await db.delete(categories).where(eq(categories.id, id))
  },
}

import { eq, asc } from 'drizzle-orm'
import { db } from '../db'
import { accounts } from '../db/schema'
import type { Account, NewAccount } from '../db/schema'
import { generateId } from '../utils'

export const accountService = {

  getAll: (): Promise<Account[]> =>
    db.select().from(accounts).orderBy(asc(accounts.sortOrder)),

  getById: async (id: string): Promise<Account | null> => {
    const rows = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1)
    return rows[0] ?? null
  },

  create: async (input: Omit<NewAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> => {
    const ts  = new Date()
    const row: NewAccount = { ...input, id: generateId(), createdAt: ts, updatedAt: ts }
    await db.insert(accounts).values(row)
    return row as Account
  },

  update: async (id: string, input: Partial<Account>): Promise<void> => {
    await db.update(accounts)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(accounts.id, id))
  },

  remove: async (id: string): Promise<void> => {
    await db.delete(accounts).where(eq(accounts.id, id))
  },

  updateBalance: async (id: string, delta: number): Promise<void> => {
    const acc = await accountService.getById(id)
    if (!acc) return
    await db.update(accounts)
      .set({ balance: acc.balance + delta, updatedAt: new Date() })
      .where(eq(accounts.id, id))
  },
}

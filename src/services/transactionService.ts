import { eq, and, gte, lte, desc, sum, sql } from 'drizzle-orm'
import { db } from '../db'
import { accounts, categories, transactions } from '../db/schema'
import type { Transaction, NewTransaction } from '../db/schema'
import { generateId, getMonthRange } from '../utils'
import { getDaysInMonth, startOfDay, endOfDay, subMonths, format } from 'date-fns'

export type TransactionWithRefs = Transaction & {
  accountName?:   string
  accountIcon?:   string
  accountColor?:  string
  categoryName?:  string
  categoryIcon?:  string
  categoryColor?: string
  toAccountName?: string
}

export const transactionService = {

  getByMonth: async (month: Date): Promise<TransactionWithRefs[]> => {
    const { start, end } = getMonthRange(month)
    const acc = accounts
    const cat = categories

    const rows = await db
      .select({
        id:            transactions.id,
        type:          transactions.type,
        amount:        transactions.amount,
        date:          transactions.date,
        notes:         transactions.notes,
        accountId:     transactions.accountId,
        categoryId:    transactions.categoryId,
        toAccountId:   transactions.toAccountId,
        createdAt:     transactions.createdAt,
        updatedAt:     transactions.updatedAt,
        accountName:   acc.name,
        accountIcon:   acc.icon,
        accountColor:  acc.color,
        categoryName:  cat.name,
        categoryIcon:  cat.icon,
        categoryColor: cat.color,
      })
      .from(transactions)
      .leftJoin(acc, eq(transactions.accountId, acc.id))
      .leftJoin(cat, eq(transactions.categoryId, cat.id))
      .where(and(gte(transactions.date, start), lte(transactions.date, end)))
      .orderBy(desc(transactions.date))

    // Resolve toAccount names for transfers
    const toAccountIds = [...new Set(rows.filter(r => r.toAccountId).map(r => r.toAccountId!))]
    const toAccountMap: Record<string, string> = {}
    if (toAccountIds.length > 0) {
      const toAccs = await db.select({ id: accounts.id, name: accounts.name }).from(accounts)
      toAccs.forEach(a => { toAccountMap[a.id] = a.name })
    }

    return rows.map(r => ({
      ...r,
      toAccountName: r.toAccountId ? toAccountMap[r.toAccountId] : undefined,
    })) as TransactionWithRefs[]
  },

  getById: async (id: string): Promise<Transaction | null> => {
    const rows = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1)
    return rows[0] ?? null
  },

  create: async (input: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    const ts  = new Date()
    const row: NewTransaction = { ...input, id: generateId(), createdAt: ts, updatedAt: ts }

    await db.transaction(async (tx) => {
      await tx.insert(transactions).values(row)

      const fromAcc = await tx.select().from(accounts).where(eq(accounts.id, input.accountId)).limit(1)
      if (!fromAcc[0]) return

      if (input.type === 'income') {
        await tx.update(accounts)
          .set({ balance: fromAcc[0].balance + input.amount, updatedAt: ts })
          .where(eq(accounts.id, input.accountId))
      } else if (input.type === 'expense') {
        await tx.update(accounts)
          .set({ balance: fromAcc[0].balance - input.amount, updatedAt: ts })
          .where(eq(accounts.id, input.accountId))
      } else if (input.type === 'transfer' && input.toAccountId) {
        await tx.update(accounts)
          .set({ balance: fromAcc[0].balance - input.amount, updatedAt: ts })
          .where(eq(accounts.id, input.accountId))
        const toAcc = await tx.select().from(accounts).where(eq(accounts.id, input.toAccountId)).limit(1)
        if (toAcc[0]) {
          await tx.update(accounts)
            .set({ balance: toAcc[0].balance + input.amount, updatedAt: ts })
            .where(eq(accounts.id, input.toAccountId))
        }
      }
    })
  },

  update: async (id: string, input: Partial<Transaction>): Promise<void> => {
    await db.update(transactions)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(transactions.id, id))
  },

  remove: async (id: string): Promise<void> => {
    const rows = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1)
    const txRow = rows[0]
    if (!txRow) return

    const ts = new Date()
    await db.transaction(async (dbTx) => {
      const fromAcc = await dbTx.select().from(accounts).where(eq(accounts.id, txRow.accountId)).limit(1)
      if (fromAcc[0]) {
        const delta = txRow.type === 'income' ? -txRow.amount : txRow.type === 'expense' ? txRow.amount : 0
        if (delta !== 0) {
          await dbTx.update(accounts)
            .set({ balance: fromAcc[0].balance + delta, updatedAt: ts })
            .where(eq(accounts.id, txRow.accountId))
        }
      }
      if (txRow.type === 'transfer' && txRow.toAccountId) {
        const toAcc = await dbTx.select().from(accounts).where(eq(accounts.id, txRow.toAccountId)).limit(1)
        if (toAcc[0]) {
          await dbTx.update(accounts)
            .set({ balance: toAcc[0].balance - txRow.amount, updatedAt: ts })
            .where(eq(accounts.id, txRow.toAccountId))
        }
      }
      await dbTx.delete(transactions).where(eq(transactions.id, id))
    })
  },

  getSpendingByCategory: async (month: Date) => {
    const { start, end } = getMonthRange(month)
    return db
      .select({
        categoryId:    transactions.categoryId,
        categoryName:  categories.name,
        categoryIcon:  categories.icon,
        categoryColor: categories.color,
        total:         sum(transactions.amount),
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.type, 'expense'), gte(transactions.date, start), lte(transactions.date, end)))
      .groupBy(transactions.categoryId)
      .orderBy(desc(sum(transactions.amount)))
  },

  getIncomeByCategory: async (month: Date) => {
    const { start, end } = getMonthRange(month)
    return db
      .select({
        categoryId:    transactions.categoryId,
        categoryName:  categories.name,
        categoryIcon:  categories.icon,
        categoryColor: categories.color,
        total:         sum(transactions.amount),
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.type, 'income'), gte(transactions.date, start), lte(transactions.date, end)))
      .groupBy(transactions.categoryId)
      .orderBy(desc(sum(transactions.amount)))
  },

  // Daily totals for a given month — one row per calendar day
  getDailyTotals: async (month: Date): Promise<{ day: number; expense: number; income: number }[]> => {
    const { start, end } = getMonthRange(month)
    const rows = await db
      .select({
        day:    sql<number>`cast(strftime('%d', datetime(${transactions.date}/1000, 'unixepoch')) as integer)`,
        type:   transactions.type,
        total:  sum(transactions.amount),
      })
      .from(transactions)
      .where(and(
        gte(transactions.date, start),
        lte(transactions.date, end),
      ))
      .groupBy(
        sql`strftime('%d', datetime(${transactions.date}/1000, 'unixepoch'))`,
        transactions.type,
      )

    // Build a full calendar — every day of the month with defaults 0
    const days = getDaysInMonth(month)
    const result: { day: number; expense: number; income: number }[] = []
    for (let d = 1; d <= days; d++) {
      const expRow = rows.find(r => r.day === d && r.type === 'expense')
      const incRow = rows.find(r => r.day === d && r.type === 'income')
      result.push({
        day:     d,
        expense: Number(expRow?.total ?? 0),
        income:  Number(incRow?.total ?? 0),
      })
    }
    return result
  },

  // Monthly totals for the last N months — for the Trends tab
  getMonthlyTotals: async (months: Date[]): Promise<{ month: string; expense: number; income: number }[]> => {
    const results = await Promise.all(
      months.map(async (m) => {
        const { start, end } = getMonthRange(m)
        const rows = await db
          .select({ type: transactions.type, total: sum(transactions.amount) })
          .from(transactions)
          .where(and(gte(transactions.date, start), lte(transactions.date, end)))
          .groupBy(transactions.type)
        const expense = Number(rows.find(r => r.type === 'expense')?.total ?? 0)
        const income  = Number(rows.find(r => r.type === 'income')?.total  ?? 0)
        return { month: format(m, 'MMM'), expense, income }
      })
    )
    return results
  },

}
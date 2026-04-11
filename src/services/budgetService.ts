import { eq, and, gte, lte, asc, sum } from 'drizzle-orm'
import { db } from '../db'
import { budgets, categories, transactions } from '../db/schema'
import type { Budget, NewBudget, Category } from '../db/schema'
import { generateId, formatMonthKey, getMonthRange } from '../utils'

export type BudgetWithSpent = Budget & {
  categoryName:  string
  categoryIcon:  string
  categoryColor: string
  spent:         number
  remaining:     number
  percentage:    number
}

export const budgetService = {

  getByMonth: async (month: Date): Promise<BudgetWithSpent[]> => {
    const monthKey    = formatMonthKey(month)
    const { start, end } = getMonthRange(month)

    const budgetRows = await db
      .select({
        id:            budgets.id,
        categoryId:    budgets.categoryId,
        month:         budgets.month,
        limitAmount:   budgets.limitAmount,
        createdAt:     budgets.createdAt,
        updatedAt:     budgets.updatedAt,
        categoryName:  categories.name,
        categoryIcon:  categories.icon,
        categoryColor: categories.color,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(eq(budgets.month, monthKey))

    const spendingRows = await db
      .select({ categoryId: transactions.categoryId, total: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.type, 'expense'), gte(transactions.date, start), lte(transactions.date, end)))
      .groupBy(transactions.categoryId)

    const spendingMap = spendingRows.reduce<Record<string, number>>((acc, row) => {
      if (row.categoryId) acc[row.categoryId] = Number(row.total ?? 0)
      return acc
    }, {})

    return budgetRows.map(b => {
      const spent      = spendingMap[b.categoryId] ?? 0
      const remaining  = b.limitAmount - spent
      const percentage = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0
      return {
        ...b,
        categoryName:  b.categoryName  ?? 'Unknown',
        categoryIcon:  b.categoryIcon  ?? 'other',
        categoryColor: b.categoryColor ?? '#607D8B',
        spent, remaining, percentage,
      } as BudgetWithSpent
    })
  },

  getUnbudgetedCategories: async (month: Date): Promise<Category[]> => {
    const monthKey    = formatMonthKey(month)
    const budgetRows  = await db.select({ categoryId: budgets.categoryId })
      .from(budgets).where(eq(budgets.month, monthKey))
    const budgetedIds = new Set(budgetRows.map(b => b.categoryId))
    const allExpense  = await db.select().from(categories)
      .where(eq(categories.type, 'expense'))
      .orderBy(asc(categories.sortOrder))
    return allExpense.filter(c => !budgetedIds.has(c.id))
  },

  create: async (input: Omit<NewBudget, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    const ts = new Date()
    await db.insert(budgets).values({ ...input, id: generateId(), createdAt: ts, updatedAt: ts })
  },

  update: async (id: string, limitAmount: number): Promise<void> => {
    await db.update(budgets).set({ limitAmount, updatedAt: new Date() }).where(eq(budgets.id, id))
  },

  remove: async (id: string): Promise<void> => {
    await db.delete(budgets).where(eq(budgets.id, id))
  },

  copyFromMonth: async (fromMonth: Date, toMonth: Date): Promise<void> => {
    const fromKey     = formatMonthKey(fromMonth)
    const toKey       = formatMonthKey(toMonth)
    const fromBudgets = await db.select().from(budgets).where(eq(budgets.month, fromKey))
    const ts          = new Date()
    for (const b of fromBudgets) {
      await db.insert(budgets)
        .values({ id: generateId(), categoryId: b.categoryId, month: toKey, limitAmount: b.limitAmount, createdAt: ts, updatedAt: ts })
        .onConflictDoNothing()
    }
  },
}

import {
  sqliteTable, text, real, integer, uniqueIndex
} from 'drizzle-orm/sqlite-core'

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const accounts = sqliteTable('accounts', {
  id:            text('id').primaryKey(),
  name:          text('name').notNull(),
  icon:          text('icon').notNull().default('cash'),
  color:         text('color').notNull().default('#2E7D32'),
  balance:       real('balance').notNull().default(0),
  initialAmount: real('initial_amount').notNull().default(0),
  sortOrder:     integer('sort_order').notNull().default(0),
  isDefault:     integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt:     integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:     integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = sqliteTable('categories', {
  id:        text('id').primaryKey(),
  name:      text('name').notNull(),
  icon:      text('icon').notNull(),
  color:     text('color').notNull(),
  type:      text('type', { enum: ['expense', 'income'] }).notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactions = sqliteTable('transactions', {
  id:          text('id').primaryKey(),
  type:        text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
  amount:      real('amount').notNull(),
  date:        integer('date', { mode: 'timestamp' }).notNull(),
  notes:       text('notes'),
  accountId:   text('account_id').notNull()
               .references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId:  text('category_id')
               .references(() => categories.id, { onDelete: 'set null' }),
  toAccountId: text('to_account_id')
               .references(() => accounts.id, { onDelete: 'set null' }),
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// ─── Budgets ──────────────────────────────────────────────────────────────────

export const budgets = sqliteTable('budgets', {
  id:         text('id').primaryKey(),
  categoryId: text('category_id').notNull()
              .references(() => categories.id, { onDelete: 'cascade' }),
  month:      text('month').notNull(),   // "2026-04"
  limitAmount:real('limit_amount').notNull(),
  createdAt:  integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:  integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  uniqueMonthCategory: uniqueIndex('budgets_month_category').on(t.month, t.categoryId),
}))

// ─── Settings (singleton row) ─────────────────────────────────────────────────

export const settings = sqliteTable('settings', {
  id:            text('id').primaryKey().default('singleton'),
  currency:      text('currency').notNull().default('USD'),
  currencySymbol:text('currency_symbol').notNull().default('$'),
  viewMode:      text('view_mode', {
                   enum: ['daily', 'weekly', 'monthly', '3months', '6months', 'yearly']
                 }).notNull().default('monthly'),
  showTotal:     integer('show_total', { mode: 'boolean' }).notNull().default(true),
  carryOver:     integer('carry_over', { mode: 'boolean' }).notNull().default(false),
  updatedAt:     integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// ─── Inferred types ───────────────────────────────────────────────────────────

export type Account      = typeof accounts.$inferSelect
export type NewAccount   = typeof accounts.$inferInsert
export type Category     = typeof categories.$inferSelect
export type NewCategory  = typeof categories.$inferInsert
export type Transaction  = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Budget       = typeof budgets.$inferSelect
export type NewBudget    = typeof budgets.$inferInsert
export type Settings     = typeof settings.$inferSelect

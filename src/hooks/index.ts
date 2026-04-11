// ─── Shared async state utility ───────────────────────────────────────────────
export { useAsync }            from './useAsync'
export type { AsyncState }     from './useAsync'

// ─── Data hooks ───────────────────────────────────────────────────────────────
export { useSettings }         from './useSettings'
export { useAccounts }         from './useAccounts'
export { useCategories }       from './useCategories'
export { useTransactions }     from './useTransactions'
export { useBudgets }          from './useBudgets'
export { useAnalysis }         from './useAnalysis'

// ─── Re-exported types ────────────────────────────────────────────────────────
export type { TransactionWithRefs } from './useTransactions'
export type { BudgetWithSpent }     from './useBudgets'
export type { CategorySpending, AnalysisData, DailyTotal, MonthlyTotal } from './useAnalysis'

import { palettes } from 'fluent-styles'
import { subMonths } from 'date-fns'
import { transactionService } from '../services/transactionService'
import { useRecordsStore } from '../stores'
import { formatMonthKey } from '../utils'
import { useAsync, type AsyncState } from './useAsync'

export interface CategorySpending {
  categoryId:    string
  categoryName:  string
  categoryIcon:  string
  categoryColor: string
  total:         number
  percentage:    number
}

export interface DailyTotal {
  day:     number
  expense: number
  income:  number
}

export interface MonthlyTotal {
  month:   string
  expense: number
  income:  number
}

export interface AnalysisData {
  expenseByCategory: CategorySpending[]
  incomeByCategory:  CategorySpending[]
  totalIncome:       number
  totalExpense:      number
  netBalance:        number
  dailyTotals:       DailyTotal[]
  monthlyTotals:     MonthlyTotal[]
}

const DEFAULT_DATA: AnalysisData = {
  expenseByCategory: [],
  incomeByCategory:  [],
  totalIncome:       0,
  totalExpense:      0,
  netBalance:        0,
  dailyTotals:       [],
  monthlyTotals:     [],
}

export function useAnalysis(month?: Date): AsyncState<AnalysisData> {
  const { selectedMonth, dataVersion } = useRecordsStore()
  const target   = month ?? selectedMonth
  const monthKey = formatMonthKey(target)

  return useAsync<AnalysisData>(async () => {
    // Build 6-month array ending at target
    const months = Array.from({ length: 6 }, (_, i) => subMonths(target, 5 - i))

    const [eRows, iRows, dailyTotals, monthlyTotals] = await Promise.all([
      transactionService.getSpendingByCategory(target),
      transactionService.getIncomeByCategory(target),
      transactionService.getDailyTotals(target),
      transactionService.getMonthlyTotals(months),
    ])

    const totalExpense = eRows.reduce((s, r) => s + Number(r.total ?? 0), 0)
    const totalIncome  = iRows.reduce((s, r) => s + Number(r.total ?? 0), 0)

    const toSpending = (rows: typeof eRows, total: number): CategorySpending[] =>
      rows.map(r => ({
        categoryId:    r.categoryId    ?? '',
        categoryName:  r.categoryName  ?? 'Other',
        categoryIcon:  r.categoryIcon  ?? 'other',
        categoryColor: r.categoryColor ?? palettes.blueGray[500],
        total:         Number(r.total ?? 0),
        percentage:    total > 0 ? (Number(r.total ?? 0) / total) * 100 : 0,
      }))

    return {
      expenseByCategory: toSpending(eRows, totalExpense),
      incomeByCategory:  toSpending(iRows, totalIncome),
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      dailyTotals,
      monthlyTotals,
    }
  }, DEFAULT_DATA, [monthKey, dataVersion])
}

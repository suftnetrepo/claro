import { startOfDay, endOfDay, subDays, subWeeks, subMonths } from 'date-fns'
import { transactionService } from '../services/transactionService'
import { useAsync } from './useAsync'

export type ExpenseRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'

function getRangeDates(range: ExpenseRange, now: Date): { start: Date; end: Date } {
  const end = endOfDay(now)
  switch (range) {
    case '1D': return { start: startOfDay(now), end }
    case '1W': return { start: startOfDay(subDays(now, 6)), end }
    case '1M': return { start: startOfDay(subMonths(now, 1)), end }
    case '3M': return { start: startOfDay(subMonths(now, 3)), end }
    case '1Y': return { start: startOfDay(subMonths(now, 12)), end }
    case 'ALL': return { start: new Date(0), end }
  }
}

export function useExpenseRangeTotal(range: ExpenseRange) {
  const now = new Date()
  const { start, end } = getRangeDates(range, now)
  return useAsync(
    () => transactionService.getTotalByDateRange(start, end),
    { expense: 0, income: 0 },
    [range],
  )
}
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
         startOfDay, endOfDay, subMonths, addMonths, isSameMonth,
         isSameDay, isToday, isYesterday, parseISO } from 'date-fns'

// ─── Currency ─────────────────────────────────────────────────────────────────

export const formatCurrency = (
  amount:  number,
  symbol:  string = '$',
  decimals = 2,
): string => {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${symbol}${formatted}`
}

export const formatAmount = (
  amount:  number,
  symbol:  string = '$',
  showSign = false,
): string => {
  const sign = showSign ? (amount >= 0 ? '+' : '-') : ''
  return `${sign}${symbol}${Math.abs(amount).toFixed(2)}`
}

// ─── Percentage Change ────────────────────────────────────────────────────────

/**
 * Calculate percentage change between two values
 * @returns Object with percentage, isIncrease, isPositive, display string
 */
export const calculatePercentageChange = (current: number, previous: number): {
  percentage: number
  isPositive: boolean
  isIncrease: boolean
  displayText: string
} => {
  if (previous === 0) {
    // If previous is zero and current is not, show 100% increase
    return { 
      percentage: current > 0 ? 100 : 0, 
      isPositive: current >= 0, 
      isIncrease: current > 0,
      displayText: current > 0 ? '↑ ∞%' : '↓ 0%' 
    }
  }
  const change = current - previous
  const percentage = Math.abs((change / previous) * 100)
  return {
    percentage: parseFloat(percentage.toFixed(1)),
    isPositive: change >= 0,
    isIncrease: change > 0,
    displayText: `${change >= 0 ? '↑' : '↓'} ${percentage.toFixed(1)}%`,
  }
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export const formatMonthYear = (date: Date): string =>
  format(date, 'MMMM, yyyy')

export const formatShortDate = (date: Date): string => {
  if (isToday(date))     return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d, yyyy')
}

export const formatFullDate = (date: Date): string =>
  format(date, 'MMM d, yyyy')

export const formatTime = (date: Date): string =>
  format(date, 'h:mm a')

export const formatDateTime = (date: Date): string =>
  format(date, 'MMM d, yyyy h:mm a')

export const formatMonthKey = (date: Date): string =>
  format(date, 'yyyy-MM')

export const getMonthRange = (date: Date) => ({
  start: startOfMonth(date),
  end:   endOfMonth(date),
})

export const getDayRange = (date: Date) => ({
  start: startOfDay(date),
  end:   endOfDay(date),
})

export const prevMonth = (date: Date): Date => subMonths(date, 1)
export const nextMonth = (date: Date): Date => addMonths(date, 1)

export { isSameMonth, isSameDay, isToday, format }

// ─── ID generator ─────────────────────────────────────────────────────────────

export const generateId = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })

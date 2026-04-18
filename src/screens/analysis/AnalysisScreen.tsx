import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import {
  Stack, StyledText, StyledPressable, StyledCard,
  StyledDivider, StyledProgressBar,
  StyledSkeleton, StyledEmptyState, TabBar, StyledPage,
} from 'fluent-styles'
import { format } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons'
import { IconCircle } from '../../icons/map'
import { Colors, useColors } from '../../constants'
import { useAnalysis, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { formatCurrency } from '../../utils'
import type { CategorySpending } from '../../hooks'

const TABS = [
  { value: 'spending' as const, label: 'Spending' },
  { value: 'income'   as const, label: 'Income'   },
  { value: 'trends'   as const, label: 'Trends'   },
]
type TabValue = typeof TABS[number]['value']

// ─── Month navigator ──────────────────────────────────────────────────────────
function MonthNav() {
  const Colors = useColors()
  const { selectedMonth, prevMonth, nextMonth } = useRecordsStore()
  const isNow = selectedMonth.getMonth() === new Date().getMonth()
             && selectedMonth.getFullYear() === new Date().getFullYear()
  return (
    <Stack horizontal alignItems="center" justifyContent="space-between"
      paddingHorizontal={20} paddingVertical={12}>
      <StyledPressable width={36} height={36} borderRadius={18}
        backgroundColor={Colors.accent} alignItems="center" justifyContent="center" onPress={prevMonth}>
        <ChevronLeftIcon size={20} color={Colors.primary} strokeWidth={2.2} />
      </StyledPressable>
      <StyledText fontSize={16} fontWeight="700" color={Colors.primary}>
        {format(selectedMonth, 'MMMM, yyyy')}
      </StyledText>
      <StyledPressable width={36} height={36} borderRadius={18}
        backgroundColor={isNow ? Colors.bgMuted : Colors.accent}
        alignItems="center" justifyContent="center" onPress={nextMonth} disabled={isNow}>
        <ChevronRightIcon size={20} color={isNow ? Colors.textMuted : Colors.primary} strokeWidth={2.2} />
      </StyledPressable>
    </Stack>
  )
}

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, amount, symbol, color }: {
  label: string; amount: number; symbol: string; color: string
}) {
  const Colors = useColors()
  return (
    <StyledCard flex={1} padding={14} borderRadius={14} backgroundColor={Colors.bgCard}
      borderWidth={1} borderColor={Colors.border}>
      <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>{label}</StyledText>
      <StyledText fontSize={18} fontWeight="800" color={color} marginTop={4} letterSpacing={-0.5}>
        {formatCurrency(amount, symbol)}
      </StyledText>
    </StyledCard>
  )
}

// ─── Category row ─────────────────────────────────────────────────────────────
function CategoryRow({ item, symbol }: { item: CategorySpending; symbol: string }) {
  const Colors = useColors()
  return (
    <Stack gap={6} paddingVertical={10}>
      <Stack horizontal alignItems="center" gap={12}>
        <IconCircle iconKey={item.categoryIcon} bg={item.categoryColor} size={38} />
        <Stack flex={1} gap={4}>
          <Stack horizontal justifyContent="space-between" alignItems="center">
            <StyledText fontSize={13} fontWeight="700" color={Colors.textPrimary}>{item.categoryName}</StyledText>
            <Stack horizontal alignItems="center" gap={8}>
              <StyledText fontSize={11} color={Colors.textMuted}>{item.percentage.toFixed(0)}%</StyledText>
              <StyledText fontSize={13} fontWeight="700" color={Colors.textPrimary}>
                {formatCurrency(item.total, symbol)}
              </StyledText>
            </Stack>
          </Stack>
          <StyledProgressBar
            value={item.percentage} total={100} size="xs" shape="pill" animated
            colors={{ fill: item.categoryColor, track: Colors.border }}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}

// ─── Spending tab ─────────────────────────────────────────────────────────────
function SpendingTab({ data, symbol, loading }: {
  data: ReturnType<typeof useAnalysis>['data']
  symbol: string; loading: boolean
}) {
  const Colors = useColors()
  if (loading) return <Stack padding={16}><StyledSkeleton template="card" animation="shimmer" /></Stack>

  // Guard: data is not properly initialized
  if (!data || typeof data !== 'object') {
    console.warn('SpendingTab: Invalid data object', data)
    return <Stack padding={16}><StyledEmptyState variant="minimal" illustration="⚠️" title="Data error" /></Stack>
  }

  const totalExpense = Number(data.totalExpense) || 0
  const netBalance = Number(data.netBalance) || 0
  const expenseByCategory = Array.isArray(data.expenseByCategory) ? data.expenseByCategory : []

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }} showsVerticalScrollIndicator={false}>
      {/* Summary cards */}
      <Stack horizontal gap={12}>
        <SummaryCard label="TOTAL SPENT"  amount={totalExpense} symbol={symbol} color={Colors.expense} />
        <SummaryCard label="NET BALANCE"  amount={netBalance}   symbol={symbol}
          color={netBalance >= 0 ? Colors.income : Colors.expense} />
      </Stack>

      {totalExpense === 0 ? (
        <StyledEmptyState variant="minimal" illustration="📊"
          title="No spending this month" description="Add transactions to see your spending breakdown" animated />
      ) : (
        <>
          {/* Spending breakdown section */}
          <Stack gap={12}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1.5} paddingHorizontal={4} textTransform="uppercase">
              Spending by Category
            </StyledText>
            
            <Stack gap={2}>
              {expenseByCategory.map((item, i) => (
                <Stack key={item.categoryId}>
                  <CategoryRow item={item} symbol={symbol} />
                  {i < expenseByCategory.length - 1 && (
                    <StyledDivider borderBottomColor={Colors.border} marginLeft={50} />
                  )}
                </Stack>
              ))}
            </Stack>
          </Stack>
        </>
      )}
    </ScrollView>
  )
}

// ─── Income tab ───────────────────────────────────────────────────────────────
function IncomeTab({ data, symbol, loading }: {
  data: ReturnType<typeof useAnalysis>['data']
  symbol: string; loading: boolean
}) {
  const Colors = useColors()
  if (loading) return <Stack padding={16}><StyledSkeleton template="card" animation="shimmer" /></Stack>

  // Guard: data is not properly initialized
  if (!data || typeof data !== 'object') {
    console.warn('IncomeTab: Invalid data object', data)
    return <Stack padding={16}><StyledEmptyState variant="minimal" illustration="⚠️" title="Data error" /></Stack>
  }

  const totalIncome = Number(data.totalIncome) || 0
  const totalExpense = Number(data.totalExpense) || 0
  const netBalance = Number(data.netBalance) || 0
  const incomeByCategory = Array.isArray(data.incomeByCategory) ? data.incomeByCategory : []

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }} showsVerticalScrollIndicator={false}>
      {/* Summary cards */}
      <Stack horizontal gap={12}>
        <SummaryCard label="TOTAL INCOME" amount={totalIncome}  symbol={symbol} color={Colors.income} />
        <SummaryCard label="TOTAL SPENT"  amount={totalExpense} symbol={symbol} color={Colors.expense} />
      </Stack>

      {/* Net balance highlight card */}
      <StyledCard padding={20} borderRadius={18}
        backgroundColor={netBalance >= 0 ? Colors.incomeLight : Colors.expenseLight}
        borderWidth={2} borderColor={netBalance >= 0 ? Colors.income : Colors.expense}>
        <StyledText fontSize={11} fontWeight="700" letterSpacing={1}
          color={netBalance >= 0 ? Colors.income : Colors.expense}>NET BALANCE</StyledText>
        <StyledText fontSize={32} fontWeight="800" letterSpacing={-1} marginTop={6}
          color={netBalance >= 0 ? Colors.income : Colors.expense}>
          {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance, symbol)}
        </StyledText>
        <StyledText fontSize={13} color={Colors.textMuted} marginTop={6}>
          {netBalance >= 0 ? '✓ You saved money this month' : '⚠ Spending exceeded income'}
        </StyledText>
      </StyledCard>

      {totalIncome === 0 ? (
        <StyledEmptyState variant="minimal" illustration="💰"
          title="No income this month" description="Add income transactions to see your breakdown" animated />
      ) : (
        <>
          {/* Income sources section */}
          <Stack gap={12}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1.5} paddingHorizontal={4} textTransform="uppercase">
              Income by Source
            </StyledText>
            
            <Stack gap={2}>
              {incomeByCategory.map((item, i) => (
                <Stack key={item.categoryId}>
                  <CategoryRow item={item} symbol={symbol} />
                  {i < incomeByCategory.length - 1 && (
                    <StyledDivider borderBottomColor={Colors.border} marginLeft={50} />
                  )}
                </Stack>
              ))}
            </Stack>
          </Stack>
        </>
      )}
    </ScrollView>
  )
}

// ─── TrendsTab: Monthly breakdown with key metrics ────────────────────────────
function TrendsTab({ data, symbol, loading }: {
  data: ReturnType<typeof useAnalysis>['data']
  symbol: string; loading: boolean
}) {
  const Colors = useColors()
  if (loading) return <Stack padding={16}><StyledSkeleton template="card" animation="shimmer" /></Stack>

  // Guard: data is not properly initialized
  if (!data || typeof data !== 'object') {
    console.warn('TrendsTab: Invalid data object', data)
    return <Stack padding={16}><StyledEmptyState variant="minimal" illustration="⚠️" title="Data error" /></Stack>
  }

  const monthly = Array.isArray(data.monthlyTotals) ? data.monthlyTotals : []
  const validMonthly = monthly.filter(m => m && typeof m === 'object')

  if (validMonthly.length === 0 || !validMonthly.some(m => (Number(m.expense) || 0) > 0 || (Number(m.income) || 0) > 0)) {
    return (
      <Stack flex={1} padding={16}>
        <StyledEmptyState variant="minimal" illustration="📈"
          title="Not enough data yet"
          description="Trends appear after logging transactions across multiple months" animated />
      </Stack>
    )
  }

  // Calculate key metrics
  const nonZeroMonths = validMonthly.filter(m => (Number(m.expense) || 0) > 0)
  const avgExpense = nonZeroMonths.length > 0
    ? nonZeroMonths.reduce((s, m) => s + (Number(m.expense) || 0), 0) / nonZeroMonths.length : 0
  const maxExp = [...validMonthly].sort((a, b) => (Number(b.expense) || 0) - (Number(a.expense) || 0))[0]
  const minExp = [...validMonthly].filter(m => (Number(m.expense) || 0) > 0).sort((a, b) => (Number(a.expense) || 0) - (Number(b.expense) || 0))[0]

  // Helper: calculate trend percentage
  const calculateTrend = (current: number, previous: number | undefined): { direction: string; percent: string } | null => {
    if (!previous || previous === 0) return null
    const change = ((current - previous) / previous) * 100
    return {
      direction: change >= 0 ? '▲' : '▼',
      percent: `${Math.abs(change).toFixed(0)}%`
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }} showsVerticalScrollIndicator={false}>
      {/* Key metrics cards */}
      <Stack gap={12}>
        <Stack horizontal gap={12}>
          <StyledCard flex={1} padding={14} borderRadius={14} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>AVG MONTHLY</StyledText>
            <StyledText fontSize={18} fontWeight="800" color={Colors.expense} marginTop={4} letterSpacing={-0.5} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(avgExpense, symbol)}
            </StyledText>
          </StyledCard>
          <StyledCard flex={1} padding={14} borderRadius={14} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>HIGHEST</StyledText>
            <StyledText fontSize={14} fontWeight="800" color={Colors.expense} marginTop={4}>{maxExp?.month}</StyledText>
            <StyledText fontSize={11} color={Colors.textMuted} marginTop={2} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(maxExp?.expense ?? 0, symbol)}
            </StyledText>
          </StyledCard>
          <StyledCard flex={1} padding={14} borderRadius={14} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>LOWEST</StyledText>
            <StyledText fontSize={14} fontWeight="800" color={Colors.income} marginTop={4}>{minExp?.month}</StyledText>
            <StyledText fontSize={11} color={Colors.textMuted} marginTop={2} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(minExp?.expense ?? 0, symbol)}
            </StyledText>
          </StyledCard>
        </Stack>
      </Stack>

      {/* Monthly breakdown section */}
      <Stack gap={12}>
        <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1.5} paddingHorizontal={4} textTransform="uppercase">
          Monthly Breakdown
        </StyledText>

        <Stack gap={10}>
          {[...validMonthly].reverse().map((month, index) => {
            const prevMonth = [...validMonthly].reverse()[index + 1]
            const currentExpense = Number(month.expense) || 0
            const currentIncome = Number(month.income) || 0
            const monthNet = currentIncome - currentExpense
            const expenseTrend = calculateTrend(currentExpense, Number(prevMonth?.expense) || undefined)
            const incomeTrend = calculateTrend(currentIncome, Number(prevMonth?.income) || undefined)

            return (
              <StyledCard key={month.month || index} padding={14} borderRadius={14} backgroundColor={Colors.bgCard}
                borderWidth={1} borderColor={Colors.border}>
                {/* Month header with net balance */}
                <Stack horizontal justifyContent="space-between" alignItems="center" marginBottom={10}>
                  <StyledText fontSize={13} fontWeight="700" color={Colors.textPrimary}>{month.month}</StyledText>
                  <Stack horizontal alignItems="center" gap={4}>
                    <StyledText fontSize={11} fontWeight="600" color={monthNet >= 0 ? Colors.income : Colors.expense}>
                      {monthNet >= 0 ? '▲' : '▼'}
                    </StyledText>
                    <StyledText fontSize={12} fontWeight="700" color={Colors.textPrimary}>
                      {formatCurrency(Math.abs(monthNet), symbol)}
                    </StyledText>
                  </Stack>
                </Stack>

                {/* Month metrics */}
                <Stack gap={8}>
                  {/* Spending row */}
                  <Stack horizontal justifyContent="space-between" alignItems="center">
                    <Stack horizontal alignItems="center" gap={6}>
                      <StyledText fontSize={11} color={Colors.textMuted}>Spending</StyledText>
                      {expenseTrend && (
                        <StyledText fontSize={9} fontWeight="600" color={expenseTrend.direction === '▲' ? Colors.expense : Colors.income}>
                          {expenseTrend.direction} {expenseTrend.percent}
                        </StyledText>
                      )}
                    </Stack>
                    <StyledText fontSize={12} fontWeight="700" color={Colors.expense}>
                      {formatCurrency(currentExpense, symbol)}
                    </StyledText>
                  </Stack>

                  {/* Income row */}
                  <Stack horizontal justifyContent="space-between" alignItems="center">
                    <Stack horizontal alignItems="center" gap={6}>
                      <StyledText fontSize={11} color={Colors.textMuted}>Income</StyledText>
                      {incomeTrend && (
                        <StyledText fontSize={9} fontWeight="600" color={incomeTrend.direction === '▲' ? Colors.income : Colors.expense}>
                          {incomeTrend.direction} {incomeTrend.percent}
                        </StyledText>
                      )}
                    </Stack>
                    <StyledText fontSize={12} fontWeight="700" color={Colors.income}>
                      {formatCurrency(currentIncome, symbol)}
                    </StyledText>
                  </Stack>

                  {/* Divider */}
                  <StyledDivider borderBottomColor={Colors.border} marginVertical={6} />

                  {/* Net balance row (highlighted) */}
                  <Stack horizontal justifyContent="space-between" alignItems="center">
                    <StyledText fontSize={11} fontWeight="700" color={Colors.textMuted}>Net Balance</StyledText>
                    <StyledText fontSize={12} fontWeight="800" color={monthNet >= 0 ? Colors.income : Colors.expense}>
                      {monthNet >= 0 ? '+' : ''}{formatCurrency(monthNet, symbol)}
                    </StyledText>
                  </Stack>
                </Stack>
              </StyledCard>
            )
          })}
        </Stack>
      </Stack>
    </ScrollView>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AnalysisScreen() {
  const Colors = useColors()
  const [tab, setTab]          = useState<TabValue>('spending')
  const { data: settingsData } = useSettings()
  const symbol                 = settingsData?.currencySymbol ?? '$'
  const { data, loading }      = useAnalysis()

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <Stack flex={1}>
        <Stack paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
          <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>Analysis</StyledText>
        </Stack>

        <MonthNav />

        <TabBar
          options={TABS} value={tab} onChange={setTab}
          indicator="line" showBorder
          colors={{ activeText: Colors.primary, indicator: Colors.primary, text: Colors.textMuted, border: Colors.border }}
        />

        <Stack flex={1}>
          {tab === 'spending' && <SpendingTab data={data} symbol={symbol} loading={loading} />}
          {tab === 'income'   && <IncomeTab   data={data} symbol={symbol} loading={loading} />}
          {tab === 'trends'   && <TrendsTab   data={data} symbol={symbol} loading={loading} />}
        </Stack>
      </Stack>
    </StyledPage>
  )
}

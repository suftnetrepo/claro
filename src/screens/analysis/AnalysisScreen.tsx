import React, { useState } from 'react'
import { ScrollView, useWindowDimensions } from 'react-native'
import {
  Stack, StyledText, StyledPressable, StyledCard,
  StyledDivider, StyledProgressBar,
  StyledSkeleton, StyledEmptyState, TabBar, StyledPage,
} from 'fluent-styles'
import { BarChart } from 'react-native-gifted-charts'
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

// ─── TrendsTab: Polished screenshot-matching income bar + expense bar charts ────
const EXPENSE_RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const
type ExpenseRange = typeof EXPENSE_RANGES[number]

// Dark pill "Monthly ▾" button — matches screenshot
function MonthlyPill({ variant = 'dark' }: { variant?: 'dark' | 'gray' }) {
  return (
    <Stack paddingHorizontal={16} paddingVertical={8} borderRadius={24}
      backgroundColor={variant === 'dark' ? '#1A1840' : '#9AACAA'}
      alignItems="center" justifyContent="center">
      <StyledText fontSize={13} fontWeight="700" color="#fff">Monthly ▾</StyledText>
    </Stack>
  )
}

// ─── Type definitions ─────────────────────────────────────────────────────────
type MonthlyPoint = {
  month?: string
  income?: number
  expense?: number
}

// ─── Trend card component ─────────────────────────────────────────────────────
function TrendCard({
  title,
  subtitle,
  value,
  valueColor,
  bars,
  maxValue,
}: {
  title: string
  subtitle: string
  value: string
  valueColor: string
  bars: { value: number; label: string; frontColor: string }[]
  maxValue: number
}) {
  const Colors = useColors()
  const { width } = useWindowDimensions()
  const chartWidth = width - 32 - 32 // screen - outer padding - inner padding

  return (
    <StyledCard
      padding={16}
      borderRadius={18}
      backgroundColor={Colors.bgCard}
      borderWidth={1}
      borderColor={Colors.border}
    >
      <Stack gap={4} marginBottom={14}>
        <StyledText
          fontSize={12}
          fontWeight="700"
          color={Colors.textMuted}
          letterSpacing={1}
          textTransform="uppercase"
        >
          {title}
        </StyledText>
        <StyledText fontSize={28} fontWeight="800" color={valueColor} letterSpacing={-1}>
          {value}
        </StyledText>
        <StyledText fontSize={12} color={Colors.textMuted}>
          {subtitle}
        </StyledText>
      </Stack>

      <BarChart
        data={bars}
        width={chartWidth}
        height={180}
        barWidth={28}
        spacing={18}
        roundedTop
        roundedBottom
        barBorderRadius={10}
        xAxisThickness={0}
        yAxisThickness={0}
        hideYAxisText
        noOfSections={3}
        rulesType="dashed"
        rulesColor={Colors.border}
        dashWidth={4}
        dashGap={4}
        maxValue={Math.max(maxValue, 1)}
        xAxisLabelTextStyle={{
          color: Colors.textMuted,
          fontSize: 11,
          fontWeight: '600',
        }}
        backgroundColor="transparent"
      />
    </StyledCard>
  )
}

// ─── Trends tab ───────────────────────────────────────────────────────────────
function TrendsTab({ data, symbol, loading }: {
  data: ReturnType<typeof useAnalysis>['data']
  symbol: string; loading: boolean
}) {
  const Colors = useColors()

  if (loading) {
    return (
      <Stack padding={16}>
        <StyledSkeleton template="card" animation="shimmer" />
      </Stack>
    )
  }

  if (!data || typeof data !== 'object') {
    return (
      <Stack padding={16}>
        <StyledEmptyState variant="minimal" illustration="⚠️" title="Data error" />
      </Stack>
    )
  }

  const monthly = Array.isArray(data.monthlyTotals) ? data.monthlyTotals : []
  const validMonthly = monthly.filter(m => !!m && typeof m === 'object')

  if (
    validMonthly.length === 0 ||
    !validMonthly.some(m => (Number(m.expense) || 0) > 0 || (Number(m.income) || 0) > 0)
  ) {
    return (
      <Stack flex={1} padding={16}>
        <StyledEmptyState
          variant="minimal"
          illustration="📈"
          title="Not enough data yet"
          description="Trends appear after logging transactions across multiple months"
          animated
        />
      </Stack>
    )
  }

  const avgExpense =
    validMonthly.reduce((sum, m) => sum + (Number(m.expense) || 0), 0) / validMonthly.length

  const maxExp = [...validMonthly].sort(
    (a, b) => (Number(b.expense) || 0) - (Number(a.expense) || 0)
  )[0]

  const nonZeroExp = validMonthly.filter(m => (Number(m.expense) || 0) > 0)
  const minExp =
    nonZeroExp.length > 0
      ? [...nonZeroExp].sort((a, b) => (Number(a.expense) || 0) - (Number(b.expense) || 0))[0]
      : undefined

  const spendingBars = validMonthly.map(m => ({
    label: m.month?.substring(0, 3) ?? '---',
    value: Math.max(Number(m.expense) || 0, 0),
    frontColor: Colors.expense,
  }))

  const incomeBars = validMonthly.map(m => ({
    label: m.month?.substring(0, 3) ?? '---',
    value: Math.max(Number(m.income) || 0, 0),
    frontColor: Colors.income,
  }))

  const spendingMax = Math.max(...spendingBars.map(b => b.value), 1)
  const incomeMax = Math.max(...incomeBars.map(b => b.value), 1)

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Stack horizontal gap={12}>
        <StyledCard
          flex={1}
          padding={16}
          borderRadius={16}
          backgroundColor={Colors.bgCard}
          borderWidth={1}
          borderColor={Colors.border}
        >
          <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>
            AVG MONTHLY
          </StyledText>
          <StyledText
            fontSize={20}
            fontWeight="800"
            color={Colors.expense}
            marginTop={6}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(avgExpense || 0, symbol)}
          </StyledText>
        </StyledCard>

        <StyledCard
          flex={1}
          padding={16}
          borderRadius={16}
          backgroundColor={Colors.bgCard}
          borderWidth={1}
          borderColor={Colors.border}
        >
          <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>
            HIGHEST
          </StyledText>
          <StyledText fontSize={18} fontWeight="800" color={Colors.expense} marginTop={6}>
            {maxExp?.month ?? '—'}
          </StyledText>
          <StyledText fontSize={12} color={Colors.textMuted} marginTop={2}>
            {formatCurrency(Number(maxExp?.expense) || 0, symbol)}
          </StyledText>
        </StyledCard>

        <StyledCard
          flex={1}
          padding={16}
          borderRadius={16}
          backgroundColor={Colors.bgCard}
          borderWidth={1}
          borderColor={Colors.border}
        >
          <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>
            LOWEST
          </StyledText>
          <StyledText fontSize={18} fontWeight="800" color={Colors.income} marginTop={6}>
            {minExp?.month ?? '—'}
          </StyledText>
          <StyledText fontSize={12} color={Colors.textMuted} marginTop={2}>
            {formatCurrency(Number(minExp?.expense) || 0, symbol)}
          </StyledText>
        </StyledCard>
      </Stack>

      <Stack gap={8}>
        <StyledText
          fontSize={13}
          fontWeight="700"
          color={Colors.textMuted}
          letterSpacing={1.5}
          paddingHorizontal={4}
          textTransform="uppercase"
        >
          6-Month Spending Trend
        </StyledText>
        <TrendCard
          title="Spending Trend"
          subtitle="Monthly expenses over the last 6 months"
          value={formatCurrency(Number(data.totalExpense) || 0, symbol)}
          valueColor={Colors.expense}
          bars={spendingBars}
          maxValue={spendingMax * 1.15}
        />
      </Stack>

      <Stack gap={8}>
        <StyledText
          fontSize={13}
          fontWeight="700"
          color={Colors.textMuted}
          letterSpacing={1.5}
          paddingHorizontal={4}
          textTransform="uppercase"
        >
          6-Month Income Trend
        </StyledText>
        <TrendCard
          title="Income Trend"
          subtitle="Monthly income over the last 6 months"
          value={formatCurrency(Number(data.totalIncome) || 0, symbol)}
          valueColor={Colors.income}
          bars={incomeBars}
          maxValue={incomeMax * 1.15}
        />
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
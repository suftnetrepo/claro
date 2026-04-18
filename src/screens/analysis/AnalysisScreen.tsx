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

function TrendsTab({ data, symbol, loading }: {
  data: ReturnType<typeof useAnalysis>['data']
  symbol: string; loading: boolean
}) {
  const Colors = useColors()
  const { width: screenWidth } = useWindowDimensions()
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number | null>(null)
  const [expenseRange, setExpenseRange] = useState<ExpenseRange>('1M')

  if (loading) return <Stack padding={16}><StyledSkeleton template="card" animation="shimmer" /></Stack>

  if (!data || typeof data !== 'object') {
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

  // ── Income bar chart ───────────────────────────────────────────────────────
  const activeIncomeIdx = selectedMonthIdx ?? validMonthly.length - 1
  const totalIncome = Number(validMonthly[activeIncomeIdx]?.income) || 0
  const incomeMaxVal = Math.max(...validMonthly.map(m => Number(m.income) || 0), 1)

  // Active bar = bright lavender/purple, inactive = dim purple
  const INCOME_ACTIVE   = '#9B97FF'   // bright lavender — active bar
  const INCOME_INACTIVE = '#4A4580'   // muted dark purple — inactive bars
  const INCOME_BG       = '#2D2B6B'   // deep indigo card bg
  const INCOME_TEXT_DIM = 'rgba(255,255,255,0.45)'

  const incomeBars = validMonthly.map((m, i) => {
    const val = Number(m.income) || 0
    // Ensure zero-value bars still render as a short stub (4% of max)
    const displayVal = val === 0 ? incomeMaxVal * 0.04 : val
    return {
      value: displayVal,
      label: m.month ? m.month.substring(0, 3) : '---',
      labelWidth: 44,
      frontColor: i === activeIncomeIdx ? INCOME_ACTIVE : INCOME_INACTIVE,
      showGradient: i === activeIncomeIdx,
      gradientColor: i === activeIncomeIdx ? '#C5C2FF' : INCOME_INACTIVE,
    }
  })

  // ── Expense bar chart ──────────────────────────────────────────────────────
  const rangeCount: Record<ExpenseRange, number> = { '1D': 1, '1W': 1, '1M': 1, '3M': 3, '1Y': 6, 'ALL': 99 }
  const filteredExpense = validMonthly.slice(-Math.min(rangeCount[expenseRange], validMonthly.length))
  const expenseMaxVal = Math.max(...filteredExpense.map(m => Number(m.expense) || 0), 1)

  const EXPENSE_BG      = '#EEF4F2'   // pale mint card bg
  const EXPENSE_BAR_TOP = '#F4998A'   // coral/salmon top gradient
  const EXPENSE_BAR_BOT = '#F76C6C'   // red bottom
  const EXPENSE_TEXT    = '#8FA3A0'   // muted mint text

  const expenseBars = filteredExpense.map((m) => {
    const val = Number(m.expense) || 0
    const displayVal = val === 0 ? expenseMaxVal * 0.04 : val
    return {
      value: displayVal,
      label: m.month ? m.month.substring(0, 3) : '---',
      labelWidth: 44,
      frontColor: EXPENSE_BAR_BOT,
      showGradient: true,
      gradientColor: EXPENSE_BAR_TOP,
    }
  })

  // Chart width: screen minus scroll padding (16x2) minus card padding (20x2)
  const cardPad = 20
  const chartWidth = screenWidth - 32 - cardPad * 2

  // For single-bar views (1D/1W/1M), make the bar fill most of the card width
  const expenseBarCount = filteredExpense.length
  const EXPENSE_SPACING = 10
  const expenseBarWidth = expenseBarCount === 1
    ? chartWidth - 24
    : Math.max(20, Math.floor((chartWidth - (expenseBarCount - 1) * EXPENSE_SPACING) / expenseBarCount))

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >

      {/* ══════════════════════════════════════════════════════════════════════
          INCOME CARD — deep indigo bg, white text, purple bars
      ══════════════════════════════════════════════════════════════════════ */}
      <Stack borderRadius={24} overflow="hidden" backgroundColor={INCOME_BG}
        style={{ shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
        <Stack padding={20} paddingBottom={8}>
          {/* Header */}
          <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={2}>
            <StyledText fontSize={24} fontWeight="800" color="#fff" letterSpacing={-0.5}>Income by</StyledText>
            <MonthlyPill variant="dark" />
          </Stack>
          <StyledText fontSize={12} color={INCOME_TEXT_DIM} marginBottom={14}>
            Viewing last {validMonthly.length} months chart
          </StyledText>

          {/* Total */}
          <StyledText fontSize={34} fontWeight="800" color="#fff" letterSpacing={-1.5} marginBottom={2}>
            {formatCurrency(totalIncome, symbol)}
          </StyledText>
          <StyledText fontSize={12} color={INCOME_TEXT_DIM} marginBottom={10}>Total income</StyledText>
        </Stack>

        {/* Bar chart — dashed grid lines via dashGap prop */}
        <Stack paddingHorizontal={20} paddingBottom={4}>
          <BarChart
            data={incomeBars}
            barWidth={Math.max(24, Math.floor((chartWidth - (validMonthly.length - 1) * 10) / validMonthly.length))}
            height={150}
            width={chartWidth}
            spacing={10}
            roundedTop
            barBorderRadius={12}
            xAxisLabelTextStyle={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '600' }}
            backgroundColor="transparent"
            yAxisThickness={0}
            xAxisThickness={0}
            hideYAxisText
            noOfSections={3}
            dashGap={6}
            dashWidth={5}
            rulesType="dashed"
            rulesColor="rgba(255,255,255,0.18)"
            maxValue={incomeMaxVal * 1.25}
            minValue={0}
            onPress={(_item: any, index: number) => setSelectedMonthIdx(index)}
            activeOpacity={0.75}
          />
        </Stack>

        {/* Month pill row */}
        <Stack horizontal justifyContent="space-around"
          paddingHorizontal={20} paddingBottom={20} paddingTop={4}>
          {validMonthly.map((m, i) => {
            const label = m.month ? m.month.substring(0, 3) : '---'
            const isActive = i === activeIncomeIdx
            return (
              <StyledPressable key={i} onPress={() => setSelectedMonthIdx(i)}
                paddingHorizontal={10} paddingVertical={5} borderRadius={16}
                backgroundColor={isActive ? INCOME_ACTIVE : 'transparent'}
                alignItems="center" justifyContent="center"
                minWidth={36}>
                <StyledText fontSize={11} fontWeight={isActive ? '700' : '500'}
                  color={isActive ? '#fff' : INCOME_TEXT_DIM}>
                  {label}
                </StyledText>
              </StyledPressable>
            )
          })}
        </Stack>
      </Stack>

      {/* ══════════════════════════════════════════════════════════════════════
          EXPENSE CARD — pale mint bg, coral gradient bars
      ══════════════════════════════════════════════════════════════════════ */}
      <Stack borderRadius={24} backgroundColor={EXPENSE_BG}
        style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
        <Stack padding={20} paddingBottom={8}>
          {/* Header */}
          <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={2}>
            <StyledText fontSize={24} fontWeight="800" color="rgba(60,80,75,0.35)" letterSpacing={-0.5}>Expense by</StyledText>
            <MonthlyPill variant="gray" />
          </Stack>
          <StyledText fontSize={12} color={EXPENSE_TEXT} marginBottom={14}>
            Viewing last {filteredExpense.length} month{filteredExpense.length !== 1 ? 's' : ''} chart
          </StyledText>

          {/* Total */}
          <StyledText fontSize={34} fontWeight="800" color="rgba(60,80,75,0.30)" letterSpacing={-1.5} marginBottom={2}>
            {formatCurrency(data.totalExpense ?? 0, symbol)}
          </StyledText>
          <StyledText fontSize={12} color={EXPENSE_TEXT} marginBottom={10}>Total expense</StyledText>
        </Stack>

        {/* Bar chart */}
        <Stack paddingHorizontal={20} paddingBottom={4}>
          <BarChart
            data={expenseBars}
            barWidth={expenseBarWidth}
            height={130}
            width={chartWidth}
            spacing={expenseBarCount === 1 ? 0 : 10}
            roundedTop
            roundedBottom
            barBorderRadius={expenseBarCount === 1 ? expenseBarWidth / 2 : 10}
            xAxisLabelTextStyle={{ color: EXPENSE_TEXT, fontSize: 11, fontWeight: '600' }}
            backgroundColor="transparent"
            yAxisThickness={0}
            xAxisThickness={0}
            hideYAxisText
            noOfSections={3}
            dashGap={6}
            dashWidth={5}
            rulesType="dashed"
            rulesColor="rgba(100,140,130,0.22)"
            maxValue={expenseMaxVal * 1.25}
            minValue={0}
            activeOpacity={0.75}
          />
        </Stack>

        {/* Time range selector */}
        <Stack horizontal justifyContent="space-around"
          paddingHorizontal={20} paddingBottom={20} paddingTop={4}>
          {EXPENSE_RANGES.map(r => {
            const isActive = r === expenseRange
            return (
              <StyledPressable key={r} onPress={() => setExpenseRange(r)}
                paddingHorizontal={12} paddingVertical={7} borderRadius={18}
                backgroundColor={isActive ? Colors.primary : 'transparent'}
                alignItems="center" justifyContent="center"
                minWidth={36}>
                <StyledText fontSize={12} fontWeight={isActive ? '700' : '500'}
                  color={isActive ? '#fff' : EXPENSE_TEXT}>
                  {r}
                </StyledText>
              </StyledPressable>
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
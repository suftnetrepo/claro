import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import {
  Stack, StyledText, StyledPressable, StyledCard,
  StyledDivider, StyledProgressBar,
  StyledSkeleton, StyledEmptyState, TabBar, StyledPage,
} from 'fluent-styles'
import { Dimensions } from 'react-native'
import { BarChart, LineChart } from 'react-native-charts-kit'
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

// Category bar chart using react-native-charts-kit
function CategoryChart({ categories, color }: { categories: CategorySpending[]; color: string }) {
  const Colors = useColors()
  
  try {
    // Guard 1: no categories or not an array
    if (!Array.isArray(categories) || categories.length === 0) {
      console.log('[CategoryChart] Guard 1: Categories is not valid array or empty')
      return null
    }

    // Guard 2: validate screen dimensions
    const screenW = Dimensions.get('window').width
    if (!screenW || screenW <= 0) {
      console.log('[CategoryChart] Guard 2: Invalid screen width', screenW)
      return null
    }
    const chartW = screenW - 32
    
    // Top 6 categories for visual clarity
    const topCategories = categories.slice(0, 6)
    
    // Guard 3: empty top categories
    if (topCategories.length === 0) {
      console.log('[CategoryChart] Guard 3: No top categories after slice')
      return null
    }

    // Guard 4: validate all category objects
    const allValid = topCategories.every(c => c && typeof c === 'object' && 'total' in c)
    if (!allValid) {
      console.log('[CategoryChart] Guard 4: Some categories have invalid structure')
      return null
    }

    // Extract labels
    const labels = topCategories.map(c => {
      const name = (c && c.categoryName) || 'Unknown'
      return typeof name === 'string' && name.length > 8 ? name.substring(0, 8) : String(name)
    })
    
    // Extract and validate data
    const data = topCategories.map((c, idx) => {
      if (!c || typeof c !== 'object') {
        console.warn(`[CategoryChart] Invalid category at index ${idx}`)
        return 0
      }
      const value = Number(c.total) || 0
      const valid = (isFinite(value) && value >= 0) ? value : 0
      return valid
    })
    
    // Guard 5: ensure data array is valid
    if (!Array.isArray(data) || data.length === 0) {
      console.log('[CategoryChart] Guard 5: Data array is invalid after extraction')
      return null
    }

    // Guard 6: ensure we have at least some non-zero values
    const hasValidData = data.some(v => v > 0 && isFinite(v) && v !== Infinity)
    if (!hasValidData) {
      console.log('[CategoryChart] Guard 6: No valid data values (all zero or invalid)')
      return null
    }

    // Guard 7: validate all data elements
    const dataValid = data.every(v => typeof v === 'number' && isFinite(v) && v >= 0)
    if (!dataValid) {
      console.log('[CategoryChart] Guard 7: Some data elements are invalid', data)
      return null
    }

    // Build chartData matching react-native-charts-kit expectations
    const chartData = {
      labels: labels.slice(0, data.length),
      datasets: [
        {
          data: [...data],
          data2: data.map(() => 0), // Required by library type
          color: () => color || 'rgba(200, 200, 200, 1)',
          strokeWidth: 2,
        }
      ],
    }

    // Guard 8: validate complete chartData structure
    if (!chartData 
        || !chartData.labels 
        || !Array.isArray(chartData.labels)
        || !chartData.datasets 
        || !Array.isArray(chartData.datasets)
        || chartData.datasets.length === 0) {
      console.log('[CategoryChart] Guard 8: chartData structure invalid (top level)')
      return null
    }

    const dataset = chartData.datasets[0]
    if (!dataset 
        || !Array.isArray(dataset.data) 
        || dataset.data.length === 0) {
      console.log('[CategoryChart] Guard 8b: chartData.datasets[0] invalid or data missing', dataset)
      return null
    }

    // Guard 9: validate Colors object
    if (!Colors || !Colors.bgCard || !Colors.textMuted) {
      console.log('[CategoryChart] Guard 9: Colors object invalid', Colors)
      return null
    }

    console.log('[CategoryChart] All guards passed, rendering BarChart with data:', {
      labelsLength: chartData.labels.length,
      dataLength: dataset.data.length,
      dataValues: dataset.data,
    })

    // Minimal chartConfig with only essential properties to avoid library bugs
    const chartConfig = {
      backgroundColor: Colors.bgCard,
      backgroundGradientFrom: Colors.bgCard,
      backgroundGradientTo: Colors.bgCard,
      color: () => Colors.textMuted,
      labelColor: () => Colors.textMuted,
      decimalPlaces: 0,
    }

    return (
      <Stack alignItems="center" paddingVertical={8}>
        <BarChart
          data={chartData}
          width={chartW}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={45}
          fromZero
          withInnerLines={false}
          segments={4}
          showBarTops={false}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </Stack>
    )
  } catch (error) {
    console.error('[CategoryChart] Unexpected error:', error, { categories, color })
    return null
  }
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
          {/* Chart card with improved framing */}
          <Stack gap={8}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} paddingHorizontal={4}>
              BREAKDOWN
            </StyledText>
            <StyledCard padding={16} borderRadius={18} backgroundColor={Colors.bgCard}
              borderWidth={1} borderColor={Colors.border}
              style={{ shadowColor: Colors.border, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 }}>
              <CategoryChart categories={expenseByCategory} color={Colors.expense} />
            </StyledCard>
          </Stack>

          {/* Category details card */}
          {expenseByCategory.length > 0 && (
            <Stack gap={8}>
              <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} paddingHorizontal={4}>
                BY CATEGORY
              </StyledText>
              <StyledCard padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
                borderWidth={1} borderColor={Colors.border}>
                {expenseByCategory.map((item, i) => (
                  <Stack key={item.categoryId}>
                    <CategoryRow item={item} symbol={symbol} />
                    {i < expenseByCategory.length - 1 && (
                      <StyledDivider borderBottomColor={Colors.border} marginLeft={50} />
                    )}
                  </Stack>
                ))}
              </StyledCard>
            </Stack>
          )}
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
          {/* Chart card */}
          <Stack gap={8}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} paddingHorizontal={4}>
              BREAKDOWN
            </StyledText>
            <StyledCard padding={16} borderRadius={18} backgroundColor={Colors.bgCard}
              borderWidth={1} borderColor={Colors.border}
              style={{ shadowColor: Colors.border, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 }}>
              <CategoryChart categories={incomeByCategory} color={Colors.income} />
            </StyledCard>
          </Stack>

          {/* Category details */}
          {incomeByCategory.length > 0 && (
            <Stack gap={8}>
              <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} paddingHorizontal={4}>
                BY SOURCE
              </StyledText>
              <StyledCard padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
                borderWidth={1} borderColor={Colors.border}>
                {incomeByCategory.map((item, i) => (
                  <Stack key={item.categoryId}>
                    <CategoryRow item={item} symbol={symbol} />
                    {i < incomeByCategory.length - 1 && (
                      <StyledDivider borderBottomColor={Colors.border} marginLeft={50} />
                    )}
                  </Stack>
                ))}
              </StyledCard>
            </Stack>
          )}
        </>
      )}
    </ScrollView>
  )
}

// ─── TrendsTab: 6-month line chart with key metrics ─────────────────────────────
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
  
  // Validate monthly data structure
  const validMonthly = monthly.filter(m => m && typeof m === 'object')
  if (validMonthly.length === 0) {
    console.warn('TrendsTab: No valid monthly data')
    return (
      <Stack flex={1} padding={16}>
        <StyledEmptyState variant="minimal" illustration="📈"
          title="Not enough data yet"
          description="Trends appear after logging transactions across multiple months" animated />
      </Stack>
    )
  }

  const hasData = validMonthly.some(m => (Number(m.expense) || 0) > 0 || (Number(m.income) || 0) > 0)

  if (!hasData) {
    return (
      <Stack flex={1} padding={16}>
        <StyledEmptyState variant="minimal" illustration="📈"
          title="Not enough data yet"
          description="Trends appear after logging transactions across multiple months" animated />
      </Stack>
    )
  }

  const nonZeroMonths = validMonthly.filter(m => (Number(m.expense) || 0) > 0)
  const avgExpense    = nonZeroMonths.length > 0
    ? nonZeroMonths.reduce((s, m) => s + (Number(m.expense) || 0), 0) / nonZeroMonths.length : 0
  const maxExp = [...validMonthly].sort((a, b) => (Number(b.expense) || 0) - (Number(a.expense) || 0))[0]
  const minExp = [...validMonthly].filter(m => (Number(m.expense) || 0) > 0).sort((a, b) => (Number(a.expense) || 0) - (Number(b.expense) || 0))[0]

  const screenW = Dimensions.get('window').width
  const chartW = screenW - 32

  // Prepare data for spending trend with validation
  const spendingData = {
    labels: validMonthly.map(m => {
      try {
        return m.month && typeof m.month === 'string' ? m.month.substring(0, 3) : '---'
      } catch {
        return '---'
      }
    }),
    datasets: [{
      data: validMonthly.map(m => {
        const val = Number(m.expense) || 0
        return (isFinite(val) && val >= 0) ? val : 0
      }),
      data2: validMonthly.map(() => 0), // Required by library type
      color: () => Colors.primary,
      strokeWidth: 3,
    }],
  }

  // Prepare data for income trend with validation
  const incomeData = {
    labels: validMonthly.map(m => {
      try {
        return m.month && typeof m.month === 'string' ? m.month.substring(0, 3) : '---'
      } catch {
        return '---'
      }
    }),
    datasets: [{
      data: validMonthly.map(m => {
        const val = Number(m.income) || 0
        return (isFinite(val) && val >= 0) ? val : 0
      }),
      data2: validMonthly.map(() => 0), // Required by library type
      color: () => Colors.income,
      strokeWidth: 3,
    }],
  }

  const chartConfig = {
    backgroundColor: Colors.bgCard,
    backgroundGradientFrom: Colors.bgCard,
    backgroundGradientTo: Colors.bgCard,
    color: () => Colors.textMuted,
    labelColor: () => Colors.textMuted,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 11,
      fontWeight: '600',
    },
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }} showsVerticalScrollIndicator={false}>
      {/* Key metrics */}
      <Stack gap={12}>
        <Stack horizontal flex={1} gap={12}>
          <StyledCard flex={1} padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>AVG MONTHLY</StyledText>
            <StyledText fontSize={22} fontWeight="800" color={Colors.expense} marginTop={6} letterSpacing={-0.5} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(avgExpense, symbol)}
            </StyledText>
          </StyledCard>
          <StyledCard flex={1} padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>HIGHEST</StyledText>
            <StyledText fontSize={16} fontWeight="800" color={Colors.expense} marginTop={6}>{maxExp?.month}</StyledText>
            <StyledText fontSize={12} color={Colors.textMuted} marginTop={2} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(maxExp?.expense ?? 0, symbol)}
            </StyledText>
          </StyledCard>
          <StyledCard flex={1} padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>LOWEST</StyledText>
            <StyledText fontSize={16} fontWeight="800" color={Colors.income} marginTop={6}>{minExp?.month}</StyledText>
            <StyledText fontSize={12} color={Colors.textMuted} marginTop={2} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(minExp?.expense ?? 0, symbol)}
            </StyledText>
          </StyledCard>
        </Stack>
      </Stack>

      {/* 6-month spending trend */}
      {spendingData?.datasets?.[0]?.data?.length > 0 && (
        <Stack gap={8}>
          <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} paddingHorizontal={4}>
            6-MONTH SPENDING TREND
          </StyledText>
          <StyledCard padding={12} borderRadius={16} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <LineChart
              data={spendingData}
              width={chartW}
              height={220}
              chartConfig={chartConfig}
              bezier
              withDots={true}
              withInnerLines={false}
              segments={4}
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
            />
          </StyledCard>
        </Stack>
      )}

      {/* 6-month income trend */}
      {incomeData?.datasets?.[0]?.data?.length > 0 && (
        <Stack gap={8}>
          <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} paddingHorizontal={4}>
            6-MONTH INCOME TREND
          </StyledText>
          <StyledCard padding={12} borderRadius={16} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <LineChart
              data={incomeData}
              width={chartW}
              height={220}
              chartConfig={chartConfig}
              bezier
              withDots={true}
              withInnerLines={false}
              segments={4}
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
            />
          </StyledCard>
        </Stack>
      )}
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

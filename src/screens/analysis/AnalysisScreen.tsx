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
  if (!categories.length) return null

  const Colors = useColors()
  const screenW = Dimensions.get('window').width
  const chartW = screenW - 32
  
  // Top 6 categories for visual clarity
  const topCategories = categories.slice(0, 6)
  
  const chartData = {
    labels: topCategories.map(c => c.categoryName.substring(0, 8)),
    datasets: [{
      data: topCategories.map(c => c.total),
      data2: topCategories.map(c => 0), // required by library
    }],
  }

  const chartConfig = {
    backgroundColor: Colors.bgCard,
    backgroundGradientFrom: Colors.bgCard,
    backgroundGradientTo: Colors.bgCard,
    color: () => color,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: () => Colors.textMuted,
    propsForLabels: {
      fontSize: 11,
      fontWeight: '600',
    },
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
        showBarTops={true}
        yAxisLabel=""
        yAxisSuffix=""
      />
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

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }} showsVerticalScrollIndicator={false}>
      <Stack horizontal gap={12}>
        <SummaryCard label="TOTAL SPENT"  amount={data.totalExpense} symbol={symbol} color={Colors.expense} />
        <SummaryCard label="NET BALANCE"  amount={data.netBalance}   symbol={symbol}
          color={data.netBalance >= 0 ? Colors.income : Colors.expense} />
      </Stack>

      {data.totalExpense === 0 ? (
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
              <CategoryChart categories={data.expenseByCategory} color={Colors.expense} />
            </StyledCard>
          </Stack>

          {/* Category details card */}
          <Stack gap={8}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} paddingHorizontal={4}>
              BY CATEGORY
            </StyledText>
            <StyledCard padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
              borderWidth={1} borderColor={Colors.border}>
              {data.expenseByCategory.map((item, i) => (
                <Stack key={item.categoryId}>
                  <CategoryRow item={item} symbol={symbol} />
                  {i < data.expenseByCategory.length - 1 && (
                    <StyledDivider borderBottomColor={Colors.border} marginLeft={50} />
                  )}
                </Stack>
              ))}
            </StyledCard>
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

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }} showsVerticalScrollIndicator={false}>
      <Stack horizontal gap={12}>
        <SummaryCard label="TOTAL INCOME" amount={data.totalIncome}  symbol={symbol} color={Colors.income} />
        <SummaryCard label="TOTAL SPENT"  amount={data.totalExpense} symbol={symbol} color={Colors.expense} />
      </Stack>

      {/* Net balance highlight card */}
      <StyledCard padding={20} borderRadius={18}
        backgroundColor={data.netBalance >= 0 ? Colors.incomeLight : Colors.expenseLight}
        borderWidth={2} borderColor={data.netBalance >= 0 ? Colors.income : Colors.expense}>
        <StyledText fontSize={11} fontWeight="700" letterSpacing={1}
          color={data.netBalance >= 0 ? Colors.income : Colors.expense}>NET BALANCE</StyledText>
        <StyledText fontSize={32} fontWeight="800" letterSpacing={-1} marginTop={6}
          color={data.netBalance >= 0 ? Colors.income : Colors.expense}>
          {data.netBalance >= 0 ? '+' : ''}{formatCurrency(data.netBalance, symbol)}
        </StyledText>
        <StyledText fontSize={13} color={Colors.textMuted} marginTop={6}>
          {data.netBalance >= 0 ? '✓ You saved money this month' : '⚠ Spending exceeded income'}
        </StyledText>
      </StyledCard>

      {data.totalIncome === 0 ? (
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
              <CategoryChart categories={data.incomeByCategory} color={Colors.income} />
            </StyledCard>
          </Stack>

          {/* Category details */}
          <Stack gap={8}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} paddingHorizontal={4}>
              BY SOURCE
            </StyledText>
            <StyledCard padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
              borderWidth={1} borderColor={Colors.border}>
              {data.incomeByCategory.map((item, i) => (
                <Stack key={item.categoryId}>
                  <CategoryRow item={item} symbol={symbol} />
                  {i < data.incomeByCategory.length - 1 && (
                    <StyledDivider borderBottomColor={Colors.border} marginLeft={50} />
                  )}
                </Stack>
              ))}
            </StyledCard>
          </Stack>
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

  const monthly  = data.monthlyTotals
  const hasData  = monthly.some(m => m.expense > 0 || m.income > 0)

  if (!hasData) {
    return (
      <Stack flex={1} padding={16}>
        <StyledEmptyState variant="minimal" illustration="📈"
          title="Not enough data yet"
          description="Trends appear after logging transactions across multiple months" animated />
      </Stack>
    )
  }

  const nonZeroMonths = monthly.filter(m => m.expense > 0)
  const avgExpense    = nonZeroMonths.length > 0
    ? nonZeroMonths.reduce((s, m) => s + m.expense, 0) / nonZeroMonths.length : 0
  const maxExp = [...monthly].sort((a, b) => b.expense - a.expense)[0]
  const minExp = [...monthly].filter(m => m.expense > 0).sort((a, b) => a.expense - b.expense)[0]

  const screenW = Dimensions.get('window').width
  const chartW = screenW - 32

  // Prepare data for spending trend
  const spendingData = {
    labels: monthly.map(m => m.month.substring(0, 3)),
    datasets: [{
      data: monthly.map(m => m.expense || 0),
      data2: monthly.map(m => 0), // required by library
      strokeWidth: 3,
      color: () => Colors.primary,
    }],
  }

  // Prepare data for income trend
  const incomeData = {
    labels: monthly.map(m => m.month.substring(0, 3)),
    datasets: [{
      data: monthly.map(m => m.income || 0),
      data2: monthly.map(m => 0), // required by library
      strokeWidth: 3,
      color: () => Colors.income,
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

      {/* 6-month income trend */}
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

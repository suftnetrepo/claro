import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import {
  Stack, StyledText, StyledPressable, StyledCard,
  StyledDivider, StyledProgressBar,
  StyledSkeleton, StyledEmptyState, TabBar, StyledPage,
} from 'fluent-styles'
import { Dimensions } from 'react-native'
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg'
import { format } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons'
import { IconCircle } from '../../icons/map'
import { Colors, useColors } from '../../constants'
import { useAnalysis, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { formatCurrency } from '../../utils'
import type { CategorySpending } from '../../hooks'

const CONTAINER_PAD = 64
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

// ─── Category bar chart — each bar uses its own category color ────────────────
function CategoryChart({ categories }: { categories: CategorySpending[] }) {
  if (!categories.length) return null

  const screenW    = Dimensions.get('window').width
  const chartW     = screenW - CONTAINER_PAD
  const pctLabelH  = 20   // reserved above bars for % label
  const plotH      = 150  // bar drawing area
  const labelH     = 36   // category name below
  const svgH       = pctLabelH + plotH + labelH
  const count      = categories.length
  const slotW      = chartW / count
  const barW       = slotW * 0.58
  const barPad     = (slotW - barW) / 2
  const rx         = barW / 2
  const maxVal     = Math.max(...categories.map(c => c.total), 1)
  // Max chars per label depends on bar width
  const maxChars   = Math.max(4, Math.floor(barW / 7))

  return (
    <Svg width={chartW} height={svgH}>
      {categories.map((cat, i) => {
        const barH  = (cat.total / maxVal) * plotH
        const bx    = i * slotW + barPad
        const by    = pctLabelH + (plotH - barH)   // offset by pctLabelH
        const cx    = bx + barW / 2
        const label = cat.categoryName.length > maxChars
          ? cat.categoryName.slice(0, maxChars - 1) + '…'
          : cat.categoryName

        return (
          <G key={cat.categoryId}>
            {/* Bar */}
            <Rect
              x={bx} y={by}
              width={barW} height={barH}
              rx={rx} ry={rx}
              fill={cat.categoryColor}
              opacity={0.9}
            />
            {/* % label above bar — always visible, sits in reserved pctLabelH zone */}
            <SvgText
              x={cx}
              y={by - 5}
              textAnchor="middle"
              fontSize={10}
              fontWeight="700"
              fill={cat.categoryColor}
            >
              {cat.percentage.toFixed(0)}%
            </SvgText>
            {/* Category name below */}
            <SvgText
              x={cx}
              y={pctLabelH + plotH + 22}
              textAnchor="middle"
              fontSize={10}
              fill={Colors.textMuted}
              fontFamily="System"
            >
              {label}
            </SvgText>
          </G>
        )
      })}
    </Svg>
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
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
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
          <StyledCard padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} marginBottom={12}>
              SPENDING BY CATEGORY
            </StyledText>
            <CategoryChart categories={data.expenseByCategory} />
          </StyledCard>

          <StyledCard padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} marginBottom={4}>
              BY CATEGORY
            </StyledText>
            {data.expenseByCategory.map((item, i) => (
              <Stack key={item.categoryId}>
                <CategoryRow item={item} symbol={symbol} />
                {i < data.expenseByCategory.length - 1 && (
                  <StyledDivider borderBottomColor={Colors.border} marginLeft={50} />
                )}
              </Stack>
            ))}
          </StyledCard>
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
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
      <Stack horizontal gap={12}>
        <SummaryCard label="TOTAL INCOME" amount={data.totalIncome}  symbol={symbol} color={Colors.income} />
        <SummaryCard label="TOTAL SPENT"  amount={data.totalExpense} symbol={symbol} color={Colors.expense} />
      </Stack>

      <StyledCard padding={16} borderRadius={16}
        backgroundColor={data.netBalance >= 0 ? Colors.incomeLight : Colors.expenseLight}
        borderWidth={1} borderColor={data.netBalance >= 0 ? Colors.income : Colors.expense}>
        <StyledText fontSize={11} fontWeight="700" letterSpacing={1}
          color={data.netBalance >= 0 ? Colors.income : Colors.expense}>NET BALANCE</StyledText>
        <StyledText fontSize={28} fontWeight="800" letterSpacing={-1} marginTop={4}
          color={data.netBalance >= 0 ? Colors.income : Colors.expense}>
          {data.netBalance >= 0 ? '+' : ''}{formatCurrency(data.netBalance, symbol)}
        </StyledText>
        <StyledText fontSize={12} color={Colors.textMuted} marginTop={4}>
          {data.netBalance >= 0 ? 'You saved money this month 🎉' : 'Spending exceeded income this month'}
        </StyledText>
      </StyledCard>

      {data.totalIncome === 0 ? (
        <StyledEmptyState variant="minimal" illustration="💰"
          title="No income this month" description="Add income transactions to see your breakdown" animated />
      ) : (
        <>
          <StyledCard padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} marginBottom={12}>
              INCOME BY SOURCE
            </StyledText>
            <CategoryChart categories={data.incomeByCategory} />
          </StyledCard>

          <StyledCard padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
            borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} marginBottom={4}>
              BY SOURCE
            </StyledText>
            {data.incomeByCategory.map((item, i) => (
              <Stack key={item.categoryId}>
                <CategoryRow item={item} symbol={symbol} />
                {i < data.incomeByCategory.length - 1 && (
                  <StyledDivider borderBottomColor={Colors.border} marginLeft={50} />
                )}
              </Stack>
            ))}
          </StyledCard>
        </>
      )}
    </ScrollView>
  )
}

// ─── StyledBar: 6-month bar chart ─────────────────────────────────────────────
interface BarChartData {
  label: string
  value: number | null
  active?: boolean
}

interface BarChartColors {
  activeTop: string
  activeBottom: string
  inactiveBar: string
  tooltipBg: string
  tooltipText: string
  activeLabelColor: string
  inactiveLabelColor: string
}

function StyledBar({
  data,
  height = 150,
  barWidthRatio = 0.6,
  containerPaddingHorizontal = 0,
  tooltipLabel = '',
  colors,
}: {
  data: BarChartData[]
  height?: number
  barWidthRatio?: number
  containerPaddingHorizontal?: number
  tooltipLabel?: string
  colors: BarChartColors
}) {
  const screenW = Dimensions.get('window').width
  const chartW = screenW - 2 * containerPaddingHorizontal
  const count = data.length
  const slotW = chartW / count
  const barW = slotW * barWidthRatio
  const barPad = (slotW - barW) / 2
  const rx = barW / 6

  const nonNullValues = data.filter(d => d.value !== null).map(d => d.value as number)
  const maxVal = nonNullValues.length > 0 ? Math.max(...nonNullValues, 1) : 1

  const tooltipX = data.findIndex(d => d.active)
  const tooltipBarX = tooltipX >= 0 ? tooltipX * slotW + barW / 2 + barPad : 0

  return (
    <Svg width={chartW} height={height + 40}>
      {/* Tooltip */}
      {tooltipX >= 0 && tooltipLabel && (
        <G>
          {/* Tooltip bg bubble */}
          <Rect
            x={Math.max(10, Math.min(tooltipBarX - 45, chartW - 90))}
            y={10}
            width={90}
            height={28}
            rx={6}
            fill={colors.tooltipBg}
          />
          {/* Tooltip text */}
          <SvgText
            x={Math.max(10, Math.min(tooltipBarX - 45, chartW - 90)) + 45}
            y={32}
            textAnchor="middle"
            fontSize={12}
            fontWeight="700"
            fill={colors.tooltipText}
          >
            {tooltipLabel.length > 10 ? tooltipLabel.substring(0, 10) + '…' : tooltipLabel}
          </SvgText>
        </G>
      )}

      {/* Bars */}
      {data.map((item, i) => {
        const val = item.value ?? 0
        const barH = (val / maxVal) * height
        const bx = i * slotW + barPad
        const by = 50 + (height - barH)
        const cx = bx + barW / 2
        const isActive = item.active ?? false
        const barColor = isActive ? colors.activeBottom : colors.inactiveBar

        return (
          <G key={i}>
            {/* Bar */}
            <Rect
              x={bx}
              y={by}
              width={barW}
              height={barH}
              rx={rx}
              ry={rx}
              fill={barColor}
              opacity={0.85}
            />
            {/* Month label */}
            <SvgText
              x={cx}
              y={50 + height + 20}
              textAnchor="middle"
              fontSize={10}
              fill={isActive ? colors.activeLabelColor : colors.inactiveLabelColor}
              fontWeight={isActive ? '700' : '400'}
            >
              {typeof item.label === 'string' && item.label.length > 0
                ? item.label.substring(0, 3)
                : 'N/A'}
            </SvgText>
          </G>
        )
      })}
    </Svg>
  )
}

// ─── Trends tab ───────────────────────────────────────────────────────────────
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

  const expenseBarData = monthly.map((m, i) => ({
    label: m.month, value: m.expense || null, active: i === monthly.length - 1,
  }))
  const incomeBarData = monthly.map((m, i) => ({
    label: m.month, value: m.income || null, active: i === monthly.length - 1,
  }))

  const barColors = (activeColor: string, tipBg: string) => ({
    activeTop:          activeColor,
    activeBottom:       tipBg,
    inactiveBar:        Colors.border,
    hatchLine:          'transparent',
    tooltipBg:          tipBg,
    tooltipText:        Colors.white,
    activeLabelColor:   Colors.textPrimary,
    inactiveLabelColor: Colors.textMuted,
  })

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>

      <StyledCard padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
        borderWidth={1} borderColor={Colors.border}>
        <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} marginBottom={2}>
          6-MONTH SPENDING
        </StyledText>
        <StyledText fontSize={11} color={Colors.textMuted} marginBottom={12}>
          Current month highlighted
        </StyledText>
        <StyledBar
          data={expenseBarData}
          containerPaddingHorizontal={CONTAINER_PAD}
          height={150} barWidthRatio={0.6}
          tooltipLabel={expenseBarData.find(d => d.active)?.value
            ? formatCurrency(expenseBarData.find(d => d.active)!.value as number, symbol)
            : ''}
          colors={barColors(Colors.primaryLight, Colors.primary)}
        />
      </StyledCard>

      <StyledCard padding={16} borderRadius={16} backgroundColor={Colors.bgCard}
        borderWidth={1} borderColor={Colors.border}>
        <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1} marginBottom={2}>
          6-MONTH INCOME
        </StyledText>
        <StyledText fontSize={11} color={Colors.textMuted} marginBottom={12}>
          Current month highlighted
        </StyledText>
        <StyledBar
          data={incomeBarData}
          containerPaddingHorizontal={CONTAINER_PAD}
          height={150} barWidthRatio={0.6}
          tooltipLabel={incomeBarData.find(d => d.active)?.value
            ? formatCurrency(incomeBarData.find(d => d.active)!.value as number, symbol)
            : ''}
          colors={barColors(Colors.primaryLight, Colors.income)}
        />
      </StyledCard>

      <Stack gap={12}>
        <StyledCard padding={14} borderRadius={14} backgroundColor={Colors.bgCard}
          borderWidth={1} borderColor={Colors.border}>
          <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>AVG MONTHLY SPEND</StyledText>
          <StyledText fontSize={22} fontWeight="800" color={Colors.expense} marginTop={4} letterSpacing={-1} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(avgExpense, symbol)}
          </StyledText>
        </StyledCard>
        <Stack horizontal gap={12}>
          {maxExp && (
            <StyledCard flex={1} padding={14} borderRadius={14} backgroundColor={Colors.bgCard}
              borderWidth={1} borderColor={Colors.border}>
              <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>HIGHEST MONTH</StyledText>
              <StyledText fontSize={18} fontWeight="800" color={Colors.expense} marginTop={4}>{maxExp.month}</StyledText>
              <StyledText fontSize={12} color={Colors.textMuted} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(maxExp.expense, symbol)}
              </StyledText>
            </StyledCard>
          )}
          {minExp && (
            <StyledCard flex={1} padding={14} borderRadius={14} backgroundColor={Colors.bgCard}
              borderWidth={1} borderColor={Colors.border}>
              <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>LOWEST MONTH</StyledText>
              <StyledText fontSize={18} fontWeight="800" color={Colors.income} marginTop={4}>{minExp.month}</StyledText>
              <StyledText fontSize={12} color={Colors.textMuted} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(minExp.expense, symbol)}
              </StyledText>
            </StyledCard>
          )}
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

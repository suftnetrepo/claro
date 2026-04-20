import React, { useCallback, useState } from 'react'
import { SectionList, RefreshControl, useWindowDimensions } from 'react-native'
import { router } from 'expo-router'
import {
  Stack, StyledPressable, StyledEmptyState, StyledSkeleton,
  StyledPage, StyledHeader, StyledCard, StyledChip,StyledTextInput
} from 'fluent-styles'
import { dialogueService, toastService } from 'fluent-styles'
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg'
import { ChevronLeftIcon } from '../../icons'
import { IconCircle } from '../../icons/map'
import { useColors } from '../../constants'
import { useTransactions, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { formatCurrency, formatShortDate, formatTime, calculatePercentageChange, prevMonth } from '../../utils'
import { SwipeableRow, Text } from '../../components'
import type { TransactionWithRefs } from '../../hooks'

type FilterType = 'all' | 'expense' | 'income' | 'transfer'

// ─── Trend Indicator ──────────────────────────────────────────────────────────
/**
 * Shows percentage change with arrow and context.
 * Color indicates semantic meaning (good/bad) based on metric type.
 */
function TrendIndicator({
  percentage,
  isIncrease,
  trend,
  metricType,
}: {
  percentage: number
  isIncrease: boolean
  trend: string // "↑ X.X%" or "↓ X.X%"
  metricType: 'income' | 'expense' | 'net'
}) {
  const Colors = useColors()
  
  // Determine color based on metric type and direction
  const getTrendColor = () => {
    if (metricType === 'income') {
      // For income: up = good (green), down = bad (red)
      return isIncrease ? Colors.income : Colors.expense
    } else if (metricType === 'expense') {
      // For expense: up = bad (red), down = good (green)
      return isIncrease ? Colors.expense : Colors.income
    } else {
      // For net: up = good (green), down = bad (red)
      return isIncrease ? Colors.income : Colors.expense
    }
  }
  
  const trendColor = getTrendColor()
  
  return (
    <Text fontSize={11} fontWeight="600" color={trendColor} numberOfLines={1}>
      {trend} vs last month
    </Text>
  )
}

// ─── Mini sparkline ──────────────────────────────────────────────────────────
function MiniSpark({ color, up = true, w = 64, h = 28 }: { color: string; up?: boolean; w?: number; h?: number }) {
  const line = up
    ? `M 0 ${h-4} C 14 ${h-6} 24 ${h-16} 38 ${h-14} C 50 ${h-12} 56 ${h-22} ${w} 4`
    : `M 0 4 C 10 4 18 ${h-18} 30 ${h-16} C 42 ${h-14} 52 ${h-8} ${w} ${h-4}`
  const area = line + ` L ${w} ${h} L 0 ${h} Z`
  const gid  = `sg${color.replace(/[^a-z0-9]/gi,'')}`
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <SvgGrad id={gid} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.25" />
          <Stop offset="1" stopColor={color} stopOpacity="0"    />
        </SvgGrad>
      </Defs>
      <Path d={area} fill={`url(#${gid})`} />
      <Path d={line}  stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

// ─── Transaction row ──────────────────────────────────────────────────────────
function TxRow({ tx, symbol, onDelete, isFirst, isLast }: {
  tx: TransactionWithRefs; symbol: string
  onDelete: (id: string) => void; isFirst: boolean; isLast: boolean
}) {
  const Colors    = useColors()
  const isIncome  = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'
  const iconBg    = tx.categoryColor ?? (isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense)
  const amtColor  = isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense
  const prefix    = isIncome ? '+' : isTransfer ? '' : '-'

  return (
    <StyledCard
      borderTopLeftRadius={isFirst ? 18 : 0}
      borderTopRightRadius={isFirst ? 18 : 0}
      borderBottomLeftRadius={isLast ? 18 : 0}
      borderBottomRightRadius={isLast ? 18 : 0}
      marginHorizontal={16}
      borderRadius={0}
      overflow="hidden"
      backgroundColor={Colors.bgCard}
    >
      <SwipeableRow onDelete={() => onDelete(tx.id)}>
        <StyledPressable
          flexDirection="row" alignItems="center"
          paddingHorizontal={16} paddingVertical={13}
          backgroundColor={Colors.bgCard}
          onPress={() => router.push({ pathname: '/edit-transaction' as any, params: { id: tx.id } })}
        >
          <IconCircle iconKey={tx.categoryIcon ?? tx.type} bg={iconBg} size={44} />
          <Stack flex={1} gap={3} marginLeft={14}>
            <Text fontSize={15} fontWeight="700" color={Colors.textPrimary} numberOfLines={1}>
              {tx.categoryName ?? (isTransfer ? 'Transfer' : 'Uncategorized')}
            </Text>
            <Stack horizontal alignItems="center" gap={4}>
              {tx.accountName && <Text fontSize={12} color={Colors.textMuted}>{tx.accountName}</Text>}
              <Text fontSize={12} color={Colors.textMuted}>· {formatTime(new Date(tx.date))}</Text>
            </Stack>
          </Stack>
          <Text fontSize={15} fontWeight="700" color={amtColor}>
            {prefix}{formatCurrency(tx.amount, symbol)}
          </Text>
        </StyledPressable>
      </SwipeableRow>
    </StyledCard>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AllTransactionsScreen() {
  const Colors = useColors()
  const { data: settingsData } = useSettings()
  const symbol = settingsData?.currencySymbol ?? '$'
  const { data, loading, refetch, remove, totalIncome, totalExpense, grouped } = useTransactions()
  const { invalidateData } = useRecordsStore()
  const [refreshing, setRefreshing] = useState(false)
  const [filter,     setFilter]     = useState<FilterType>('all')
  const [search,     setSearch]     = useState('')

  const onRefresh = useCallback(async () => {
    setRefreshing(true); refetch(); setTimeout(() => setRefreshing(false), 600)
  }, [refetch])

  const handleDelete = useCallback(async (id: string) => {
    const ok = await dialogueService.confirm({
      title: 'Delete transaction?', message: 'This will also reverse the balance change on your account.',
      icon: '🗑️', confirmLabel: 'Delete', destructive: true,
    })
    if (ok) { await remove(id); invalidateData(); toastService.success('Transaction deleted') }
  }, [remove, invalidateData])

  // Filter + search
  const filtered = data.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (tx.categoryName ?? '').toLowerCase().includes(q)
          || (tx.accountName ?? '').toLowerCase().includes(q)
          || (tx.notes ?? '').toLowerCase().includes(q)
    }
    return true
  })

  const filteredGrouped = filtered.reduce<Record<string, TransactionWithRefs[]>>((acc, tx) => {
    const key = new Date(tx.date).toDateString()
    if (!acc[key]) acc[key] = []
    acc[key].push(tx)
    return acc
  }, {})

  const sections = Object.entries(filteredGrouped).map(([dateStr, txs]) => ({
    title: formatShortDate(new Date(dateStr)), data: txs,
  }))

  const netBalance = totalIncome - totalExpense
  
  // Previous month data for trend calculation
  const prevMonthDate = prevMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const { data: prevMonthTransactions } = useTransactions(prevMonthDate)
  const prevMonthIncome = prevMonthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const prevMonthExpense = prevMonthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const prevMonthNet = prevMonthIncome - prevMonthExpense
  
  // Calculate percentage changes
  const incomeChange = calculatePercentageChange(totalIncome, prevMonthIncome) as NonNullable<ReturnType<typeof calculatePercentageChange>>
  const expenseChange = calculatePercentageChange(totalExpense, prevMonthExpense) as NonNullable<ReturnType<typeof calculatePercentageChange>>
  const netChange = calculatePercentageChange(netBalance, prevMonthNet) as NonNullable<ReturnType<typeof calculatePercentageChange>>
  
  // Determine if we have valid previous data
  const hasPreviousData = prevMonthTransactions.length > 0

  const FILTERS: { value: FilterType; label: string; color: string }[] = [
    { value: 'all',      label: 'All',      color: Colors.primary  },
    { value: 'expense',  label: 'Expense',  color: Colors.expense  },
    { value: 'income',   label: 'Income',   color: Colors.income   },
    { value: 'transfer', label: 'Transfer', color: Colors.transfer },
  ]

  function RowDivider() {
    const Colors = useColors()
    const width = useWindowDimensions().width
    return <Stack horizontal width={width - 66-16} height={1} flex={1} backgroundColor={Colors.border} marginLeft={66} opacity={0.6} />
  }
  

  return (
    <StyledPage backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        <Stack backgroundColor={Colors.bg} paddingHorizontal={20} paddingTop={16} paddingBottom={12} gap={14}>

          {/* Nav row */}
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <StyledPressable
              width={38} height={38} borderRadius={19}
              backgroundColor={Colors.bgCard}
              alignItems="center" justifyContent="center"
              onPress={() => router.back()}
              style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
            >
              <ChevronLeftIcon size={18} color={Colors.textPrimary} strokeWidth={2.5} />
            </StyledPressable>
            <Text fontSize={17} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.3}>
              Transactions
            </Text>
            <Stack width={38} />
          </Stack>

          {/* Summary stat cards — label + amount top, trend + sparkline bottom */}
          <Stack horizontal gap={10}>
            {/* Income */}
            <StyledCard flex={1} shadow="light" borderRadius={16} padding={14} backgroundColor={Colors.bgCard}>
              <Text fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={0.8}>INCOME</Text>
              <Text fontSize={14} fontWeight="800" color={Colors.income} letterSpacing={-0.5} marginTop={4} marginBottom={6} numberOfLines={1} adjustsFontSizeToFit>
                +{formatCurrency(totalIncome, symbol)}
              </Text>
              {hasPreviousData && (
                <Stack marginBottom={6}>
                  <TrendIndicator
                    percentage={incomeChange.percentage}
                    isIncrease={incomeChange.isIncrease}
                    trend={incomeChange.displayText}
                    metricType="income"
                  />
                </Stack>
              )}
              <MiniSpark color={Colors.income} up={false} w={80} h={24} />
            </StyledCard>
            {/* Expense */}
            <StyledCard flex={1} shadow="light" borderRadius={16} padding={14} backgroundColor={Colors.bgCard}>
              <Text fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={0.8}>EXPENSE</Text>
              <Text fontSize={14} fontWeight="800" color={Colors.expense} letterSpacing={-0.5} marginTop={4} marginBottom={6} numberOfLines={1} adjustsFontSizeToFit>
                -{formatCurrency(totalExpense, symbol)}
              </Text>
              {hasPreviousData && (
                <Stack marginBottom={6}>
                  <TrendIndicator
                    percentage={expenseChange.percentage}
                    isIncrease={expenseChange.isIncrease}
                    trend={expenseChange.displayText}
                    metricType="expense"
                  />
                </Stack>
              )}
              <MiniSpark color={Colors.expense} up={true} w={80} h={24} />
            </StyledCard>
            {/* Net */}
            <StyledCard flex={1} shadow="light" borderRadius={16} padding={14} backgroundColor={Colors.bgCard}>
              <Text fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={0.8}>NET</Text>
              <Text fontSize={14} fontWeight="800" letterSpacing={-0.5} marginTop={4} marginBottom={6} numberOfLines={1} adjustsFontSizeToFit
                color={netBalance >= 0 ? Colors.income : Colors.expense}>
                {netBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netBalance), symbol)}
              </Text>
              {hasPreviousData && (
                <Stack marginBottom={6}>
                  <TrendIndicator
                    percentage={netChange.percentage}
                    isIncrease={netChange.isIncrease}
                    trend={netChange.displayText}
                    metricType="net"
                  />
                </Stack>
              )}
              <MiniSpark color={netBalance >= 0 ? Colors.income : Colors.expense} up={netBalance >= 0} w={80} h={24} />
            </StyledCard>
          </Stack>

          {/* Search */}
          <StyledTextInput
            variant="filled"
            placeholder="Search transactions…"
            value={search}
            onChangeText={setSearch}
            clearable
            borderRadius={14}
            fontSize={14}
          />

          {/* Filter chips — explicit bgColor so active is always filled primary */}
          <Stack horizontal gap={8} flexWrap="wrap">
            {FILTERS.map(f => {
              const active = filter === f.value
              return (
                <StyledChip
                  key={f.value}
                  label={f.label}
                  variant="filled"
                  size="md"
                  selected={active}
                  color={active ? Colors.white : Colors.primary}
                  bgColor={active ? Colors.primary : Colors.bgMuted}
                  showCheck={false}
                  onPress={() => setFilter(f.value)}
                />
              )
            })}
          </Stack>

        </Stack>
      </StyledHeader.Full>

      {loading && !refreshing ? (
        <Stack paddingHorizontal={16}>
          <StyledSkeleton template="list-item" repeat={8} animation="shimmer" />
        </Stack>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderSectionHeader={({ section: { title } }) => (
            <Stack backgroundColor={Colors.bg} paddingHorizontal={20} paddingTop={16} paddingBottom={6}>
              <Text fontSize={11} fontWeight="700" color={Colors.textMuted} letterSpacing={1.2}>
                {title.toUpperCase()}
              </Text>
            </Stack>
          )}
          renderItem={({ item, index, section }) => (
            <TxRow
              tx={item} symbol={symbol} onDelete={handleDelete}
              isFirst={index === 0} isLast={index === section.data.length - 1}
            />
          )}
          ItemSeparatorComponent={() => (
            <RowDivider />
          )}
          ListEmptyComponent={
            <StyledEmptyState
              variant="minimal"
              illustration="📭"
              title={search ? 'No results found' : 'No transactions'}
              description={search ? `No transactions matching "${search}"` : 'Add transactions using the + button'}
              animated
            />
          }
        />
      )}
    </StyledPage>
  )
}
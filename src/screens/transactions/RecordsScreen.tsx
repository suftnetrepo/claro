import React, { useCallback, useState } from 'react'
import { SectionList, RefreshControl, useWindowDimensions } from 'react-native'
import {
  Stack, StyledText, StyledPressable, StyledEmptyState, StyledSkeleton,
  StyledPage, StyledCard, StyledDivider,
} from 'fluent-styles'
import { dialogueService, toastService } from 'fluent-styles'
import { router, useFocusEffect } from 'expo-router'
import { format } from 'date-fns'
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg'
import { Text } from '../../components'
import { IconCircle } from '../../icons/map'
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, BellIcon } from '../../icons'
import { useColors } from '../../constants'
import { useTransactions, useAccounts, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { formatCurrency, formatShortDate, formatTime } from '../../utils'
import { SwipeableRow } from '../../components'
import type { TransactionWithRefs } from '../../hooks'

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ color, bgColor, up = true }: { color: string; bgColor: string; up?: boolean }) {
  const W = 40, H = 38
  const linePath = up
    ? `M 0 ${H-6} C 6 ${H-8} 10 ${H-18} 16 ${H-16} C 22 ${H-14} 26 ${H-28} 40 6`
    : `M 0 8 C 6 6 11 ${H-22} 18 ${H-18} C 25 ${H-14} 30 ${H-10} 40 ${H-6}`
  const areaPath = linePath + ` L 40 ${H} L 0 ${H} Z`
  const gradId = `sg_${color.replace(/[^a-z0-9]/gi, '')}`
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <SvgGrad id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.22" />
          <Stop offset="1" stopColor={bgColor} stopOpacity="0" />
        </SvgGrad>
      </Defs>
      <Path d={areaPath} fill={`url(#${gradId})`} />
      <Path d={linePath} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────
function HomeHeader({ symbol }: { symbol: string }) {
  const Colors = useColors()
  const { totalBalance } = useAccounts()
  const { selectedMonth, prevMonth, nextMonth } = useRecordsStore()
  const isNow = selectedMonth.getMonth() === new Date().getMonth()
             && selectedMonth.getFullYear() === new Date().getFullYear()

  return (
    <Stack paddingHorizontal={20} paddingTop={12} paddingBottom={8}>
      <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={20}>
        <Stack gap={2}>
          <Text variant="subLabel" color={Colors.textMuted} letterSpacing={0.2}>Welcome back</Text>
          <Text fontSize={32} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.8}>Claro</Text>
        </Stack>
        <StyledPressable width={42} height={42} borderRadius={21} backgroundColor={Colors.bgCard}
          alignItems="center" justifyContent="center"
          style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}>
          <BellIcon size={20} color={Colors.textSecondary} />
        </StyledPressable>
      </Stack>

      {/* Balance card */}
      <StyledCard padding={22} borderRadius={24} backgroundColor={Colors.primary} overflow="hidden"
        style={{ shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.32, shadowRadius: 16, elevation: 10 }}>
        <Stack position="absolute" top={20} right={50} width={60} height={0} borderRadius={30} backgroundColor="rgba(255,255,255,0.05)" />
        <Text variant="label" color="rgba(255,255,255,0.7)" fontSize={13} letterSpacing={0.3}>Total Balance</Text>
        <Text fontSize={40} fontWeight="800" color="#fff" letterSpacing={-1.5} marginTop={6} marginBottom={18}>
          {formatCurrency(totalBalance, symbol)}
        </Text>
        <Stack horizontal alignItems="center" justifyContent="space-between">
          <StyledPressable width={34} height={34} borderRadius={17}
            backgroundColor="rgba(255,255,255,0.18)" alignItems="center" justifyContent="center" onPress={prevMonth}>
            <ChevronLeftIcon size={16} color="#fff" strokeWidth={2.5} />
          </StyledPressable>
          <Text variant="label" color="rgba(255,255,255,0.92)">{format(selectedMonth, 'MMMM yyyy')}</Text>
          <StyledPressable width={34} height={34} borderRadius={17}
            backgroundColor={isNow ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)'}
            alignItems="center" justifyContent="center" onPress={nextMonth} disabled={isNow}>
            <ChevronRightIcon size={16} color={isNow ? 'rgba(255,255,255,0.3)' : '#fff'} strokeWidth={2.5} />
          </StyledPressable>
        </Stack>
      </StyledCard>
    </Stack>
  )
}

// ─── Summary cards ────────────────────────────────────────────────────────────
function SummaryCard({ label, amount, symbol, color, lightColor, bgColor, up }: {
  label: string; amount: number; symbol: string
  color: string; lightColor: string; bgColor: string; up: boolean
}) {
  const Colors = useColors()
  return (
    <StyledCard flex={1} borderRadius={18} padding={16} backgroundColor={Colors.bgCard}
>
      <Stack horizontal alignItems="center" gap={8} justifyContent="space-between" >
        <Text variant="label" color={color}>{label}</Text>
        <Sparkline color={color} bgColor={bgColor} up={up} />
      </Stack>
      <Text fontSize={17} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5} numberOfLines={1} adjustsFontSizeToFit>
        {formatCurrency(amount, symbol)}
      </Text>
    </StyledCard>
  )
}

function MonthlySummary({ income, expense, symbol }: { income: number; expense: number; symbol: string }) {
  const Colors = useColors()
  return (
    <Stack horizontal gap={12} paddingHorizontal={20} paddingTop={8} paddingBottom={8}>
      <SummaryCard label="Expense" amount={expense} symbol={symbol} color={Colors.expense} lightColor={Colors.expenseLight} bgColor={Colors.bgCard} up={true} />
      <SummaryCard label="Income"  amount={income}  symbol={symbol} color={Colors.income}  lightColor={Colors.incomeLight}  bgColor={Colors.bgCard} up={false} />
    </Stack>
  )
}

// ─── Transaction row ──────────────────────────────────────────────────────────
function TransactionRow({ tx, symbol, onDelete }: { tx: TransactionWithRefs; symbol: string; onDelete: (id: string) => void }) {
  const Colors    = useColors()
  const isIncome  = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'
  const iconBg    = tx.categoryColor ?? (isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense)
  const amtColor  = isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense
  const prefix    = isIncome ? '+' : isTransfer ? '' : '-'

  return (
    <SwipeableRow onDelete={() => onDelete(tx.id)}>
      <StyledPressable flexDirection="row" alignItems="center"
        paddingHorizontal={16} paddingVertical={14} backgroundColor={Colors.bgCard}
        onPress={() => router.push({ pathname: '/edit-transaction' as any, params: { id: tx.id } })}>
        <IconCircle iconKey={tx.categoryIcon ?? tx.type} bg={iconBg} size={46} />
        <Stack flex={1} gap={3} marginLeft={14}>
          <Text fontSize={15} fontWeight="700" color={Colors.textPrimary} numberOfLines={1}>
            {tx.categoryName ?? (isTransfer ? 'Transfer' : 'Uncategorized')}
          </Text>
          <Stack horizontal alignItems="center" gap={4}>
            {tx.accountName && <Text variant="bodySmall" color={Colors.textMuted}>{tx.accountName}</Text>}
            <Text variant="bodySmall" color={Colors.textMuted}>· {formatTime(new Date(tx.date))}</Text>
          </Stack>
        </Stack>
        <Text fontSize={15} fontWeight="700" color={amtColor}>
          {prefix}{formatCurrency(tx.amount, symbol)}
        </Text>
      </StyledPressable>
    </SwipeableRow>
  )
}

function RowDivider() {
  const Colors = useColors()
  const width = useWindowDimensions().width
  return <Stack horizontal width={width - 66-16} height={1} flex={1} backgroundColor={Colors.border} marginLeft={66} opacity={0.6} />
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function RecordsScreen() {
  const Colors = useColors()
  const { data: settingsData } = useSettings()
  const symbol = settingsData?.currencySymbol ?? '$'
  const { data, loading, error, refetch, totalIncome, totalExpense, grouped, remove } = useTransactions()
  const { invalidateData } = useRecordsStore()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true); refetch(); setTimeout(() => setRefreshing(false), 600)
  }, [refetch])

  useFocusEffect(useCallback(() => { refetch() }, []))

  const handleDelete = useCallback(async (id: string) => {
    const ok = await dialogueService.confirm({
      title: 'Delete transaction?', message: 'This will also reverse the balance change on your account.',
      icon: '🗑️', confirmLabel: 'Delete', destructive: true,
    })
    if (ok) { await remove(id); invalidateData(); toastService.success('Transaction deleted') }
  }, [remove, invalidateData])

  const sections = Object.entries(grouped).map(([dateStr, txs]) => ({
    title: formatShortDate(new Date(dateStr)), data: txs,
  }))

  if (error) {
    return (
      <Stack flex={1} backgroundColor={Colors.bg}>
        <StyledEmptyState illustration="⚠️" title="Something went wrong" description={error} actions={[{ label: 'Try again', onPress: refetch }]} />
      </Stack>
    )
  }

  return (
    <StyledPage backgroundColor={Colors.bg}>
      <Stack flex={1}>
        <HomeHeader symbol={symbol} />
        <MonthlySummary income={totalIncome} expense={totalExpense} symbol={symbol} />
        <Stack horizontal alignItems="center" justifyContent="space-between"
          paddingHorizontal={20} paddingTop={8}>
          <Text variant="label" fontSize={17} color={Colors.textMuted} letterSpacing={-0.3}>Transactions</Text>
          <StyledPressable onPress={() => router.push('/all-transactions' as any)}>
            <Text variant="label" fontSize={13} color={Colors.textMuted}>See All →</Text>
          </StyledPressable>
        </Stack>

        {loading && !refreshing ? (
          <Stack paddingHorizontal={16}><StyledSkeleton template="list-item" repeat={5} animation="shimmer" /></Stack>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            renderSectionHeader={({ section: { title } }) => (
              <Stack backgroundColor={Colors.bg} paddingHorizontal={20} paddingTop={16} paddingBottom={6}>
                <Text variant="overline" color={Colors.textMuted} letterSpacing={1.2}>
                  {title.toUpperCase()}
                </Text>
              </Stack>
            )}
            renderItem={({ item, index, section }) => {
              const isFirst = index === 0
              const isLast  = index === section.data.length - 1
              return (
                <StyledCard marginHorizontal={16} backgroundColor={Colors.bgCard} borderRadius={0}
                  borderTopLeftRadius={isFirst ? 18 : 0} borderTopRightRadius={isFirst ? 18 : 0}
                  borderBottomLeftRadius={isLast ? 18 : 0} borderBottomRightRadius={isLast ? 18 : 0}
                  overflow="hidden"
                  style={isFirst ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 } : {}}>
                  <TransactionRow tx={item} symbol={symbol} onDelete={handleDelete} />
                </StyledCard>
              )
            }}
            ItemSeparatorComponent={RowDivider}
            ListEmptyComponent={
              <StyledEmptyState variant="minimal" illustration="📭" title="No transactions" description="Tap + to add your first transaction" animated />
            }
          />
        )}

        <StyledPressable position="absolute" right={20} bottom={100} width={58} height={58} borderRadius={29}
          backgroundColor={Colors.primary} alignItems="center" justifyContent="center"
          onPress={() => router.push('/add-transaction' as any)}
      >
          <AddIcon size={26} color="#fff" strokeWidth={2.5} />
        </StyledPressable>
      </Stack>
    </StyledPage>
  )
}
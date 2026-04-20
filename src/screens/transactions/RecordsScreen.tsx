import React, { useCallback, useState } from 'react'
import { SectionList, RefreshControl, View, TouchableOpacity } from 'react-native'
import {
  Stack, StyledText, StyledPressable, StyledEmptyState, StyledSkeleton, StyledPage,
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

// ─── Header ───────────────────────────────────────────────────────────────────
function HomeHeader({ symbol }: { symbol: string }) {
  const Colors = useColors()
  const { totalBalance } = useAccounts()
  const { selectedMonth, prevMonth, nextMonth } = useRecordsStore()
  const isNow = selectedMonth.getMonth() === new Date().getMonth()
             && selectedMonth.getFullYear() === new Date().getFullYear()

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
      {/* Top row — greeting + bell */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <View style={{ gap: 2 }}>
          <StyledText fontSize={13} fontWeight="500" color={Colors.textMuted} letterSpacing={0.2}>
            Welcome back
          </StyledText>
          <StyledText fontSize={26} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.8}>
            Claro
          </StyledText>
        </View>
        <TouchableOpacity
          style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}>
          <BellIcon size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Balance card */}
      <View style={{
        borderRadius: 24, padding: 22, overflow: 'hidden',
        backgroundColor: Colors.primary,
        shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32, shadowRadius: 16, elevation: 10,
      }}>
        {/* Decorative circles */}
        <View style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <View style={{ position: 'absolute', top: 20, right: 50, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <View style={{ position: 'absolute', bottom: -20, left: 40, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)' }} />

        <StyledText fontSize={13} fontWeight="600" color="rgba(255,255,255,0.7)" letterSpacing={0.3}>
          Total Balance
        </StyledText>
        <StyledText fontSize={40} fontWeight="800" color="#fff" letterSpacing={-1.5} style={{ marginTop: 6, marginBottom: 18 }}>
          {formatCurrency(totalBalance, symbol)}
        </StyledText>

        {/* Month navigator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={prevMonth}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeftIcon size={16} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <StyledText fontSize={14} fontWeight="700" color="rgba(255,255,255,0.92)">
            {format(selectedMonth, 'MMMM yyyy')}
          </StyledText>
          <TouchableOpacity onPress={nextMonth} disabled={isNow}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: isNow ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRightIcon size={16} color={isNow ? 'rgba(255,255,255,0.3)' : '#fff'} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// ─── Sparkline — smooth area chart for summary cards ─────────────────────────
function Sparkline({ color, bgColor, up = true }: { color: string; bgColor: string; up?: boolean }) {
  const W = 80, H = 38
  // Organic S-curve path — looks like real data trending
  const linePath = up
    ? `M 0 ${H-6} C 12 ${H-8} 20 ${H-18} 32 ${H-16} C 44 ${H-14} 52 ${H-28} 80 6`
    : `M 0 8 C 12 6 22 ${H-22} 36 ${H-18} C 50 ${H-14} 60 ${H-10} 80 ${H-6}`
  const areaPath = linePath + ` L 80 ${H} L 0 ${H} Z`
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
      <Path d={linePath} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

// ─── Monthly summary ──────────────────────────────────────────────────────────
function SummaryCard({ label, amount, symbol, color, lightColor, bgColor, up }: {
  label: string; amount: number; symbol: string
  color: string; lightColor: string; bgColor: string; up: boolean
}) {
  const Colors = useColors()
  return (
    <View style={{ flex: 1, borderRadius: 18, padding: 16, backgroundColor: Colors.bgCard,
      shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>

      {/* Label + sparkline row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <StyledText fontSize={14} fontWeight="700" color={color}>{label}</StyledText>
        <Sparkline color={color} bgColor={bgColor} up={up} />
      </View>

      {/* Amount */}
      <StyledText fontSize={11} fontWeight="600" color={Colors.textMuted} letterSpacing={0.3} style={{ marginBottom: 4 }}>
        THIS MONTH
      </StyledText>
      <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5} numberOfLines={1} adjustsFontSizeToFit>
        {formatCurrency(amount, symbol)}
      </StyledText>
    </View>
  )
}

function MonthlySummary({ income, expense, symbol }: { income: number; expense: number; symbol: string }) {
  const Colors = useColors()
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
      <SummaryCard label="Expense" amount={expense} symbol={symbol}
        color={Colors.expense} lightColor={Colors.expenseLight} bgColor={Colors.bgCard} up={true} />
      <SummaryCard label="Income"  amount={income}  symbol={symbol}
        color={Colors.income}  lightColor={Colors.incomeLight}  bgColor={Colors.bgCard} up={false} />
    </View>
  )
}

// ─── Transaction row ──────────────────────────────────────────────────────────
function TransactionRow({ tx, symbol, onDelete }: { tx: TransactionWithRefs; symbol: string; onDelete: (id: string) => void }) {
  const Colors    = useColors()
  const isIncome  = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'
  const iconKey   = tx.categoryIcon ?? tx.type
  const iconBg    = tx.categoryColor ?? (isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense)
  const amtColor  = isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense
  const prefix    = isIncome ? '+' : isTransfer ? '' : '-'

  return (
    <SwipeableRow onDelete={() => onDelete(tx.id)}>
      <TouchableOpacity activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/edit-transaction' as any, params: { id: tx.id } })}
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: Colors.bgCard }}>
        <IconCircle iconKey={iconKey} bg={iconBg} size={46} />
        <View style={{ flex: 1, gap: 3, marginLeft: 14 }}>
          <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary} numberOfLines={1}>
            {tx.categoryName ?? (isTransfer ? 'Transfer' : 'Uncategorized')}
          </StyledText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {tx.accountName && (
              <StyledText fontSize={12} color={Colors.textMuted}>{tx.accountName}</StyledText>
            )}
            <StyledText fontSize={12} color={Colors.textMuted}>· {formatTime(new Date(tx.date))}</StyledText>
          </View>
        </View>
        <StyledText fontSize={15} fontWeight="700" color={amtColor}>
          {prefix}{formatCurrency(tx.amount, symbol)}
        </StyledText>
      </TouchableOpacity>
    </SwipeableRow>
  )
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
    setRefreshing(true)
    refetch()
    setTimeout(() => setRefreshing(false), 600)
  }, [refetch])

  useFocusEffect(useCallback(() => { refetch() }, []))

  const handleDelete = useCallback(async (id: string) => {
    const ok = await dialogueService.confirm({
      title: 'Delete transaction?',
      message: 'This will also reverse the balance change on your account.',
      icon: '🗑️', confirmLabel: 'Delete', destructive: true,
    })
    if (ok) { await remove(id); invalidateData(); toastService.success('Transaction deleted') }
  }, [remove, invalidateData])

  const sections = Object.entries(grouped).map(([dateStr, txs]) => ({
    title: formatShortDate(new Date(dateStr)),
    data: txs,
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
      <View style={{ flex: 1 }}>
        <HomeHeader symbol={symbol} />
        <MonthlySummary income={totalIncome} expense={totalExpense} symbol={symbol} />

        {/* Transactions header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 }}>
          <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.3}>
            Transactions
          </StyledText>
          <TouchableOpacity onPress={() => {}}>
            <StyledText fontSize={13} fontWeight="600" color={Colors.primary}>See All →</StyledText>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={{ paddingHorizontal: 16 }}>
            <StyledSkeleton template="list-item" repeat={5} animation="shimmer" />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            renderSectionHeader={({ section: { title } }) => (
              <View style={{ backgroundColor: Colors.bg, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6 }}>
                <StyledText fontSize={11} fontWeight="700" color={Colors.textMuted} letterSpacing={1.2}>
                  {title.toUpperCase()}
                </StyledText>
              </View>
            )}
            renderItem={({ item, index, section }) => {
              const isFirst = index === 0
              const isLast  = index === section.data.length - 1
              return (
                <View style={{
                  marginHorizontal: 16,
                  backgroundColor: Colors.bgCard,
                  borderTopLeftRadius:  isFirst ? 18 : 0,
                  borderTopRightRadius: isFirst ? 18 : 0,
                  borderBottomLeftRadius:  isLast ? 18 : 0,
                  borderBottomRightRadius: isLast ? 18 : 0,
                  overflow: 'hidden',
                  ...(isFirst ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 } : {}),
                }}>
                  <TransactionRow tx={item} symbol={symbol} onDelete={handleDelete} />
                </View>
              )
            }}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 96, marginHorizontal: 16 }} />
            )}
            ListEmptyComponent={
              <StyledEmptyState variant="minimal" illustration="📭" title="No transactions" description="Tap + to add your first transaction" animated />
            }
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          onPress={() => router.push('/add-transaction' as any)}
          activeOpacity={0.85}
          style={{
            position: 'absolute', right: 20, bottom: 100,
            width: 58, height: 58, borderRadius: 29,
            backgroundColor: Colors.primary,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
          }}>
          <AddIcon size={26} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>

      </View>
    </StyledPage>
  )
}
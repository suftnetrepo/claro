import React, { useCallback, useState } from 'react'
import { SectionList, RefreshControl } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  Stack, StyledText, StyledPressable, StyledDivider,
  StyledEmptyState, StyledSkeleton, StyledCard,
} from 'fluent-styles'
import { dialogueService, toastService } from 'fluent-styles'
import { router, useFocusEffect } from 'expo-router'
import { format } from 'date-fns'
import { IconCircle } from '../../icons/map'
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, BellIcon } from '../../icons'
import { Colors, useColors } from '../../constants'
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
    <Stack backgroundColor={Colors.bg} paddingHorizontal={20} paddingTop={12} paddingBottom={20}>

      {/* Top row */}
      <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={20}>
        <Stack gap={2}>
          <StyledText fontSize={12} color={Colors.textMuted} fontWeight="500">Welcome back</StyledText>
          <StyledText fontSize={20} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>Claro</StyledText>
        </Stack>
        <StyledPressable width={40} height={40} borderRadius={20}
          backgroundColor={Colors.bgMuted} alignItems="center" justifyContent="center">
          <BellIcon size={20} color={Colors.textSecondary} />
        </StyledPressable>
      </Stack>

      {/* Balance card */}
      <StyledCard padding={18} borderRadius={20} backgroundColor={Colors.primary}
        style={{ shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 }}>
        <StyledText fontSize={13} color="rgba(255,255,255,0.75)" fontWeight="600" marginBottom={6}>
          Total Balance
        </StyledText>
        <StyledText fontSize={34} fontWeight="800" color={Colors.white} letterSpacing={-1} marginBottom={4}>
          {formatCurrency(totalBalance, symbol)}
        </StyledText>

        {/* Month nav inside card */}
        <Stack horizontal alignItems="center" justifyContent="space-between" marginTop={12}>
          <StyledPressable width={32} height={32} borderRadius={16}
            backgroundColor="rgba(255,255,255,0.2)" alignItems="center" justifyContent="center"
            onPress={prevMonth}>
            <ChevronLeftIcon size={16} color={Colors.white} strokeWidth={2.5} />
          </StyledPressable>
          <StyledText fontSize={13} fontWeight="700" color="rgba(255,255,255,0.9)">
            {format(selectedMonth, 'MMMM yyyy')}
          </StyledText>
          <StyledPressable width={32} height={32} borderRadius={16}
            backgroundColor={isNow ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}
            alignItems="center" justifyContent="center"
            onPress={nextMonth} disabled={isNow}>
            <ChevronRightIcon size={16} color={isNow ? 'rgba(255,255,255,0.35)' : Colors.white} strokeWidth={2.5} />
          </StyledPressable>
        </Stack>
      </StyledCard>
    </Stack>
  )
}

// ─── Monthly summary cards ─────────────────────────────────────────────────────
function MonthlySummary({ income, expense, symbol }: {
  income: number; expense: number; symbol: string
}) {
  const Colors = useColors()
  return (
    <Stack horizontal gap={12} paddingHorizontal={20} paddingVertical={16}>
      <StyledCard flex={1} padding={16} borderRadius={20} backgroundColor={Colors.bgCard}
        borderWidth={1} borderColor={Colors.border}
        style={{ shadowColor: Colors.border, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 4 }}>
        <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={10}>
          <StyledText fontSize={13} fontWeight="700" color={Colors.expense}>Expense</StyledText>
          <Stack width={28} height={28} borderRadius={14}
            backgroundColor={Colors.primary} alignItems="center" justifyContent="center">
            <StyledText fontSize={14} color={Colors.white}>↗</StyledText>
          </Stack>
        </Stack>
        <StyledText fontSize={10} color={Colors.textMuted} fontWeight="600" letterSpacing={0.5} marginBottom={4}>
          THIS MONTH
        </StyledText>
        <StyledText fontSize={18} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>
          {formatCurrency(expense, symbol)}
        </StyledText>
      </StyledCard>

      <StyledCard flex={1} padding={16} borderRadius={20} backgroundColor={Colors.bgCard}
        borderWidth={1} borderColor={Colors.border}
        style={{ shadowColor: Colors.border, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 4 }}>
        <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={10}>
          <StyledText fontSize={13} fontWeight="700" color={Colors.income}>Income</StyledText>
          <Stack width={28} height={28} borderRadius={14}
            backgroundColor={Colors.primary} alignItems="center" justifyContent="center">
            <StyledText fontSize={14} color={Colors.white}>↗</StyledText>
          </Stack>
        </Stack>
        <StyledText fontSize={10} color={Colors.textMuted} fontWeight="600" letterSpacing={0.5} marginBottom={4}>
          THIS MONTH
        </StyledText>
        <StyledText fontSize={18} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>
          {formatCurrency(income, symbol)}
        </StyledText>
      </StyledCard>
    </Stack>
  )
}

// ─── Transaction row ──────────────────────────────────────────────────────────
function TransactionRow({ tx, symbol, onDelete }: {
  tx: TransactionWithRefs; symbol: string; onDelete: (id: string) => void
}) {
  const Colors    = useColors()
  const isIncome  = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'
  const iconKey   = tx.categoryIcon ?? tx.type
  const iconBg    = tx.categoryColor ?? (isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense)

  return (
    <SwipeableRow onDelete={() => onDelete(tx.id)}>
      <StyledPressable
        flexDirection="row" alignItems="center"
        paddingHorizontal={20} paddingVertical={14}
        backgroundColor={Colors.bgCard}
        onPress={() => router.push({ pathname: '/edit-transaction' as any, params: { id: tx.id } })}
      >
        <IconCircle iconKey={iconKey} bg={iconBg} size={46} />
        <Stack flex={1} gap={3} marginLeft={14}>
          <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary} numberOfLines={1}>
            {tx.categoryName ?? (isTransfer ? 'Transfer' : 'Uncategorized')}
          </StyledText>
          <Stack horizontal alignItems="center" gap={6}>
            {tx.accountName ? (
              <StyledText fontSize={12} color={Colors.textMuted}>{tx.accountName}</StyledText>
            ) : null}
            <StyledText fontSize={12} color={Colors.textMuted}>· {formatTime(new Date(tx.date))}</StyledText>
          </Stack>
        </Stack>
        <StyledText fontSize={15} fontWeight="700"
          color={isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense}>
          {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(tx.amount, symbol)}
        </StyledText>
      </StyledPressable>
    </SwipeableRow>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function RecordsScreen() {
  const Colors = useColors()
  const { data: settingsData } = useSettings()
  const symbol = settingsData?.currencySymbol ?? '$'

  const {
    data, loading, error, refetch,
    totalIncome, totalExpense,
    grouped, remove,
  } = useTransactions()

  const { invalidateData } = useRecordsStore()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true); refetch()
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
    title: formatShortDate(new Date(dateStr)), data: txs,
  }))

  if (error) {
    return (
      <Stack flex={1} backgroundColor={Colors.bg}>
        <StyledEmptyState illustration="⚠️" title="Something went wrong" description={error}
          actions={[{ label: 'Try again', onPress: refetch }]} />
      </Stack>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack flex={1} backgroundColor={Colors.bg}>

        <HomeHeader symbol={symbol} />
        <MonthlySummary income={totalIncome} expense={totalExpense} symbol={symbol} />

        {/* Latest transactions header */}
        <Stack horizontal alignItems="center" justifyContent="space-between"
          paddingHorizontal={20} paddingBottom={10}>
          <StyledText fontSize={16} fontWeight="800" color={Colors.textPrimary}>Latest Transactions</StyledText>
          <StyledPressable onPress={() => {}}>
            <StyledText fontSize={13} fontWeight="600" color={Colors.primary}>See All →</StyledText>
          </StyledPressable>
        </Stack>

        {loading && !refreshing ? (
          <Stack paddingHorizontal={16}><StyledSkeleton template="list-item" repeat={5} animation="shimmer" /></Stack>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            renderSectionHeader={({ section: { title } }) => (
              <Stack backgroundColor={Colors.bg} paddingHorizontal={20} paddingVertical={8}
                borderBottomWidth={1} borderBottomColor={Colors.border}>
                <StyledText fontSize={12} fontWeight="700" color={Colors.textMuted} letterSpacing={0.5}>
                  {title.toUpperCase()}
                </StyledText>
              </Stack>
            )}
            renderItem={({ item }) => (
              <TransactionRow tx={item} symbol={symbol} onDelete={handleDelete} />
            )}
            ItemSeparatorComponent={() => (
              <Stack height={1} backgroundColor={Colors.border} marginLeft={80} />
            )}
            ListEmptyComponent={
              <StyledEmptyState variant="minimal" illustration="📭"
                title="No transactions" description="Tap + to add your first transaction" animated />
            }
          />
        )}

        {/* FAB — centered like mockup */}
        <StyledPressable
          position="absolute" right={20} bottom={100}
          width={58} height={58} borderRadius={29}
          backgroundColor={Colors.primary} alignItems="center" justifyContent="center"
          onPress={() => router.push('/add-transaction' as any)}
          style={{ shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 }}
        >
          <AddIcon size={26} color={Colors.white} strokeWidth={2.5} />
        </StyledPressable>

      </Stack>
    </GestureHandlerRootView>
  )
}
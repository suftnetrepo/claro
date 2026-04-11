import React, { useCallback, useState } from 'react'
import { SectionList, RefreshControl } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  Stack, StyledText, StyledPressable, StyledDivider,
  StyledEmptyState, StyledSkeleton,
} from 'fluent-styles'
import { dialogueService, toastService } from 'fluent-styles'
import { router, useFocusEffect } from 'expo-router'
import { format } from 'date-fns'
import { IconCircle } from '../../icons/map'
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon, AddIcon } from '../../icons'
import { Colors, useColors } from '../../constants'
import { useTransactions, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { formatCurrency, formatShortDate, formatTime } from '../../utils'
import { SwipeableRow } from '../../components'
import type { TransactionWithRefs } from '../../hooks'

// ─── Month navigator ──────────────────────────────────────────────────────────
function MonthNavigator() {
  const Colors = useColors()
  const { selectedMonth, prevMonth, nextMonth } = useRecordsStore()
  const isNow = selectedMonth.getMonth() === new Date().getMonth()
             && selectedMonth.getFullYear() === new Date().getFullYear()
  return (
    <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={20} paddingVertical={12}>
      <StyledPressable width={36} height={36} borderRadius={18} backgroundColor={Colors.accent} alignItems="center" justifyContent="center" onPress={prevMonth}>
        <ChevronLeftIcon size={20} color={Colors.primary} strokeWidth={2.2} />
      </StyledPressable>
      <StyledText fontSize={16} fontWeight="700" color={Colors.primary}>{format(selectedMonth, 'MMMM, yyyy')}</StyledText>
      <StyledPressable width={36} height={36} borderRadius={18} backgroundColor={isNow ? Colors.bgMuted : Colors.accent} alignItems="center" justifyContent="center" onPress={nextMonth} disabled={isNow}>
        <ChevronRightIcon size={20} color={isNow ? Colors.textMuted : Colors.primary} strokeWidth={2.2} />
      </StyledPressable>
    </Stack>
  )
}

// ─── Summary bar ──────────────────────────────────────────────────────────────
function SummaryBar({ income, expense, total, symbol }: {
  income: number; expense: number; total: number; symbol: string
}) {
  const Colors = useColors()
  return (
    <Stack horizontal paddingHorizontal={20} paddingBottom={14}>
      <Stack flex={1} alignItems="center" gap={4}>
        <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>EXPENSE</StyledText>
        <StyledText fontSize={16} fontWeight="700" color={Colors.expense}>{formatCurrency(expense, symbol)}</StyledText>
      </Stack>
      <Stack width={1} backgroundColor={Colors.border} marginVertical={4} />
      <Stack flex={1} alignItems="center" gap={4}>
        <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>INCOME</StyledText>
        <StyledText fontSize={16} fontWeight="700" color={Colors.income}>{formatCurrency(income, symbol)}</StyledText>
      </Stack>
      <Stack width={1} backgroundColor={Colors.border} marginVertical={4} />
      <Stack flex={1} alignItems="center" gap={4}>
        <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>TOTAL</StyledText>
        <StyledText fontSize={16} fontWeight="700" color={total >= 0 ? Colors.income : Colors.expense}>
          {formatCurrency(Math.abs(total), symbol)}
        </StyledText>
      </Stack>
    </Stack>
  )
}

// ─── Transaction row ──────────────────────────────────────────────────────────
function TransactionRow({
  tx, symbol, onDelete,
}: {
  tx: TransactionWithRefs; symbol: string; onDelete: (id: string) => void
}) {
  const Colors = useColors()
  const isIncome   = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'
  const iconKey    = tx.categoryIcon ?? tx.type
  const iconBg     = tx.categoryColor ?? (isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense)

  return (
    <SwipeableRow onDelete={() => onDelete(tx.id)}>
      <StyledPressable
        flexDirection="row" alignItems="center"
        paddingHorizontal={20} paddingVertical={12}
        backgroundColor={Colors.bgCard}
        onPress={() => router.push({ pathname: '/edit-transaction' as any, params: { id: tx.id } })}
      >
        <IconCircle iconKey={iconKey} bg={iconBg} size={44} />
        <Stack flex={1} gap={3} marginLeft={12}>
          <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary} numberOfLines={1}>
            {tx.categoryName ?? (isTransfer ? 'Transfer' : 'Uncategorized')}
          </StyledText>
          <Stack horizontal gap={6}>
            <Stack horizontal alignItems="center" gap={6}>
              {tx.accountName ? (
                <StyledText fontSize={12} color={Colors.textMuted}>{tx.accountName}</StyledText>
              ) : null}
              {isTransfer && tx.toAccountName ? (
                <StyledText fontSize={12} color={Colors.textMuted}>→ {tx.toAccountName}</StyledText>
              ) : null}
              <StyledText fontSize={12} color={Colors.textMuted}>· {formatTime(new Date(tx.date))}</StyledText>
            </Stack>
          </Stack>
          {tx.notes ? (
            <StyledText fontSize={12} color={Colors.textMuted} numberOfLines={1}>{tx.notes}</StyledText>
          ) : null}
        </Stack>
        <StyledText fontSize={15} fontWeight="700" color={isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense}>
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
    totalIncome, totalExpense, totalBalance,
    grouped, remove,
  } = useTransactions()

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
      title:        'Delete transaction?',
      message:      'This will also reverse the balance change on your account.',
      icon:         '🗑️',
      confirmLabel: 'Delete',
      destructive:  true,
    })
    if (ok) {
      await remove(id)
      invalidateData()
      toastService.success('Transaction deleted')
    }
  }, [remove, invalidateData])

  const sections = Object.entries(grouped).map(([dateStr, txs]) => ({
    title: formatShortDate(new Date(dateStr)),
    data:  txs,
  }))

  if (error) {
    return (
      <Stack flex={1} backgroundColor={Colors.bg}>
        <StyledEmptyState
          illustration="⚠️" title="Something went wrong" description={error}
          actions={[{ label: 'Try again', onPress: refetch }]}
        />
      </Stack>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack flex={1} backgroundColor={Colors.bg}>

        {/* Header */}
        <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
          <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>Claro</StyledText>
          <StyledPressable width={36} height={36} borderRadius={18} backgroundColor={Colors.bgMuted} alignItems="center" justifyContent="center">
            <FilterIcon size={20} color={Colors.textSecondary} />
          </StyledPressable>
        </Stack>

        <MonthNavigator />
        <SummaryBar income={totalIncome} expense={totalExpense} total={totalBalance} symbol={symbol} />
        <StyledDivider borderBottomColor={Colors.border} />

        {loading && !refreshing ? (
          <Stack padding={16}>
            <StyledSkeleton template="list-item" repeat={6} animation="shimmer" />
          </Stack>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
            }
            renderSectionHeader={({ section: { title } }) => (
              <Stack
                backgroundColor={Colors.bg}
                paddingHorizontal={20} paddingVertical={8}
                borderBottomWidth={1} borderBottomColor={Colors.border}
              >
                <StyledText fontSize={13} fontWeight="700" color={Colors.primary}>{title}</StyledText>
              </Stack>
            )}
            renderItem={({ item }) => (
              <TransactionRow tx={item} symbol={symbol} onDelete={handleDelete} />
            )}
            ItemSeparatorComponent={() => (
              <Stack height={1} backgroundColor={Colors.border} marginLeft={76} />
            )}
            ListEmptyComponent={
              <StyledEmptyState
                variant="minimal" illustration="📭"
                title="No transactions"
                description="Tap + to add your first transaction"
                animated
              />
            }
          />
        )}

        {/* FAB */}
        <StyledPressable
          position="absolute" right={20} bottom={90}
          width={56} height={56} borderRadius={28}
          backgroundColor={Colors.primary} alignItems="center" justifyContent="center"
          onPress={() => router.push('/add-transaction' as any)}
          style={{ shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 }}
        >
          <AddIcon size={24} color={Colors.white} strokeWidth={2.5} />
        </StyledPressable>

      </Stack>
    </GestureHandlerRootView>
  )
}

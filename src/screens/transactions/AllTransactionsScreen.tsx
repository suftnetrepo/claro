import React, { useCallback, useState, useMemo } from 'react'
import { SectionList, RefreshControl, ScrollView, useWindowDimensions } from 'react-native'
import { router } from 'expo-router'
import {
  Stack, StyledPressable, StyledEmptyState, StyledSkeleton,
  StyledPage, StyledHeader, StyledCard, StyledChip, StyledTextInput,
  StyledDivider, StyledDatePicker, Popup, Drawer, Collapse,
} from 'fluent-styles'
import { dialogueService, toastService } from 'fluent-styles'
import { startOfWeek, startOfMonth, subMonths, format } from 'date-fns'
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg'
import { ChevronLeftIcon, CalendarIcon } from '../../icons'
import { IconCircle } from '../../icons/map'
import { useColors } from '../../constants'
import { useTransactions, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { formatCurrency, formatShortDate, formatTime } from '../../utils'
import { SwipeableRow, Text } from '../../components'
import type { TransactionWithRefs } from '../../hooks'

type FilterType = 'all' | 'expense' | 'income' | 'transfer'
type DateRange  = '1W' | '1M' | '3M' | '6M' | 'ALL' | 'CUSTOM'

// ─── Filter icon ──────────────────────────────────────────────────────────────
function FilterIcon({ size = 18, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M7 12h10M11 18h2" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  )
}

// ─── Stat card — full width, amount + sparkline on same row ──────────────────
function StatCard({ label, amount, symbol, color, up, count, cardWidth }: {
  label: string; amount: number; symbol: string; color: string
  up: boolean; count?: number; cardWidth: number
}) {
  const Colors = useColors()
  const prefix = label === 'Income' ? '+' : label === 'Expense' ? '-' : amount >= 0 ? '+' : ''
  const SW = 110, SH = 44
  const line = up
    ? `M 0 ${SH-3} C ${SW*0.2} ${SH-8} ${SW*0.4} ${SH-24} ${SW*0.6} ${SH-20} C ${SW*0.8} ${SH-15} ${SW*0.92} ${SH-36} ${SW} 4`
    : `M 0 4 C ${SW*0.2} 3 ${SW*0.35} ${SH-26} ${SW*0.55} ${SH-22} C ${SW*0.75} ${SH-17} ${SW*0.88} ${SH-9} ${SW} ${SH-3}`
  const area = line + ` L ${SW} ${SH} L 0 ${SH} Z`
  const gid  = `fs${color.replace(/[^a-z0-9]/gi,'')}`

  return (
    <StyledCard borderRadius={20} backgroundColor={Colors.bgCard} shadow="light" overflow="hidden"
      style={{ width: cardWidth }}>
      <Stack paddingHorizontal={18} paddingVertical={16} gap={8}>
        {/* Top row: dot + label + transaction count */}
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
          <Stack flexDirection="row" alignItems="center" gap={8}>
            <Stack width={8} height={8} borderRadius={4} backgroundColor={color} />
            <Text fontSize={11} fontWeight="700" color={Colors.textMuted} letterSpacing={0.8}>{label.toUpperCase()}</Text>
          </Stack>
          {count !== undefined && (
            <Text fontSize={11} fontWeight="500" color={Colors.textMuted}>
              {count} txn{count !== 1 ? 's' : ''}
            </Text>
          )}
        </Stack>
        {/* Bottom row: amount left, sparkline right — same baseline */}
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text fontSize={30} fontWeight="800" color={color} letterSpacing={-1}>
            {prefix}{formatCurrency(Math.abs(amount), symbol)}
          </Text>
          <Svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`}>
            <Defs>
              <SvgGrad id={gid} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity="0.28" />
                <Stop offset="1" stopColor={color} stopOpacity="0" />
              </SvgGrad>
            </Defs>
            <Path d={area} fill={`url(#${gid})`} />
            <Path d={line} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Stack>
      </Stack>
    </StyledCard>
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
      borderTopLeftRadius={isFirst ? 18 : 0} borderTopRightRadius={isFirst ? 18 : 0}
      borderBottomLeftRadius={isLast ? 18 : 0} borderBottomRightRadius={isLast ? 18 : 0}
      marginHorizontal={16} borderRadius={0} overflow="hidden" backgroundColor={Colors.bgCard}>
      <SwipeableRow onDelete={() => onDelete(tx.id)}>
        <StyledPressable flexDirection="row" alignItems="center"
          paddingHorizontal={16} paddingVertical={13} backgroundColor={Colors.bgCard}
          onPress={() => router.push({ pathname: '/edit-transaction' as any, params: { id: tx.id } })}>
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

const PRESET_RANGES: { label: string; value: DateRange }[] = [
  { label: '1W', value: '1W' }, { label: '1M', value: '1M' },
  { label: '3M', value: '3M' }, { label: '6M', value: '6M' },
  { label: 'All', value: 'ALL' },
]
const TYPE_FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' }, { value: 'transfer', label: 'Transfer' },
]

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AllTransactionsScreen() {
  const Colors = useColors()
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = screenWidth - 32  // full width minus horizontal padding
  const { data: settingsData } = useSettings()
  const symbol = settingsData?.currencySymbol ?? '$'
  const { data, loading, refetch, remove } = useTransactions()
  const { invalidateData } = useRecordsStore()

  const [refreshing,       setRefreshing]       = useState(false)
  const [filter,           setFilter]           = useState<FilterType>('all')
  const [dateRange,        setDateRange]        = useState<DateRange>('1M')
  const [search,           setSearch]           = useState('')
  // Single sheet state — drawer + nested date pickers
  type Sheet = 'none' | 'filter' | 'from' | 'to'
  const [sheet,     setSheet]     = useState<Sheet>('none')
  const [customFrom,     setCustomFrom]     = useState<Date>(startOfMonth(new Date()))
  const [customTo,       setCustomTo]       = useState<Date>(new Date())

  // Pending filter state (applied on confirm)
  const [pendingFilter,    setPendingFilter]    = useState<FilterType>('all')
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>('1M')
  const [pendingFrom,      setPendingFrom]      = useState<Date>(startOfMonth(new Date()))
  const [pendingTo,        setPendingTo]        = useState<Date>(new Date())
  // Custom date step: null=not started, 'from'=picking start, 'to'=picking end, 'done'=both set
  type CustomStep = null | 'from' | 'to' | 'done'
  const [customStep, setCustomStep] = useState<CustomStep>(null)

  const openFilter = () => {
    setPendingFilter(filter); setPendingDateRange(dateRange)
    setPendingFrom(customFrom); setPendingTo(customTo)
    setSheet('filter')
  }

  const applyFilter = () => {
    setFilter(pendingFilter); setDateRange(pendingDateRange)
    setCustomFrom(pendingFrom); setCustomTo(pendingTo)
    setSheet('none')
  }

  const resetFilter = () => {
    setPendingFilter('all'); setPendingDateRange('1M')
    setPendingFrom(startOfMonth(new Date())); setPendingTo(new Date())
    setCustomStep(null)
  }


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

  // ─── Date range logic ─────────────────────────────────────────────────────
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date()
    if (dateRange === 'ALL')    return { rangeStart: new Date(0), rangeEnd: now }
    if (dateRange === 'CUSTOM') return { rangeStart: customFrom,  rangeEnd: customTo }
    if (dateRange === '1W')     return { rangeStart: startOfWeek(now), rangeEnd: now }
    if (dateRange === '1M')     return { rangeStart: startOfMonth(now), rangeEnd: now }
    if (dateRange === '3M')     return { rangeStart: startOfMonth(subMonths(now, 2)), rangeEnd: now }
    return { rangeStart: startOfMonth(subMonths(now, 5)), rangeEnd: now }
  }, [dateRange, customFrom, customTo])

  const dateFiltered = useMemo(() => data.filter(tx => {
    const d = new Date(tx.date); return d >= rangeStart && d <= rangeEnd
  }), [data, rangeStart, rangeEnd])

  const filtered = useMemo(() => dateFiltered.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (tx.categoryName ?? '').toLowerCase().includes(q)
          || (tx.accountName ?? '').toLowerCase().includes(q)
          || (tx.notes ?? '').toLowerCase().includes(q)
    }
    return true
  }), [dateFiltered, filter, search])

  const totalIncome  = useMemo(() => dateFiltered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),  [dateFiltered])
  const totalExpense = useMemo(() => dateFiltered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [dateFiltered])
  const netBalance   = totalIncome - totalExpense

  const sections = useMemo(() => {
    const grouped = filtered.reduce<Record<string, TransactionWithRefs[]>>((acc, tx) => {
      const key = new Date(tx.date).toDateString()
      if (!acc[key]) acc[key] = []; acc[key].push(tx); return acc
    }, {})
    return Object.entries(grouped).map(([d, txs]) => ({ title: formatShortDate(new Date(d)), data: txs }))
  }, [filtered])

  // Active filter count for badge
  const activeFilters = (filter !== 'all' ? 1 : 0) + (dateRange !== '1M' ? 1 : 0)

  return (
    <StyledPage backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        <Stack backgroundColor={Colors.bg} paddingTop={16}  gap={14}>

          {/* Nav row */}
          <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={20}>
            <StyledPressable width={38} height={38} borderRadius={19} backgroundColor={Colors.bgCard}
              alignItems="center" justifyContent="center" onPress={() => router.back()}
              style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <ChevronLeftIcon size={18} color={Colors.textPrimary} strokeWidth={2.5} />
            </StyledPressable>
            <Text fontSize={17} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.3}>Transactions</Text>
            {/* Filter button with active badge */}
            <StyledPressable width={38} height={38} borderRadius={19}
              backgroundColor={activeFilters > 0 ? Colors.primary : Colors.bgCard}
              alignItems="center" justifyContent="center" onPress={openFilter}
              style={{ shadowColor: activeFilters > 0 ? Colors.primary : '#000', shadowOpacity: activeFilters > 0 ? 0.3 : 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <FilterIcon size={18} color={activeFilters > 0 ? '#fff' : Colors.textPrimary} />
              {activeFilters > 0 && (
                <Stack position="absolute" top={-2} right={-2} width={16} height={16} borderRadius={8}
                  backgroundColor={Colors.expense} alignItems="center" justifyContent="center">
                <Text fontSize={9} fontWeight="800" color="#fff">{activeFilters}</Text>
                </Stack>
              )}
            </StyledPressable>
          </Stack>

          {/* Stat cards — full width, horizontally paged */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled={false}
            decelerationRate="fast" snapToInterval={cardWidth + 12} snapToAlignment="start"
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            <StatCard label="Income"  amount={totalIncome}  symbol={symbol} color={Colors.income}
              up={false} count={dateFiltered.filter(t => t.type === 'income').length} cardWidth={cardWidth} />
            <StatCard label="Expense" amount={totalExpense} symbol={symbol} color={Colors.expense}
              up={true}  count={dateFiltered.filter(t => t.type === 'expense').length} cardWidth={cardWidth} />
            <StatCard label="Net"     amount={netBalance}   symbol={symbol}
              color={netBalance >= 0 ? Colors.income : Colors.expense}
              up={netBalance >= 0} count={dateFiltered.length} cardWidth={cardWidth} />
          </ScrollView>

          {/* Search */}
          <Stack paddingHorizontal={20}>
            <StyledTextInput variant="filled" placeholder="Search transactions…" value={search}
              onChangeText={setSearch} clearable borderRadius={14} fontSize={14} />
          </Stack>

        </Stack>
      </StyledHeader.Full>

      {/* Transaction list */}
      {loading && !refreshing ? (
        <Stack paddingHorizontal={16}><StyledSkeleton template="list-item" repeat={8} animation="shimmer" /></Stack>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderSectionHeader={({ section: { title } }) => (
            <Stack backgroundColor={Colors.bg} paddingHorizontal={20} paddingTop={16} paddingBottom={6}>
              <Text fontSize={11} fontWeight="700" color={Colors.textMuted} letterSpacing={1.2}>{title.toUpperCase()}</Text>
            </Stack>
          )}
          renderItem={({ item, index, section }) => (
            <TxRow tx={item} symbol={symbol} onDelete={handleDelete}
              isFirst={index === 0} isLast={index === section.data.length - 1} />
          )}
          ItemSeparatorComponent={() => (
            <StyledDivider borderBottomColor={Colors.border} marginLeft={80} marginRight={16} opacity={0.6} />
          )}
          ListEmptyComponent={
            <StyledEmptyState variant="minimal" illustration="📭"
              title={search ? 'No results found' : 'No transactions'}
              description={search ? `No transactions matching "${search}"` : 'No transactions in this period'}
              animated />
          }
        />
      )}

      {/* ── Filter Drawer — slides in from the right ──────────────────────── */}
      <Drawer
        visible={sheet === 'filter'}
        onClose={() => setSheet('none')}
        side="right"
        title="Filters"
        subtitle="Narrow down transactions"
        width="82%"
        swipeToClose
        colors={{
          background:       Colors.bg,
          headerBg:         Colors.bg,
          headerTitle:      Colors.textPrimary,
          headerSubtitle:   Colors.textMuted,
          headerBorder:     Colors.border,
          backIcon:         Colors.textMuted,
          footerBg:         Colors.bg,
          footerBorder:     Colors.border,
          edgeHandle:       Colors.border,
          separator:        Colors.border,
        }}
        footer={
          <Stack horizontal gap={10} paddingHorizontal={20} paddingVertical={16}>
            <StyledPressable flex={1} paddingVertical={14} borderRadius={14}
              backgroundColor={Colors.bgMuted} alignItems="center" onPress={resetFilter}>
              <Text fontSize={14} fontWeight="600" color={Colors.textMuted}>Reset</Text>
            </StyledPressable>
            <StyledPressable flex={2} paddingVertical={14} borderRadius={14}
              backgroundColor={Colors.primary} alignItems="center" onPress={applyFilter}
              style={{ shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
              <Text fontSize={14} fontWeight="800" color="#fff">Apply Filters</Text>
            </StyledPressable>
          </Stack>
        }>

        <Stack padding={20} gap={28}>

          {/* ── Date range ─────────────────────────────────────────────── */}
          <Stack gap={14}>
            <Stack horizontal alignItems="center" gap={8}>
              <Stack width={3} height={16} borderRadius={2} backgroundColor={Colors.primary} />
              <Text fontSize={12} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>DATE RANGE</Text>
            </Stack>

            {/* Preset pills + Custom button in one row */}
            <Stack horizontal flexWrap="wrap" gap={8}>
              {PRESET_RANGES.map(d => {
                const active = pendingDateRange === d.value
                return (
                  <StyledPressable key={d.value} paddingHorizontal={16} paddingVertical={9} borderRadius={20}
                    backgroundColor={active ? Colors.primary : Colors.bgMuted}
                    onPress={() => {
                      setPendingDateRange(d.value)
                      setCustomStep(null)
                      setPendingFrom(startOfMonth(new Date()))
                      setPendingTo(new Date())
                    }}
                    style={active ? { shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4 } : {}}>
                    <Text fontSize={13} fontWeight={active ? '700' : '500'} color={active ? '#fff' : Colors.textMuted}>{d.label}</Text>
                  </StyledPressable>
                )
              })}

              {/* Custom pill — starts the sequential flow */}
              <StyledPressable flexDirection="row" alignItems="center" gap={6}
                paddingHorizontal={14} paddingVertical={9} borderRadius={20}
                backgroundColor={pendingDateRange === 'CUSTOM' ? Colors.primary : Colors.bgMuted}
                onPress={() => {
                  setPendingDateRange('CUSTOM')
                  setCustomStep('from') // always restart from step 1
                }}
                style={pendingDateRange === 'CUSTOM' ? { shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4 } : {}}>
                <CalendarIcon size={13} color={pendingDateRange === 'CUSTOM' ? '#fff' : Colors.textMuted} strokeWidth={2} />
                <Text fontSize={13} fontWeight={pendingDateRange === 'CUSTOM' ? '700' : '500'}
                  color={pendingDateRange === 'CUSTOM' ? '#fff' : Colors.textMuted}>
                  {pendingDateRange === 'CUSTOM' && customStep === 'done'
                    ? `${format(pendingFrom, 'dd MMM')} – ${format(pendingTo, 'dd MMM')}`
                    : 'Custom'}
                </Text>
              </StyledPressable>
            </Stack>

            {/* Step 1 — FROM date: auto-open when Custom clicked */}
            {pendingDateRange === 'CUSTOM' && (
              <Stack gap={10}>

                {/* Step indicator */}
                <Stack horizontal alignItems="center" gap={10}>
                  <Stack flex={1} height={2} borderRadius={1}
                    backgroundColor={customStep !== null ? Colors.primary : Colors.border} />
                  <Stack flex={1} height={2} borderRadius={1}
                    backgroundColor={customStep === 'to' || customStep === 'done' ? Colors.primary : Colors.border} />
                </Stack>

                {/* FROM collapse — open on step 'from' */}
                <Collapse
                  variant="bordered"
                  collapse={customStep === 'from'}
                  onCollapse={(open) => { if (open) setCustomStep('from') }}
                  leading={
                    <Stack width={28} height={28} borderRadius={8}
                      backgroundColor={customStep === 'from' ? Colors.accent : customStep === 'to' || customStep === 'done' ? Colors.incomeLight : Colors.bgMuted}
                      alignItems="center" justifyContent="center">
                      <Text fontSize={13}>{customStep === 'to' || customStep === 'done' ? '✓' : '1'}</Text>
                    </Stack>
                  }
                  title="Start Date"
                  subtitle={customStep === null ? 'Tap to set' : format(pendingFrom, 'EEE, dd MMM yyyy')}
                  colors={{
                    background:    Colors.bgCard,
                    border:        customStep === 'from' ? Colors.primary : customStep === 'to' || customStep === 'done' ? Colors.income : Colors.border,
                    titleColor:    customStep === 'from' ? Colors.primary : Colors.textPrimary,
                    subtitleColor: customStep === 'from' ? Colors.primary : customStep === 'to' || customStep === 'done' ? Colors.income : Colors.textMuted,
                    iconColor:     customStep === 'from' ? Colors.primary : Colors.textMuted,
                    activeHeaderBg: Colors.accent,
                  }}>
                  <Stack paddingTop={4} paddingBottom={8}>
                    <StyledDatePicker mode="date" variant="inline" value={pendingFrom}
                      onChange={(d) => {
                        setPendingFrom(d)
                        if (d > pendingTo) setPendingTo(d)
                        // Auto-advance to step 2
                        setCustomStep('to')
                      }}
                      showTodayButton
                      colors={{ selected: Colors.primary, today: Colors.primary, confirmBg: Colors.primary }} />
                  </Stack>
                </Collapse>

                {/* TO collapse — open on step 'to' */}
                <Collapse
                  variant="bordered"
                  collapse={customStep === 'to'}
                  onCollapse={(open) => { if (open) setCustomStep('to') }}
                  leading={
                    <Stack width={28} height={28} borderRadius={8}
                      backgroundColor={customStep === 'to' ? Colors.accent : customStep === 'done' ? Colors.incomeLight : Colors.bgMuted}
                      alignItems="center" justifyContent="center">
                      <Text fontSize={13}>{customStep === 'done' ? '✓' : '2'}</Text>
                    </Stack>
                  }
                  title="End Date"
                  subtitle={customStep === 'done' ? format(pendingTo, 'EEE, dd MMM yyyy') : customStep === 'to' ? 'Select end date' : 'Complete start date first'}
                  colors={{
                    background:    Colors.bgCard,
                    border:        customStep === 'to' ? Colors.primary : customStep === 'done' ? Colors.income : Colors.border,
                    titleColor:    customStep === 'to' ? Colors.primary : Colors.textPrimary,
                    subtitleColor: customStep === 'to' ? Colors.primary : customStep === 'done' ? Colors.income : Colors.textMuted,
                    iconColor:     customStep === 'to' ? Colors.primary : Colors.textMuted,
                    activeHeaderBg: Colors.accent,
                  }}>
                  <Stack paddingTop={4} paddingBottom={8}>
                    <StyledDatePicker mode="date" variant="inline" value={pendingTo}
                      onChange={(d) => {
                        setPendingTo(d)
                        if (d < pendingFrom) setPendingFrom(d)
                        // Auto-collapse — both dates set
                        setCustomStep('done')
                      }}
                      showTodayButton
                      colors={{ selected: Colors.primary, today: Colors.primary, confirmBg: Colors.primary }} />
                  </Stack>
                </Collapse>

              </Stack>
            )}
          </Stack>

          {/* ── Type ───────────────────────────────────────────────────── */}
          <Stack gap={14}>
            <Stack horizontal alignItems="center" gap={8}>
              <Stack width={3} height={16} borderRadius={2} backgroundColor={Colors.primary} />
              <Text fontSize={12} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>TRANSACTION TYPE</Text>
            </Stack>
            <Stack gap={8}>
              {TYPE_FILTERS.map(f => {
                const active  = pendingFilter === f.value
                const tColor  = f.value === 'income' ? Colors.income : f.value === 'expense' ? Colors.expense : f.value === 'transfer' ? Colors.transfer : Colors.primary
                const tLight  = f.value === 'income' ? Colors.incomeLight : f.value === 'expense' ? Colors.expenseLight : f.value === 'transfer' ? Colors.transferLight : Colors.accent
                return (
                  <StyledPressable key={f.value} flexDirection="row" alignItems="center" gap={14}
                    paddingHorizontal={16} paddingVertical={13} borderRadius={14}
                    backgroundColor={active ? tLight : Colors.bgMuted}
                    onPress={() => setPendingFilter(f.value)}>
                    <Stack width={10} height={10} borderRadius={5} backgroundColor={tColor} />
                    <Text flex={1} fontSize={14} fontWeight={active ? '700' : '500'}
                      color={active ? tColor : Colors.textMuted}>{f.label}</Text>
                    {active && (
                      <Stack width={20} height={20} borderRadius={10} backgroundColor={tColor} alignItems="center" justifyContent="center">
                        <Text fontSize={11} color="#fff">✓</Text>
                      </Stack>
                    )}
                  </StyledPressable>
                )
              })}
            </Stack>
          </Stack>

        </Stack>
      </Drawer>

    </StyledPage>
  )
}
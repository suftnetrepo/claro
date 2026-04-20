import React from 'react'
import { View, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native'
import { router } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  Stack, StyledText, StyledPressable, StyledSkeleton, StyledEmptyState, StyledPage,
} from 'fluent-styles'
import { dialogueService, toastService } from 'fluent-styles'
import Svg, { Circle } from 'react-native-svg'
import { format } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons'
import { IconCircle } from '../../icons/map'
import { useColors } from '../../constants'
import { usePremium } from '../../hooks/usePremium'
import { PremiumBanner } from '../premium/PremiumGate'
import { useBudgets, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { formatCurrency } from '../../utils'
import { SwipeableRow } from '../../components'

// ─── Donut ring ───────────────────────────────────────────────────────────────
function DonutRing({ spent, total, size = 80, color, trackColor }: {
  spent: number; total: number; size?: number; color: string; trackColor: string
}) {
  const r    = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const pct  = total > 0 ? Math.min(spent / total, 1) : 0
  const dash = pct * circ
  const cx   = size / 2
  const cy   = size / 2
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={r} stroke={trackColor} strokeWidth={8} fill="none" />
      <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={8} fill="none"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        rotation={-90} origin={`${cx}, ${cy}`}
      />
    </Svg>
  )
}

// ─── Budget row ───────────────────────────────────────────────────────────────
function BudgetRow({ b, symbol, onPress, onDelete, isLast }: {
  b: any; symbol: string; onPress: () => void; onDelete: () => void; isLast: boolean
}) {
  const Colors  = useColors()
  const pct     = b.limitAmount > 0 ? Math.min((b.spent / b.limitAmount) * 100, 100) : 0
  const isOver  = b.remaining < 0
  const isWarn  = !isOver && pct >= 80
  const barColor = isOver ? Colors.expense : isWarn ? Colors.warning : Colors.primary

  return (
    <View>
      <SwipeableRow onDelete={onDelete}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}
          style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: Colors.bgCard }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <IconCircle iconKey={b.categoryIcon} bg={b.categoryColor} size={44} />
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>{b.categoryName}</StyledText>
                <StyledText fontSize={13} fontWeight="700" color={Colors.textPrimary}>
                  {formatCurrency(b.spent, symbol)}
                  <StyledText fontSize={12} fontWeight="500" color={Colors.textMuted}> / {formatCurrency(b.limitAmount, symbol)}</StyledText>
                </StyledText>
              </View>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: Colors.border, overflow: 'hidden' }}>
                <View style={{ height: 5, borderRadius: 3, width: `${pct}%` as any, backgroundColor: barColor }} />
              </View>
              <StyledText fontSize={11} fontWeight="500" color={isOver ? Colors.expense : isWarn ? Colors.warning : Colors.textMuted}>
                {isOver ? `${formatCurrency(Math.abs(b.remaining), symbol)} over budget` : `${formatCurrency(b.remaining, symbol)} remaining`}
              </StyledText>
            </View>
          </View>
        </TouchableOpacity>
      </SwipeableRow>
      {!isLast && <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 74 }} />}
    </View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function BudgetsScreen() {
  const Colors = useColors()
  const premium = usePremium()
  const { data: settingsData } = useSettings()
  const symbol   = settingsData?.currencySymbol ?? '$'
  const { selectedMonth, prevMonth, nextMonth, invalidateData } = useRecordsStore()
  const { data, loading, remove, totalBudget, totalSpent, unbudgetedCategories } = useBudgets()

  const overallPct   = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0
  const isOverBudget = totalSpent > totalBudget && totalBudget > 0
  const remaining    = totalBudget - totalSpent

  const handleDeleteBudget = async (id: string, name: string) => {
    const ok = await dialogueService.confirm({
      title: `Remove budget for "${name}"?`,
      message: 'The budget limit will be removed for this month.',
      icon: '🗑️', confirmLabel: 'Remove', destructive: true,
    })
    if (ok) { await remove(id); invalidateData(); toastService.success('Budget removed') }
  }

  return (
    <StyledPage backgroundColor={Colors.bg}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>

          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
            <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>Budgets</StyledText>
          </View>

          {/* Month navigator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
            <StyledPressable width={36} height={36} borderRadius={18} backgroundColor={Colors.accent} alignItems="center" justifyContent="center" onPress={prevMonth}>
              <ChevronLeftIcon size={20} color={Colors.primary} strokeWidth={2.2} />
            </StyledPressable>
            <StyledText fontSize={16} fontWeight="700" color={Colors.primary}>{format(selectedMonth, 'MMMM, yyyy')}</StyledText>
            <StyledPressable width={36} height={36} borderRadius={18} backgroundColor={Colors.accent} alignItems="center" justifyContent="center" onPress={nextMonth}>
              <ChevronRightIcon size={20} color={Colors.primary} strokeWidth={2.2} />
            </StyledPressable>
          </View>

          {loading ? (
            <View style={{ padding: 16 }}><StyledSkeleton template="list-item" repeat={5} animation="shimmer" /></View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

              {/* Hero summary card */}
              {totalBudget > 0 && (
                <View style={{
                  marginHorizontal: 16, marginBottom: 16, borderRadius: 22, padding: 20,
                  backgroundColor: Colors.bgCard,
                  shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                    {/* Donut */}
                    <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
                      <DonutRing spent={totalSpent} total={totalBudget} size={80}
                        color={isOverBudget ? Colors.expense : Colors.primary}
                        trackColor={Colors.border} />
                      <View style={{ position: 'absolute', alignItems: 'center' }}>
                        <StyledText fontSize={13} fontWeight="800" color={isOverBudget ? Colors.expense : Colors.primary}>
                          {Math.round(overallPct)}%
                        </StyledText>
                      </View>
                    </View>

                    {/* Stats */}
                    <View style={{ flex: 1, gap: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                          <StyledText fontSize={11} fontWeight="600" color={Colors.textMuted} letterSpacing={0.3}>SPENT</StyledText>
                          <StyledText fontSize={20} fontWeight="800" letterSpacing={-0.5}
                            color={isOverBudget ? Colors.expense : Colors.textPrimary}>
                            {formatCurrency(totalSpent, symbol)}
                          </StyledText>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <StyledText fontSize={11} fontWeight="600" color={Colors.textMuted} letterSpacing={0.3}>BUDGET</StyledText>
                          <StyledText fontSize={20} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>
                            {formatCurrency(totalBudget, symbol)}
                          </StyledText>
                        </View>
                      </View>
                      <View style={{ height: 6, borderRadius: 3, backgroundColor: Colors.border, overflow: 'hidden' }}>
                        <View style={{ height: 6, borderRadius: 3, width: `${overallPct}%` as any,
                          backgroundColor: isOverBudget ? Colors.expense : Colors.primary }} />
                      </View>
                      <StyledText fontSize={12} fontWeight="600"
                        color={isOverBudget ? Colors.expense : Colors.textMuted}>
                        {isOverBudget
                          ? `${formatCurrency(Math.abs(remaining), symbol)} over budget`
                          : `${formatCurrency(remaining, symbol)} remaining`}
                      </StyledText>
                    </View>
                  </View>
                </View>
              )}

              {/* Budgeted categories */}
              {data.length > 0 && (
                <View style={{
                  marginHorizontal: 16, marginBottom: 16, borderRadius: 20, overflow: 'hidden',
                  backgroundColor: Colors.bgCard,
                  shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3,
                }}>
                  {/* Section header */}
                  <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <StyledText fontSize={15} fontWeight="800" color={Colors.primary}>Budgeted</StyledText>
                      <StyledText fontSize={12} color={Colors.textMuted} style={{ marginTop: 1 }}>
                        {format(selectedMonth, 'MMMM yyyy')} · {data.length} {data.length === 1 ? 'category' : 'categories'}
                      </StyledText>
                    </View>
                    <View style={{
                      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
                      backgroundColor: isOverBudget ? Colors.expenseLight : overallPct >= 80 ? Colors.expenseLight : Colors.incomeLight,
                    }}>
                      <StyledText fontSize={11} fontWeight="700"
                        color={isOverBudget ? Colors.expense : overallPct >= 80 ? Colors.warning : Colors.income}>
                        {isOverBudget ? 'Over budget' : overallPct >= 80 ? 'Near limit' : 'On track ✓'}
                      </StyledText>
                    </View>
                  </View>
                  <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 16, marginBottom: 4 }} />
                  {data.map((b, i) => (
                    <BudgetRow key={b.id} b={b} symbol={symbol} isLast={i === data.length - 1}
                      onDelete={() => handleDeleteBudget(b.id, b.categoryName)}
                      onPress={() => router.push({
                        pathname: '/set-budget' as any,
                        params: { categoryId: b.categoryId, categoryName: b.categoryName, categoryIcon: b.categoryIcon, categoryColor: b.categoryColor, budgetId: b.id, currentLimit: String(b.limitAmount) },
                      })} />
                  ))}
                </View>
              )}

              {/* Premium banner */}
              {!premium.isPremium && (
                <PremiumBanner
                  message={`Free: ${premium.limits.BUDGETS} budget per month`}
                  subtext={premium.canAddBudget((data ?? []).length) ? 'Upgrade for unlimited budgets' : 'Upgrade to add more budgets this month'}
                />
              )}

              {/* Unbudgeted categories */}
              {unbudgetedCategories.length > 0 && (
                <View style={{
                  marginHorizontal: 16, marginBottom: 16, borderRadius: 20, overflow: 'hidden',
                  backgroundColor: Colors.bgCard,
                  shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3,
                }}>
                  <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
                    <StyledText fontSize={15} fontWeight="800" color={Colors.textPrimary}>Not budgeted</StyledText>
                    <StyledText fontSize={12} color={Colors.textMuted} style={{ marginTop: 2 }}>Set limits for these categories</StyledText>
                  </View>
                  <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 16 }} />
                  {unbudgetedCategories.map((cat, i) => (
                    <View key={cat.id}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 14 }}>
                        <IconCircle iconKey={cat.icon} bg={cat.color} size={42} />
                        <StyledText flex={1} fontSize={14} fontWeight="600" color={Colors.textPrimary}>{cat.name}</StyledText>
                        <TouchableOpacity
                          onPress={() => premium.canAddBudget((data ?? []).length)
                            ? router.push({ pathname: '/set-budget' as any, params: { categoryId: cat.id, categoryName: cat.name, categoryIcon: cat.icon, categoryColor: cat.color } })
                            : router.push('/premium' as any)}
                          style={{
                            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
                            backgroundColor: premium.canAddBudget((data ?? []).length) ? Colors.accent : Colors.bgMuted,
                          }}>
                          <StyledText fontSize={11} fontWeight="700"
                            color={premium.canAddBudget((data ?? []).length) ? Colors.primary : Colors.textMuted}>
                            {premium.canAddBudget((data ?? []).length) ? '+ Set Budget' : '🔒 Premium'}
                          </StyledText>
                        </TouchableOpacity>
                      </View>
                      {i < unbudgetedCategories.length - 1 && <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 72 }} />}
                    </View>
                  ))}
                </View>
              )}

              {data.length === 0 && unbudgetedCategories.length === 0 && (
                <StyledEmptyState variant="minimal" illustration="💰" title="No budgets yet" description="Add categories to start tracking your spending limits" animated />
              )}

            </ScrollView>
          )}
        </View>
      </GestureHandlerRootView>
    </StyledPage>
  )
}
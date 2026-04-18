import React from 'react'
import { router } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  Stack, StyledText, StyledPressable, StyledScrollView, StyledCard,
  StyledSkeleton, StyledEmptyState, StyledProgressBar, StyledDivider, StyledPage,
} from 'fluent-styles'
import { dialogueService, toastService } from 'fluent-styles'
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

export default function BudgetsScreen() {
  const Colors = useColors()
  const premium = usePremium()
  const { data: settingsData } = useSettings()
  const symbol   = settingsData?.currencySymbol ?? '$'
  const { selectedMonth, prevMonth, nextMonth, invalidateData } = useRecordsStore()
  const { data, loading, remove, totalBudget, totalSpent, unbudgetedCategories } = useBudgets()

  const handleDeleteBudget = async (id: string, name: string) => {
    const ok = await dialogueService.confirm({
      title:        `Remove budget for "${name}"?`,
      message:      'The budget limit will be removed for this month.',
      icon:         '🗑️',
      confirmLabel: 'Remove',
      destructive:  true,
    })
    if (ok) {
      await remove(id)
      invalidateData()
      toastService.success('Budget removed')
    }
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack flex={1}>

        <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
          <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>Budgets</StyledText>
        </Stack>

        {/* Month navigator */}
        <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={20} paddingVertical={12}>
          <StyledPressable width={36} height={36} borderRadius={18} backgroundColor={Colors.accent} alignItems="center" justifyContent="center" onPress={prevMonth}>
            <ChevronLeftIcon size={20} color={Colors.primary} strokeWidth={2.2} />
          </StyledPressable>
          <StyledText fontSize={16} fontWeight="700" color={Colors.primary}>{format(selectedMonth, 'MMMM, yyyy')}</StyledText>
          <StyledPressable width={36} height={36} borderRadius={18} backgroundColor={Colors.accent} alignItems="center" justifyContent="center" onPress={nextMonth}>
            <ChevronRightIcon size={20} color={Colors.primary} strokeWidth={2.2} />
          </StyledPressable>
        </Stack>

        {/* Summary cards */}
        <Stack horizontal paddingHorizontal={16} gap={12} marginBottom={8}>
          <StyledCard flex={1} padding={14} borderRadius={14} backgroundColor={Colors.bgCard} borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>TOTAL BUDGET</StyledText>
            <StyledText fontSize={18} fontWeight="800" color={Colors.textPrimary} marginTop={4}>{formatCurrency(totalBudget, symbol)}</StyledText>
          </StyledCard>
          <StyledCard flex={1} padding={14} borderRadius={14} backgroundColor={Colors.bgCard} borderWidth={1} borderColor={Colors.border}>
            <StyledText fontSize={10} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>TOTAL SPENT</StyledText>
            <StyledText fontSize={18} fontWeight="800" color={totalSpent > totalBudget ? Colors.expense : Colors.income} marginTop={4}>{formatCurrency(totalSpent, symbol)}</StyledText>
          </StyledCard>
        </Stack>

        {loading ? (
          <Stack padding={16}><StyledSkeleton template="list-item" repeat={5} animation="shimmer" /></Stack>
        ) : (
          <StyledScrollView contentContainerStyle={{ paddingBottom: 120 }}>

            {/* Budgeted rows — swipeable */}
            {data.length > 0 && (
              <StyledCard marginHorizontal={16} marginBottom={16} borderRadius={16} backgroundColor={Colors.bgCard} borderWidth={1} borderColor={Colors.border} overflow="hidden">
                <Stack paddingHorizontal={16} paddingTop={14} paddingBottom={4}>
                  <StyledText fontSize={15} fontWeight="800" color={Colors.primary} marginBottom={8}>
                    Budgeted · {format(selectedMonth, 'MMM yyyy')}
                  </StyledText>
                </Stack>

                {data.map((b, i) => (
                  <Stack key={b.id}>
                    <SwipeableRow onDelete={() => handleDeleteBudget(b.id, b.categoryName)}>
                      <StyledPressable
                        flexDirection="row" alignItems="center" gap={12}
                        paddingHorizontal={16} paddingVertical={12}
                        backgroundColor={Colors.bgCard}
                        onPress={() => router.push({
                          pathname: '/set-budget' as any,
                          params: {
                            categoryId:    b.categoryId,
                            categoryName:  b.categoryName,
                            categoryIcon:  b.categoryIcon,
                            categoryColor: b.categoryColor,
                            budgetId:      b.id,
                            currentLimit:  String(b.limitAmount),
                          },
                        })}
                      >
                        <IconCircle iconKey={b.categoryIcon} bg={b.categoryColor} size={42} />
                        <Stack flex={1} gap={5}>
                          <Stack horizontal justifyContent="space-between">
                            <StyledText fontSize={13} fontWeight="700" color={Colors.textPrimary}>{b.categoryName}</StyledText>
                            <StyledText fontSize={12} color={Colors.textMuted}>
                              {formatCurrency(b.spent, symbol)} / {formatCurrency(b.limitAmount, symbol)}
                            </StyledText>
                          </Stack>
                          <StyledProgressBar
                            value={b.spent} total={b.limitAmount} size="sm" shape="pill" animated={false}
                            colors={{
                              fill:  b.percentage >= 100 ? Colors.expense : b.percentage >= 80 ? Colors.warning : Colors.primary,
                              track: Colors.border,
                            }}
                          />
                          <StyledText fontSize={11} color={b.remaining < 0 ? Colors.expense : Colors.textMuted}>
                            {b.remaining >= 0
                              ? `${formatCurrency(b.remaining, symbol)} remaining`
                              : `${formatCurrency(Math.abs(b.remaining), symbol)} over budget`}
                          </StyledText>
                        </Stack>
                      </StyledPressable>
                    </SwipeableRow>
                    {i < data.length - 1 && <StyledDivider borderBottomColor={Colors.border} marginLeft={74} />}
                  </Stack>
                ))}
              </StyledCard>
            )}

            {/* Premium upsell: always show for free users */}
            {!premium.isPremium && (
              <PremiumBanner
                message={`Free: ${premium.limits.BUDGETS} budget per month`}
                subtext={premium.canAddBudget((data ?? []).length) 
                  ? "Upgrade for unlimited" 
                  : "Upgrade to add more budgets this month"}
              />
            )}

            {/* Unbudgeted categories */}
            {unbudgetedCategories.length > 0 && (
              <StyledCard marginHorizontal={16} marginBottom={16} padding={16} borderRadius={16} backgroundColor={Colors.bgCard} borderWidth={1} borderColor={Colors.border}>
                <StyledText fontSize={15} fontWeight="800" color={Colors.textPrimary} marginBottom={12}>
                  Not budgeted this month
                </StyledText>
                {unbudgetedCategories.map((cat, i) => (
                  <Stack key={cat.id}>
                    <Stack horizontal alignItems="center" gap={12} paddingVertical={10}>
                      <IconCircle iconKey={cat.icon} bg={cat.color} size={42} />
                      <StyledText flex={1} fontSize={14} fontWeight="600" color={Colors.textPrimary}>{cat.name}</StyledText>
                      <StyledPressable
                        paddingHorizontal={12} paddingVertical={7}
                        borderRadius={8} borderWidth={1}
                        borderColor={premium.canAddBudget((data ?? []).length) ? Colors.primary : Colors.textMuted}
                        onPress={() => premium.canAddBudget((data ?? []).length)
                          ? router.push({ pathname: '/set-budget' as any, params: { categoryId: cat.id, categoryName: cat.name, categoryIcon: cat.icon, categoryColor: cat.color } })
                          : router.push('/premium' as any)}
                      >
                        <StyledText fontSize={11} fontWeight="700"
                          color={premium.canAddBudget((data ?? []).length) ? Colors.primary : Colors.textMuted}>
                          {premium.canAddBudget((data ?? []).length) ? 'SET BUDGET' : '🔒 PREMIUM'}
                        </StyledText>
                      </StyledPressable>
                    </Stack>
                    {i < unbudgetedCategories.length - 1 && <StyledDivider borderBottomColor={Colors.border} />}
                  </Stack>
                ))}
              </StyledCard>
            )}

            {data.length === 0 && unbudgetedCategories.length === 0 && (
              <StyledEmptyState variant="minimal" illustration="💰" title="No budgets yet" description="Tap SET BUDGET on any category below" animated />
            )}

          </StyledScrollView>
        )}



        </Stack>
      </GestureHandlerRootView>
    </StyledPage>
  )
}

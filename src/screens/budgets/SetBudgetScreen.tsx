import React, { useState, useCallback } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledPage, StyledCard, StyledHeader,
} from 'fluent-styles'
import { format } from 'date-fns'
import { useColors } from '../../constants'
import { dialogueService, toastService, loaderService } from 'fluent-styles'
import { IconCircle } from '../../icons/map'
import { ChevronLeftIcon, CheckIcon } from '../../icons'
import { useBudgets, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { formatCurrency } from '../../utils'
import { Calculator } from '../transactions/Calculator'

export default function SetBudgetScreen() {
  const Colors  = useColors()
  const params  = useLocalSearchParams<{
    categoryId: string; categoryName: string
    categoryIcon: string; categoryColor: string
    budgetId?: string; currentLimit?: string
  }>()

  const { data: settingsData }     = useSettings()
  const { create, update }         = useBudgets()
  const { selectedMonth, invalidateData } = useRecordsStore()

  const symbol     = settingsData?.currencySymbol ?? '$'
  const isEdit     = !!params.budgetId
  const monthLabel = format(selectedMonth, 'MMMM yyyy')
  const accentColor = params.categoryColor ?? Colors.primary

  const [amount, setAmount] = useState(params.currentLimit ?? '0')
  const isValid = parseFloat(amount) > 0

  const handleSave = useCallback(async () => {
    const num = parseFloat(amount)
    if (!num || num <= 0) { toastService.error('Invalid amount', 'Enter a budget greater than 0'); return }
    const loadId = loaderService.show({ label: 'Saving…', variant: 'spinner' })
    try {
      if (isEdit) {
        await update(params.budgetId!, num)
      } else {
        await create({ categoryId: params.categoryId, month: format(selectedMonth, 'yyyy-MM'), limitAmount: num })
      }
      invalidateData()
      toastService.success(isEdit ? 'Budget updated' : 'Budget set')
      router.back()
    } catch (err: any) {
      toastService.error('Failed', err?.message)
    } finally {
      loaderService.hide(loadId)
    }
  }, [amount, isEdit, params, create, update, selectedMonth, invalidateData])

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        {/* Header */}
        <Stack backgroundColor={Colors.bg} paddingHorizontal={20} paddingTop={16} paddingBottom={14}>
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <StyledPressable width={38} height={38} borderRadius={19}
              backgroundColor={Colors.bgCard} alignItems="center" justifyContent="center"
              onPress={() => router.back()}
              style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <ChevronLeftIcon size={18} color={Colors.textPrimary} strokeWidth={2.5} />
            </StyledPressable>
            <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.3}>
              {isEdit ? 'Edit Budget' : 'Set Budget'}
            </StyledText>
            <StyledPressable width={38} height={38} borderRadius={19}
              backgroundColor={isValid ? Colors.primary : Colors.bgMuted}
              alignItems="center" justifyContent="center"
              onPress={handleSave} disabled={!isValid}
              style={isValid ? { shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 } : undefined}>
              <CheckIcon size={18} color={isValid ? '#fff' : Colors.textMuted} strokeWidth={2.5} />
            </StyledPressable>
          </Stack>
        </Stack>
      </StyledHeader.Full>

      <Stack flex={1}>
        {/* Category preview card */}
        <Stack paddingHorizontal={16} paddingTop={8} paddingBottom={4}>
          <StyledCard borderRadius={22} padding={20} shadow="medium" backgroundColor={accentColor}>
            <Stack horizontal alignItems="center" gap={16}>
              <IconCircle iconKey={params.categoryIcon ?? 'other'} bg="rgba(255,255,255,0.22)" size={52} />
              <Stack flex={1} gap={3}>
                <StyledText fontSize={11} fontWeight="600" color="rgba(255,255,255,0.6)" letterSpacing={0.5}>
                  {isEdit ? 'EDITING BUDGET' : 'NEW BUDGET'}
                </StyledText>
                <StyledText fontSize={20} fontWeight="800" color="#fff" numberOfLines={1} letterSpacing={-0.5}>
                  {params.categoryName}
                </StyledText>
                <StyledText fontSize={13} fontWeight="500" color="rgba(255,255,255,0.75)">
                  {monthLabel}
                </StyledText>
              </Stack>
              {/* Live amount badge */}
              {isValid && (
                <Stack alignItems="flex-end" gap={2}>
                  <StyledText fontSize={11} fontWeight="600" color="rgba(255,255,255,0.6)">LIMIT</StyledText>
                  <StyledText fontSize={16} fontWeight="800" color="#fff" letterSpacing={-0.5}>
                    {formatCurrency(parseFloat(amount), symbol)}
                  </StyledText>
                </Stack>
              )}
            </Stack>
          </StyledCard>
        </Stack>

        {/* Calculator */}
        <Calculator value={amount} onChange={setAmount} symbol={symbol} accentColor={Colors.primary} />

        {/* Save button */}
        <Stack paddingHorizontal={16} paddingBottom={32} paddingTop={8}>
          <StyledPressable
            paddingVertical={18} borderRadius={18}
            backgroundColor={isValid ? Colors.primary : Colors.bgMuted}
            alignItems="center" justifyContent="center"
            onPress={handleSave} disabled={!isValid}
            style={isValid ? { shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 7 } : undefined}>
            <StyledText fontSize={16} fontWeight="800" color={isValid ? '#fff' : Colors.textMuted}>
              {isEdit ? 'Update Budget' : 'Set Budget'}
            </StyledText>
          </StyledPressable>
        </Stack>
      </Stack>
    </StyledPage>
  )
}
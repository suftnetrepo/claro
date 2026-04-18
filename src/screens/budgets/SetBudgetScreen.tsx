import React, { useState, useCallback } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledPage,
} from 'fluent-styles'
import { format } from 'date-fns'
import { Colors, useColors } from '../../constants'
import { dialogueService, toastService, loaderService } from 'fluent-styles'
import { ModalHeader } from '../../components'
import { IconCircle } from '../../icons/map'
import { useBudgets, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { Calculator } from '../transactions/Calculator'

export default function SetBudgetScreen() {
  const Colors = useColors()
  const params  = useLocalSearchParams<{
    categoryId:    string
    categoryName:  string
    categoryIcon:  string
    categoryColor: string
    budgetId?:     string
    currentLimit?: string
  }>()

  const { data: settingsData }     = useSettings()
  const { create, update, remove } = useBudgets()
  const { selectedMonth, invalidateData } = useRecordsStore()

  const symbol   = settingsData?.currencySymbol ?? '$'
  const isEdit   = !!params.budgetId
  const monthLabel = format(selectedMonth, 'MMMM yyyy')

  const [amount, setAmount] = useState(params.currentLimit ?? '0')

  const handleSave = useCallback(async () => {
    const num = parseFloat(amount)
    if (!num || num <= 0) { toastService.error('Invalid amount', 'Enter a budget greater than 0'); return }

    const loadId = loaderService.show({ label: 'Saving…', variant: 'spinner' })
    try {
      if (isEdit) {
        await update(params.budgetId!, num)
      } else {
        await create({
          categoryId:  params.categoryId,
          month:       format(selectedMonth, 'yyyy-MM'),
          limitAmount: num,
        })
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
      <Stack flex={1}>

      <ModalHeader
        title={isEdit ? 'Edit Budget' : 'Set Budget'}
        onClose={() => router.back()}
        onSave={handleSave}
      />

      {/* Category + month */}
      <Stack
        horizontal alignItems="center" gap={14}
        paddingHorizontal={20} paddingVertical={16}
        backgroundColor={Colors.bgCard}
        borderBottomWidth={1} borderBottomColor={Colors.border}
      >
        <IconCircle
          iconKey={params.categoryIcon ?? 'other'}
          bg={params.categoryColor ?? Colors.primary}
          size={48}
        />
        <Stack flex={1} gap={2}>
          <StyledText fontSize={16} fontWeight="800" color={Colors.textPrimary}>
            {params.categoryName}
          </StyledText>
          <StyledText fontSize={13} color={Colors.textMuted}>
            Budget for {monthLabel}
          </StyledText>
        </Stack>
      </Stack>

      {/* Calculator */}
      <Calculator value={amount} onChange={setAmount} symbol={symbol} />

      </Stack>
    </StyledPage>
  )
}

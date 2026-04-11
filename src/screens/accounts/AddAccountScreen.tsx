import React, { useState, useCallback } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledTextInput,
  StyledScrollView, StyledDivider,
} from 'fluent-styles'
import { useColors } from '../../constants'
import { toastService, loaderService } from 'fluent-styles'
import { ALL_ACCOUNT_ICON_KEYS } from '../../icons/map'
import { ModalHeader, ColorPicker, IconPicker } from '../../components'
import { useAccounts } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { IconCircle } from '../../icons/map'
import { AccountColors } from '../../constants'

// ─── Mode: add or edit ────────────────────────────────────────────────────────
// When editing, params contain: id, name, icon, color, balance
export default function AddAccountScreen() {
  const Colors = useColors()
  const params   = useLocalSearchParams<{
    id?: string; name?: string; icon?: string; color?: string; balance?: string
  }>()
  const isEdit   = !!params.id

  const { create, update, remove } = useAccounts()
  const { invalidateData }         = useRecordsStore()

  const [name,    setName]    = useState(params.name ?? '')
  const [icon,    setIcon]    = useState(params.icon ?? 'cash')
  const [color,   setColor]   = useState(params.color ?? AccountColors.cash)
  const [balance, setBalance] = useState(params.balance ?? '0')
  const [tab,     setTab]     = useState<'details' | 'balance'>('details')

  const handleSave = useCallback(async () => {
    if (!name.trim()) { toastService.error('Name required', 'Please enter an account name'); return }
    const loadId = loaderService.show({ label: isEdit ? 'Saving…' : 'Creating…', variant: 'spinner' })
    try {
      if (isEdit) {
        await update(params.id!, { name: name.trim(), icon, color })
      } else {
        await create({
          name:          name.trim(),
          icon,
          color,
          balance:       parseFloat(balance) || 0,
          initialAmount: parseFloat(balance) || 0,
          sortOrder:     99,
          isDefault:     false,
        })
      }
      invalidateData()
      toastService.success(isEdit ? 'Account updated' : 'Account created')
      router.back()
    } catch (err: any) {
      toastService.error('Failed', err?.message)
    } finally {
      loaderService.hide(loadId)
    }
  }, [name, icon, color, balance, isEdit, params.id, create, update, invalidateData])


  return (
    <Stack flex={1} backgroundColor={Colors.bg}>

      <ModalHeader
        title={isEdit ? 'Edit Account' : 'New Account'}
        onClose={() => router.back()}
        onSave={handleSave}
      />

      {/* Preview */}
      <Stack alignItems="center" paddingVertical={20} backgroundColor={Colors.bgCard} borderBottomWidth={1} borderBottomColor={Colors.border}>
        <IconCircle iconKey={icon} bg={color} size={64} type="account" />
        <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary} marginTop={10}>
          {name || 'Account name'}
        </StyledText>
      </Stack>

      <StyledScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>

        {/* Name */}
        <Stack gap={8}>
          <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={0.5}>
            NAME
          </StyledText>
          <StyledTextInput
            variant="filled"
            placeholder="e.g. Main account"
            value={name}
            onChangeText={setName}
            fontSize={15}
            autoFocus={!isEdit}
          />
        </Stack>

        {/* Initial balance (add only) */}
        {!isEdit && (
          <Stack gap={8}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={0.5}>
              INITIAL BALANCE
            </StyledText>
            <StyledTextInput
              variant="filled"
              placeholder="0.00"
              value={balance}
              onChangeText={setBalance}
              keyboardType="decimal-pad"
              fontSize={15}
            />
          </Stack>
        )}

        {/* Icon */}
        <IconPicker
          keys={ALL_ACCOUNT_ICON_KEYS}
          selected={icon}
          color={color}
          onSelect={setIcon}
          type="account"
        />

        {/* Color */}
        <ColorPicker selected={color} onSelect={setColor} />

      </StyledScrollView>

    </Stack>
  )
}

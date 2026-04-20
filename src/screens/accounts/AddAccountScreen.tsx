import React, { useState, useCallback } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledTextInput,
  StyledScrollView, StyledCard, StyledPage, StyledHeader,
} from 'fluent-styles'
import { useColors } from '../../constants'
import { toastService, loaderService } from 'fluent-styles'
import { ALL_ACCOUNT_ICON_KEYS } from '../../icons/map'
import { ColorPicker, IconPicker } from '../../components'
import { ChevronLeftIcon, CheckIcon } from '../../icons'
import { useAccounts } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { IconCircle } from '../../icons/map'
import { AccountColors } from '../../constants'

export default function AddAccountScreen() {
  const Colors = useColors()
  const params  = useLocalSearchParams<{ id?: string; name?: string; icon?: string; color?: string; balance?: string }>()
  const isEdit  = !!params.id

  const { create, update } = useAccounts()
  const { invalidateData } = useRecordsStore()

  const [name,    setName]    = useState(params.name ?? '')
  const [icon,    setIcon]    = useState(params.icon ?? 'cash')
  const [color,   setColor]   = useState(params.color ?? AccountColors.cash)
  const [balance, setBalance] = useState(params.balance ?? '0')

  const handleSave = useCallback(async () => {
    if (!name.trim()) { toastService.error('Name required', 'Please enter an account name'); return }
    const loadId = loaderService.show({ label: isEdit ? 'Saving…' : 'Creating…', variant: 'spinner' })
    try {
      if (isEdit) {
        await update(params.id!, { name: name.trim(), icon, color })
      } else {
        await create({ name: name.trim(), icon, color, balance: parseFloat(balance) || 0, initialAmount: parseFloat(balance) || 0, sortOrder: 99, isDefault: false })
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

  const isValid = name.trim().length > 0

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        {/* Header — matches Add Transaction */}
        <Stack backgroundColor={Colors.bg} paddingHorizontal={20} paddingTop={16} paddingBottom={14}>
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <StyledPressable width={38} height={38} borderRadius={19}
              backgroundColor={Colors.bgCard} alignItems="center" justifyContent="center"
              onPress={() => router.back()}
              style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <ChevronLeftIcon size={18} color={Colors.textPrimary} strokeWidth={2.5} />
            </StyledPressable>
            <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.3}>
              {isEdit ? 'Edit Account' : 'New Account'}
            </StyledText>
            {/* Save button */}
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

      <StyledScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Live preview card — clean horizontal layout */}
        <Stack paddingHorizontal={16} paddingVertical={20}>
          <StyledCard
            borderRadius={22} padding={20} shadow="medium"
            backgroundColor={color}>
            <Stack horizontal alignItems="center" gap={16}>
              <IconCircle iconKey={icon} bg="rgba(255,255,255,0.22)" size={52} type="account" />
              <Stack flex={1} gap={3}>
                <StyledText fontSize={11} fontWeight="600" color="rgba(255,255,255,0.6)" letterSpacing={0.5}>
                  {isEdit ? 'EDITING ACCOUNT' : 'NEW ACCOUNT'}
                </StyledText>
                <StyledText fontSize={20} fontWeight="800" color="#fff" numberOfLines={1} letterSpacing={-0.5}>
                  {name || 'Account Name'}
                </StyledText>
                {!isEdit && (
                  <StyledText fontSize={14} fontWeight="600" color="rgba(255,255,255,0.8)" letterSpacing={-0.3}>
                    ${parseFloat(balance) > 0 ? parseFloat(balance).toFixed(2) : '0.00'}
                  </StyledText>
                )}
              </Stack>
            </Stack>
          </StyledCard>
        </Stack>

        {/* Details card — name + balance */}
        <StyledCard
          marginHorizontal={16} marginBottom={16}
          borderRadius={18} overflow="hidden" shadow="light"
          backgroundColor={Colors.bgCard}>

          {/* Name row */}
          <Stack paddingHorizontal={16} paddingTop={16} paddingBottom={12}>
            <StyledText fontSize={11} fontWeight="700" color={Colors.textMuted} letterSpacing={1} marginBottom={8}>
              ACCOUNT NAME
            </StyledText>
            <StyledTextInput
              variant="ghost"
              placeholder="e.g. Main account"
              value={name}
              onChangeText={setName}
              fontSize={15}
              autoFocus={!isEdit}
              borderRadius={12}
              backgroundColor={Colors.bgInput}
              borderWidth={0}
            />
          </Stack>

          {/* Balance row (add only) */}
          {!isEdit && (
            <Stack paddingHorizontal={16} paddingBottom={16}>
              <StyledText fontSize={11} fontWeight="700" color={Colors.textMuted} letterSpacing={1} marginBottom={8}>
                INITIAL BALANCE
              </StyledText>
              <StyledTextInput
                variant="ghost"
                placeholder="0.00"
                value={balance}
                onChangeText={setBalance}
                keyboardType="decimal-pad"
                fontSize={15}
                borderRadius={12}
                backgroundColor={Colors.bgInput}
                borderWidth={0}
              />
            </Stack>
          )}
        </StyledCard>

        {/* Icon picker */}
        <StyledCard marginHorizontal={16} marginBottom={16} borderRadius={18} shadow="light" backgroundColor={Colors.bgCard} padding={16}>
          <StyledText fontSize={11} fontWeight="700" color={Colors.textMuted} letterSpacing={1} marginBottom={12}>
            ICON
          </StyledText>
          <IconPicker keys={ALL_ACCOUNT_ICON_KEYS} selected={icon} color={color} onSelect={setIcon} type="account" label=" " />
        </StyledCard>

        {/* Color picker */}
        <StyledCard marginHorizontal={16} marginBottom={16} borderRadius={18} shadow="light" backgroundColor={Colors.bgCard} padding={16}>
          <StyledText fontSize={11} fontWeight="700" color={Colors.textMuted} letterSpacing={1} marginBottom={12}>
            COLOR
          </StyledText>
          <ColorPicker selected={color} onSelect={setColor} label=" " />
        </StyledCard>

        {/* Save button */}
        <StyledPressable
          marginHorizontal={16} paddingVertical={18} borderRadius={18}
          backgroundColor={isValid ? Colors.primary : Colors.bgMuted}
          alignItems="center" justifyContent="center"
          onPress={handleSave} disabled={!isValid}
          style={isValid ? { shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 7 } : undefined}>
          <StyledText fontSize={16} fontWeight="800" color={isValid ? '#fff' : Colors.textMuted}>
            {isEdit ? 'Save Changes' : 'Create Account'}
          </StyledText>
        </StyledPressable>

      </StyledScrollView>
    </StyledPage>
  )
}
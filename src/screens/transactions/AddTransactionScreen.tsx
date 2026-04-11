import React, { useState, useCallback } from 'react'
import { Keyboard, ScrollView } from 'react-native'
import { router } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledTextInput,
  StyledDatePicker, Popup,
} from 'fluent-styles'
import { toastService, loaderService } from 'fluent-styles'
import { format } from 'date-fns'
import { CalendarIcon, ChevronDownIcon } from '../../icons'
import { IconCircle } from '../../icons/map'
import { useColors } from '../../constants'
import { useTransactions, useAccounts, useCategories, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { Calculator } from './Calculator'
import { AccountPicker } from './AccountPicker'
import { CategoryPicker } from './CategoryPicker'

type TxType = 'expense' | 'income' | 'transfer'

const TYPE_TABS = [
  { value: 'expense'  as TxType, label: 'Expense'  },
  { value: 'income'   as TxType, label: 'Income'   },
  { value: 'transfer' as TxType, label: 'Transfer' },
]

const TYPE_COLORS: Record<TxType, string> = {
  expense:  '#E53935',
  income:   '#43A047',
  transfer: '#1E88E5',
}

export default function AddTransactionScreen() {
  const Colors = useColors()
  const { data: settingsData }        = useSettings()
  const { create: createTransaction } = useTransactions()
  const { data: accounts }            = useAccounts()
  const { data: expenseCategories }   = useCategories('expense')
  const { data: incomeCategories }    = useCategories('income')
  const { invalidateData }            = useRecordsStore()

  const symbol = settingsData?.currencySymbol ?? '$'

  const [txType,      setTxType]      = useState<TxType>('expense')
  const [amount,      setAmount]      = useState('0')
  const [accountId,   setAccountId]   = useState<string | null>(accounts[0]?.id ?? null)
  const [toAccountId, setToAccountId] = useState<string | null>(null)
  const [categoryId,  setCategoryId]  = useState<string | null>(null)
  const [date,        setDate]        = useState<Date>(new Date())
  const [notes,       setNotes]       = useState('')
  const [showAccount,   setShowAccount]   = useState(false)
  const [showToAccount, setShowToAccount] = useState(false)
  const [showCategory,  setShowCategory]  = useState(false)
  const [showDate,      setShowDate]      = useState(false)

  const selectedAccount   = accounts.find(a => a.id === accountId)
  const selectedToAccount = accounts.find(a => a.id === toAccountId)
  const allCategories     = [...expenseCategories, ...incomeCategories]
  const selectedCategory  = allCategories.find(c => c.id === categoryId)
  const accentColor       = TYPE_COLORS[txType]
  const isValid           = parseFloat(amount) > 0 && !!accountId

  const handleTypeChange = (type: TxType) => { setTxType(type); setCategoryId(null) }

  const handleSave = useCallback(async () => {
    const num = parseFloat(amount)
    if (!num || num <= 0) { toastService.error('Invalid amount', 'Enter an amount greater than 0'); return }
    if (!accountId)       { toastService.error('No account', 'Please select an account'); return }
    if (txType === 'transfer' && !toAccountId) {
      toastService.error('No destination', 'Select a destination account'); return
    }
    Keyboard.dismiss()
    const loadId = loaderService.show({ label: 'Saving…', variant: 'spinner' })
    try {
      await createTransaction({
        type:        txType,
        amount:      num,
        date,
        notes:       notes.trim() || null,
        accountId:   accountId!,
        categoryId:  categoryId ?? null,
        toAccountId: txType === 'transfer' ? (toAccountId ?? null) : null,
      })
      invalidateData()
      toastService.success('Transaction saved')
      router.back()
    } catch (err: any) {
      toastService.error('Failed to save', err?.message)
    } finally {
      loaderService.hide(loadId)
    }
  }, [amount, accountId, toAccountId, txType, date, notes, categoryId, createTransaction, invalidateData])

  return (
    <Stack flex={1} backgroundColor={Colors.bg}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <Stack horizontal alignItems="center" justifyContent="space-between"
        paddingHorizontal={20} paddingTop={16} paddingBottom={12}
        backgroundColor={Colors.bgCard}
        borderBottomWidth={1} borderBottomColor={Colors.border}>
        <StyledPressable width={36} height={36} borderRadius={18}
          backgroundColor={Colors.bgMuted} alignItems="center" justifyContent="center"
          onPress={() => router.back()}>
          <StyledText fontSize={20} color={Colors.textPrimary}>←</StyledText>
        </StyledPressable>
        <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary}>Add Transaction</StyledText>
        <Stack width={36} />
      </Stack>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Type selector ───────────────────────────────────────── */}
        <Stack paddingHorizontal={20} paddingTop={20} paddingBottom={8}>
          {/* Custom 3-button pill row — clear active color per type */}
          <Stack horizontal borderRadius={14} overflow="hidden"
            backgroundColor={Colors.bgMuted} padding={4} gap={4}>
            {TYPE_TABS.map(t => {
              const active = txType === t.value
              const color  = TYPE_COLORS[t.value]
              return (
                <StyledPressable
                  key={t.value}
                  flex={1} paddingVertical={10} borderRadius={10}
                  alignItems="center" justifyContent="center"
                  backgroundColor={active ? color : 'transparent'}
                  onPress={() => handleTypeChange(t.value)}
                  style={active ? {
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  } : undefined}
                >
                  <StyledText fontSize={14} fontWeight="700"
                    color={active ? Colors.white : Colors.textSecondary}>
                    {t.label}
                  </StyledText>
                </StyledPressable>
              )
            })}
          </Stack>
        </Stack>

        {/* ── Amount input ─────────────────────────────────────────── */}
        <Stack paddingTop={8}>
          <StyledText fontSize={11} color={Colors.textMuted} fontWeight="700"
            letterSpacing={1} textAlign="center" paddingTop={8}>
            INPUT AMOUNT
          </StyledText>
          <Calculator value={amount} onChange={setAmount} symbol={symbol} />
        </Stack>

        {/* ── Account pill ─────────────────────────────────────────── */}
        <Stack paddingHorizontal={20} marginBottom={14}>
          <StyledPressable
            flexDirection="row" alignItems="center" justifyContent="center" gap={8}
            paddingVertical={14} paddingHorizontal={20}
            borderRadius={30} borderWidth={1} borderColor={Colors.border}
            backgroundColor={Colors.bgCard}
            onPress={() => setShowAccount(true)}
          >
            {selectedAccount ? (
              <IconCircle iconKey={selectedAccount.icon} bg={selectedAccount.color} size={24} type="account" />
            ) : null}
            <StyledText fontSize={15} fontWeight="600" color={Colors.textPrimary}>
              {selectedAccount?.name ?? 'Select account'}
            </StyledText>
            <ChevronDownIcon size={16} color={Colors.textMuted} />
          </StyledPressable>
        </Stack>

        {/* ── Transfer destination pill ─────────────────────────────── */}
        {txType === 'transfer' && (
          <Stack paddingHorizontal={20} marginBottom={14}>
            <StyledPressable
              flexDirection="row" alignItems="center" justifyContent="center" gap={8}
              paddingVertical={14} paddingHorizontal={20}
              borderRadius={30} borderWidth={1} borderColor={Colors.border}
              backgroundColor={Colors.bgCard}
              onPress={() => setShowToAccount(true)}
            >
              {selectedToAccount ? (
                <IconCircle iconKey={selectedToAccount.icon} bg={selectedToAccount.color} size={24} type="account" />
              ) : null}
              <StyledText fontSize={15} fontWeight="600" color={Colors.textPrimary}>
                {selectedToAccount?.name ?? 'To account'}
              </StyledText>
              <ChevronDownIcon size={16} color={Colors.textMuted} />
            </StyledPressable>
          </Stack>
        )}

        {/* ── Category + Date row ───────────────────────────────────── */}
        {txType !== 'transfer' && (
          <Stack horizontal paddingHorizontal={20} gap={12} marginBottom={14}>
            <StyledPressable
              flex={1} flexDirection="row" alignItems="center" gap={8}
              paddingVertical={12} paddingHorizontal={14}
              borderRadius={16} borderWidth={1} borderColor={Colors.border}
              backgroundColor={Colors.bgCard}
              onPress={() => setShowCategory(true)}
            >
              {selectedCategory
                ? <IconCircle iconKey={selectedCategory.icon} bg={selectedCategory.color} size={22} />
                : <StyledText fontSize={16}>🏷️</StyledText>
              }
              <StyledText flex={1} fontSize={13} fontWeight="600" color={Colors.textPrimary} numberOfLines={1}>
                {selectedCategory?.name ?? 'Category'}
              </StyledText>
              <ChevronDownIcon size={14} color={Colors.textMuted} />
            </StyledPressable>

            <StyledPressable
              flex={1} flexDirection="row" alignItems="center" gap={8}
              paddingVertical={12} paddingHorizontal={14}
              borderRadius={16} borderWidth={1} borderColor={Colors.border}
              backgroundColor={Colors.bgCard}
              onPress={() => setShowDate(true)}
            >
              <CalendarIcon size={16} color={Colors.textMuted} />
              <StyledText flex={1} fontSize={13} fontWeight="600" color={Colors.textPrimary} numberOfLines={1}>
                {format(date, 'MMM d, yyyy')}
              </StyledText>
              <ChevronDownIcon size={14} color={Colors.textMuted} />
            </StyledPressable>
          </Stack>
        )}

        {/* Transfer date pill */}
        {txType === 'transfer' && (
          <Stack paddingHorizontal={20} marginBottom={14}>
            <StyledPressable
              flexDirection="row" alignItems="center" gap={8}
              paddingVertical={12} paddingHorizontal={14}
              borderRadius={16} borderWidth={1} borderColor={Colors.border}
              backgroundColor={Colors.bgCard}
              onPress={() => setShowDate(true)}
            >
              <CalendarIcon size={16} color={Colors.textMuted} />
              <StyledText flex={1} fontSize={13} fontWeight="600" color={Colors.textPrimary}>
                {format(date, 'MMM d, yyyy')}
              </StyledText>
              <ChevronDownIcon size={14} color={Colors.textMuted} />
            </StyledPressable>
          </Stack>
        )}

        {/* ── Notes field ──────────────────────────────────────────── */}
        <Stack paddingHorizontal={20} marginBottom={24}>
          <StyledTextInput
            variant="filled"
            placeholder="Note: Enter a note"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            fontSize={14}
            borderRadius={16}
          />
        </Stack>

        {/* ── Save button ───────────────────────────────────────────── */}
        <Stack paddingHorizontal={20}>
          <StyledPressable
            paddingVertical={18} borderRadius={30}
            backgroundColor={isValid ? accentColor : Colors.bgMuted}
            alignItems="center" justifyContent="center"
            onPress={handleSave}
            disabled={!isValid}
            style={isValid ? {
              shadowColor: accentColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
            } : undefined}
          >
            <StyledText fontSize={16} fontWeight="800"
              color={isValid ? Colors.white : Colors.textMuted}>
              Save Transaction
            </StyledText>
          </StyledPressable>
        </Stack>

      </ScrollView>

      {/* ── Date popup ────────────────────────────────────────────── */}
      <Popup visible={showDate} onClose={() => setShowDate(false)}
        title="Select date" showClose position="bottom" round>
        <Stack paddingHorizontal={16} paddingBottom={24}>
          <StyledDatePicker mode="date" variant="inline" value={date} onChange={setDate} showTodayButton
            colors={{ selected: accentColor, today: accentColor, confirmBg: accentColor }} />
          <StyledPressable paddingVertical={14} borderRadius={14} backgroundColor={accentColor}
            alignItems="center" marginTop={8} onPress={() => setShowDate(false)}>
            <StyledText fontSize={15} fontWeight="700" color={Colors.white}>Set date</StyledText>
          </StyledPressable>
        </Stack>
      </Popup>

      {/* ── Pickers ───────────────────────────────────────────────── */}
      <AccountPicker visible={showAccount} accounts={accounts} selected={accountId}
        onSelect={a => setAccountId(a.id)} onClose={() => setShowAccount(false)} />
      <AccountPicker visible={showToAccount} accounts={accounts.filter(a => a.id !== accountId)}
        selected={toAccountId} onSelect={a => setToAccountId(a.id)} onClose={() => setShowToAccount(false)} />
      <CategoryPicker visible={showCategory} expenseCategories={expenseCategories}
        incomeCategories={incomeCategories} selected={categoryId}
        transactionType={txType === 'transfer' ? 'expense' : txType}
        onSelect={c => setCategoryId(c.id)} onClose={() => setShowCategory(false)} />

    </Stack>
  )
}

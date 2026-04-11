import React, { useState, useCallback } from 'react'
import { Keyboard } from 'react-native'
import { router } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledTextInput,
  StyledDivider, StyledDatePicker, Popup, useToast, useLoader,
  TabBar,
} from 'fluent-styles'
import { format } from 'date-fns'
import { CloseIcon, CheckIcon, CalendarIcon } from '../../icons'
import { IconCircle } from '../../icons/map'
import { Colors, useColors } from '../../constants'
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
  expense:  Colors.expense,
  income:   Colors.income,
  transfer: Colors.transfer,
}

const TYPE_BG: Record<TxType, string> = {
  expense:  Colors.expenseLight,
  income:   Colors.incomeLight,
  transfer: Colors.transferLight,
}

export default function AddTransactionScreen() {
  const Colors = useColors()
  const toast   = useToast()
  const loader  = useLoader()

  const { invalidateData }            = useRecordsStore()
  const { data: settingsData }        = useSettings()
  const { create: createTransaction } = useTransactions()
  const { data: accounts }            = useAccounts()
  const { data: expenseCategories }   = useCategories('expense')
  const { data: incomeCategories }    = useCategories('income')

  const symbol = settingsData?.currencySymbol ?? '$'

  // ─── Form state ───────────────────────────────────────────────────────────
  const [txType,      setTxType]      = useState<TxType>('expense')
  const [amount,      setAmount]      = useState('0')
  const [accountId,   setAccountId]   = useState<string | null>(accounts[0]?.id ?? null)
  const [toAccountId, setToAccountId] = useState<string | null>(null)
  const [categoryId,  setCategoryId]  = useState<string | null>(null)
  const [date,        setDate]        = useState<Date>(new Date())
  const [notes,       setNotes]       = useState('')
  const [showDate,    setShowDate]    = useState(false)

  // ─── Sheet visibility ─────────────────────────────────────────────────────
  const [showAccount,   setShowAccount]   = useState(false)
  const [showToAccount, setShowToAccount] = useState(false)
  const [showCategory,  setShowCategory]  = useState(false)

  // ─── Derived ──────────────────────────────────────────────────────────────
  const selectedAccount   = accounts.find(a => a.id === accountId)
  const selectedToAccount = accounts.find(a => a.id === toAccountId)
  const allCategories     = txType === 'income' ? incomeCategories : expenseCategories
  // Search the correct list for the selected category
  const selectedCategory  = [...expenseCategories, ...incomeCategories].find(c => c.id === categoryId)
  const accentColor       = TYPE_COLORS[txType]
  const bgColor           = TYPE_BG[txType]

  // ─── Validation ───────────────────────────────────────────────────────────
  const isValid = useCallback((): boolean => {
    const num = parseFloat(amount)
    if (!num || num <= 0) {
      toast.error('Invalid amount', 'Please enter an amount greater than 0')
      return false
    }
    if (!accountId) {
      toast.error('No account', 'Please select an account')
      return false
    }
    if (txType === 'transfer' && !toAccountId) {
      toast.error('No destination', 'Please select a destination account')
      return false
    }
    if (txType === 'transfer' && accountId === toAccountId) {
      toast.error('Same account', 'Source and destination must be different')
      return false
    }
    return true
  }, [amount, accountId, toAccountId, txType, toast])

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!isValid()) return
    Keyboard.dismiss()
    const loadId = loader.show({ label: 'Saving…', variant: 'spinner' })
    try {
      await createTransaction({
        type:        txType,
        amount:      parseFloat(amount),
        date,
        notes:       notes.trim() || null,
        accountId:   accountId!,
        categoryId:  categoryId ?? null,
        toAccountId: txType === 'transfer' ? (toAccountId ?? null) : null,
      })
      invalidateData()
      toast.success('Transaction saved')
      router.back()
    } catch (err: any) {
      toast.error('Failed to save', err?.message)
    } finally {
      loader.hide(loadId)
    }
  }, [isValid, txType, amount, date, notes, accountId, categoryId, toAccountId, createTransaction, toast, loader])

  const handleTypeChange = (type: TxType) => {
    setTxType(type)
    setCategoryId(null)
  }

  return (
    <Stack flex={1} backgroundColor={Colors.bg}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Stack paddingTop={8} paddingHorizontal={20} paddingBottom={12} backgroundColor={bgColor}>
        <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={16}>
          <StyledPressable
            width={36} height={36} borderRadius={18}
            backgroundColor={Colors.bgCard + '99'}
            alignItems="center" justifyContent="center"
            onPress={() => router.back()}
          >
            <CloseIcon size={18} color={Colors.textPrimary} />
          </StyledPressable>

          <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary}>
            Add Transaction
          </StyledText>

          <StyledPressable
            width={36} height={36} borderRadius={18}
            backgroundColor={accentColor}
            alignItems="center" justifyContent="center"
            onPress={handleSave}
          >
            <CheckIcon size={18} color="#fff" strokeWidth={2.5} />
          </StyledPressable>
        </Stack>

        <TabBar
          options={TYPE_TABS}
          value={txType}
          onChange={handleTypeChange}
          indicator="pill"
          colors={{
            background: Colors.bgCard + '66',
            activeText: accentColor,
            indicator:  Colors.bgCard,
            text:       Colors.textMuted,
          }}
        />
      </Stack>

      {/* ── Calculator ──────────────────────────────────────────────────── */}
      <Stack backgroundColor={bgColor}>
        <Calculator value={amount} onChange={setAmount} symbol={symbol} />
      </Stack>

      <StyledDivider borderBottomColor={Colors.border} />

      {/* ── Fields ──────────────────────────────────────────────────────── */}
      <Stack flex={1} paddingHorizontal={20} paddingTop={8}>

        {/* Account */}
        <StyledPressable
          flexDirection="row" alignItems="center" gap={14}
          paddingVertical={14}
          onPress={() => setShowAccount(true)}
        >
          <StyledText fontSize={18} width={28} textAlign="center">💳</StyledText>
          <StyledText flex={1} fontSize={15} fontWeight="600" color={Colors.textSecondary}>Account</StyledText>
          {selectedAccount ? (
            <Stack horizontal alignItems="center" gap={8}>
              <IconCircle iconKey={selectedAccount.icon} bg={selectedAccount.color} size={28} type="account" />
              <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>{selectedAccount.name}</StyledText>
            </Stack>
          ) : (
            <StyledText fontSize={14} color={Colors.primary} fontWeight="600">Select →</StyledText>
          )}
        </StyledPressable>
        <StyledDivider borderBottomColor={Colors.border} marginLeft={42} />

        {/* To Account (transfer only) */}
        {txType === 'transfer' && (
          <>
            <StyledPressable
              flexDirection="row" alignItems="center" gap={14}
              paddingVertical={14}
              onPress={() => setShowToAccount(true)}
            >
              <StyledText fontSize={18} width={28} textAlign="center">🔄</StyledText>
              <StyledText flex={1} fontSize={15} fontWeight="600" color={Colors.textSecondary}>To Account</StyledText>
              {selectedToAccount ? (
                <Stack horizontal alignItems="center" gap={8}>
                  <IconCircle iconKey={selectedToAccount.icon} bg={selectedToAccount.color} size={28} type="account" />
                  <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>{selectedToAccount.name}</StyledText>
                </Stack>
              ) : (
                <StyledText fontSize={14} color={Colors.primary} fontWeight="600">Select →</StyledText>
              )}
            </StyledPressable>
            <StyledDivider borderBottomColor={Colors.border} marginLeft={42} />
          </>
        )}

        {/* Category */}
        {txType !== 'transfer' && (
          <>
            <StyledPressable
              flexDirection="row" alignItems="center" gap={14}
              paddingVertical={14}
              onPress={() => setShowCategory(true)}
            >
              <StyledText fontSize={18} width={28} textAlign="center">🏷️</StyledText>
              <StyledText flex={1} fontSize={15} fontWeight="600" color={Colors.textSecondary}>Category</StyledText>
              {selectedCategory ? (
                <Stack horizontal alignItems="center" gap={8}>
                  <IconCircle iconKey={selectedCategory.icon} bg={selectedCategory.color} size={28} />
                  <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>{selectedCategory.name}</StyledText>
                </Stack>
              ) : (
                <StyledText fontSize={14} color={Colors.primary} fontWeight="600">Select →</StyledText>
              )}
            </StyledPressable>
            <StyledDivider borderBottomColor={Colors.border} marginLeft={42} />
          </>
        )}

        {/* Date — pressable row shows date, Popup wraps inline picker */}
        <StyledPressable
          flexDirection="row" alignItems="center" gap={14}
          paddingVertical={14}
          onPress={() => setShowDate(true)}
        >
          <CalendarIcon size={20} color={Colors.textSecondary} width={28} />
          <StyledText flex={1} fontSize={15} fontWeight="600" color={Colors.textSecondary}>Date</StyledText>
          <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>
            {format(date, 'MMM d, yyyy')}
          </StyledText>
        </StyledPressable>
        <StyledDivider borderBottomColor={Colors.border} marginLeft={42} />

        {/* Notes */}
        <Stack flexDirection="row" alignItems="flex-start" gap={14} paddingVertical={8}>
          <StyledText fontSize={18} width={28} textAlign="center" marginTop={8}>📝</StyledText>
          <StyledTextInput
            flex={1}
            placeholder="Add notes..."
            value={notes}
            onChangeText={setNotes}
            variant="ghost"
            multiline
            numberOfLines={2}
            placeholderTextColor={Colors.textMuted}
            fontSize={15}
            color={Colors.textPrimary}
          />
        </Stack>

      </Stack>

      {/* ── Date picker popup ──────────────────────────────────────────── */}
      <Popup
        visible={showDate}
        onClose={() => setShowDate(false)}
        title="Select date"
        showClose
        position="bottom"
        round
      >
        <Stack paddingHorizontal={16} paddingBottom={24}>
          <StyledDatePicker
            mode="date"
            variant="inline"
            value={date}
            onChange={setDate}
            showTodayButton
            colors={{
              selected:  accentColor,
              today:     accentColor,
              confirmBg: accentColor,
            }}
          />
          <StyledPressable
            paddingVertical={14}
            borderRadius={12}
            backgroundColor={accentColor}
            alignItems="center"
            marginTop={8}
            onPress={() => setShowDate(false)}
          >
            <StyledText fontSize={15} fontWeight="700" color={Colors.white}>
              Set date
            </StyledText>
          </StyledPressable>
        </Stack>
      </Popup>

      {/* ── Pickers ─────────────────────────────────────────────────────── */}
      <AccountPicker
        visible={showAccount}
        accounts={accounts}
        selected={accountId}
        onSelect={acc => setAccountId(acc.id)}
        onClose={() => setShowAccount(false)}
      />

      <AccountPicker
        visible={showToAccount}
        accounts={accounts.filter(a => a.id !== accountId)}
        selected={toAccountId}
        onSelect={acc => setToAccountId(acc.id)}
        onClose={() => setShowToAccount(false)}
      />

      <CategoryPicker
        visible={showCategory}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        selected={categoryId}
        transactionType={txType === 'transfer' ? 'expense' : txType}
        onSelect={cat => setCategoryId(cat.id)}
        onClose={() => setShowCategory(false)}
      />

    </Stack>
  )
}

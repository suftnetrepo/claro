import React, { useState, useCallback } from 'react'
import { Keyboard, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledTextInput,
  StyledDatePicker, Popup, StyledPage, StyledHeader,
} from 'fluent-styles'
import { toastService, loaderService } from 'fluent-styles'
import { format } from 'date-fns'
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon } from '../../icons'
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

// Use theme-aware colours for each type
function useTypeColor(txType: TxType) {
  const Colors = useColors()
  return txType === 'income' ? Colors.income : txType === 'transfer' ? Colors.transfer : Colors.expense
}
function useTypeLightColor(txType: TxType) {
  const Colors = useColors()
  return txType === 'income' ? Colors.incomeLight : txType === 'transfer' ? Colors.transferLight : Colors.expenseLight
}

// ─── Picker pill — consistent with Settings row style ────────────────────────
function PickerPill({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  const Colors = useColors()
  return (
    <StyledPressable onPress={onPress}
      alignItems="center"
      justifyContent="center"
      gap={10}
      paddingVertical={14}
      paddingHorizontal={20}
      borderRadius={18}
      backgroundColor={Colors.bgCard}
      style={{
        flexDirection: 'row',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
      }}>
      {children}
    </StyledPressable>
  )
}

function PickerRow({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  const Colors = useColors()
  return (
    <StyledPressable onPress={onPress}
      flex={1}
      alignItems="center"
      gap={10}
      paddingVertical={13}
      paddingHorizontal={14}
      borderRadius={16}
      backgroundColor={Colors.bgCard}
      style={{
        flexDirection: 'row',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
      }}>
      {children}
    </StyledPressable>
  )
}

export default function AddTransactionScreen() {
  const Colors = useColors()
  const { data: settingsData }  = useSettings()
  const { create: createTransaction } = useTransactions()
  const { data: accounts }      = useAccounts()
  const { data: expenseCats }   = useCategories('expense')
  const { data: incomeCats }    = useCategories('income')
  const { invalidateData }      = useRecordsStore()

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

  const accentColor = useTypeColor(txType)
  const accentLight = useTypeLightColor(txType)

  const selectedAccount   = accounts.find(a => a.id === accountId)
  const selectedToAccount = accounts.find(a => a.id === toAccountId)
  const allCats           = [...expenseCats, ...incomeCats]
  const selectedCategory  = allCats.find(c => c.id === categoryId)
  const isValid           = parseFloat(amount) > 0 && !!accountId

  const handleTypeChange = (type: TxType) => { setTxType(type); setCategoryId(null) }

  const handleSave = useCallback(async () => {
    const num = parseFloat(amount)
    if (!num || num <= 0)          { toastService.error('Invalid amount', 'Enter an amount greater than 0'); return }
    if (!accountId)                { toastService.error('No account', 'Please select an account'); return }
    if (txType === 'transfer' && !toAccountId) { toastService.error('No destination', 'Select a destination account'); return }
    Keyboard.dismiss()
    const loadId = loaderService.show({ label: 'Saving…', variant: 'spinner' })
    try {
      await createTransaction({
        type: txType, amount: num, date,
        notes: notes.trim() || null,
        accountId: accountId!,
        categoryId: categoryId ?? null,
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
    <StyledPage backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        {/* Header — seamless, no border, matches Settings */}
        <Stack
          horizontal
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal={20}
          paddingTop={16}
          paddingBottom={14}
          backgroundColor={Colors.bg}
        >
          <StyledPressable onPress={() => router.back()}
            width={38}
            height={38}
            borderRadius={19}
            backgroundColor={Colors.bgCard}
            alignItems="center"
            justifyContent="center"
            style={{
              shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 }, elevation: 2,
            }}>
            <ChevronLeftIcon size={18} color={Colors.textPrimary} strokeWidth={2.5} />
          </StyledPressable>
          <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.3}>
            Add Transaction
          </StyledText>
          <Stack width={38} />
        </Stack>
      </StyledHeader.Full>

      <Stack flex={1} backgroundColor={Colors.bg}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* ── Type selector — card bg active tab with coloured text + dot ──── */}
          <Stack paddingHorizontal={20} paddingTop={16} paddingBottom={8}>
            <Stack
              horizontal
              borderRadius={18}
              backgroundColor={Colors.bgCard}
              padding={5}
              gap={4}
              style={{
                shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 }, elevation: 2,
              }}
            >
              {TYPE_TABS.map(t => {
                const active = txType === t.value
                const tColor = t.value === 'income' ? Colors.income : t.value === 'transfer' ? Colors.transfer : Colors.expense
                return (
                  <StyledPressable key={t.value} onPress={() => handleTypeChange(t.value)}
                    flex={1}
                    paddingVertical={11}
                    borderRadius={14}
                    alignItems="center"
                    justifyContent="center"
                    gap={4}
                    backgroundColor={active ? Colors.bg : 'transparent'}
                    style={active ? {
                      shadowColor: tColor, shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12, shadowRadius: 6, elevation: 2,
                    } : {}}
                  >
                    <StyledText fontSize={14} fontWeight={active ? '800' : '500'}
                      color={active ? tColor : Colors.textMuted}>
                      {t.label}
                    </StyledText>
                    {/* Active indicator dot */}
                    {active && (
                      <Stack width={4} height={4} borderRadius={2} backgroundColor={tColor} />
                    )}
                  </StyledPressable>
                )
              })}
            </Stack>
          </Stack>

          {/* ── Amount + keypad ───────────────────────────────────────── */}
          <Stack paddingTop={4}>
            <StyledText fontSize={11} color={Colors.textMuted} fontWeight="700" letterSpacing={1.2}
              textAlign="center" paddingTop={8}>
              INPUT AMOUNT
            </StyledText>
            <Calculator value={amount} onChange={setAmount} symbol={symbol} accentColor={accentColor} />
          </Stack>

          {/* ── Account picker ────────────────────────────────────────── */}
          <Stack paddingHorizontal={20} marginBottom={12}>
            <PickerPill onPress={() => setShowAccount(true)}>
              {selectedAccount
                ? <IconCircle iconKey={selectedAccount.icon} bg={selectedAccount.color} size={24} type="account" />
                : <Stack width={24} height={24} borderRadius={12} backgroundColor={Colors.bgMuted} />}
              <StyledText fontSize={15} fontWeight="600" color={selectedAccount ? Colors.textPrimary : Colors.textMuted} style={{ flex: 1, textAlign: 'center' }}>
                {selectedAccount?.name ?? 'Select account'}
              </StyledText>
              <ChevronDownIcon size={16} color={Colors.textMuted} />
            </PickerPill>
          </Stack>

          {/* ── Transfer destination ──────────────────────────────────── */}
          {txType === 'transfer' && (
            <Stack paddingHorizontal={20} marginBottom={12}>
              <PickerPill onPress={() => setShowToAccount(true)}>
                {selectedToAccount
                  ? <IconCircle iconKey={selectedToAccount.icon} bg={selectedToAccount.color} size={24} type="account" />
                  : <Stack width={24} height={24} borderRadius={12} backgroundColor={Colors.bgMuted} />}
                <StyledText fontSize={15} fontWeight="600" color={selectedToAccount ? Colors.textPrimary : Colors.textMuted} style={{ flex: 1, textAlign: 'center' }}>
                  {selectedToAccount?.name ?? 'To account'}
                </StyledText>
                <ChevronDownIcon size={16} color={Colors.textMuted} />
              </PickerPill>
            </Stack>
          )}

          {/* ── Category + Date row ───────────────────────────────────── */}
          {txType !== 'transfer' && (
            <Stack horizontal paddingHorizontal={20} gap={10} marginBottom={12}>
              <PickerRow onPress={() => setShowCategory(true)}>
                {selectedCategory
                  ? <IconCircle iconKey={selectedCategory.icon} bg={selectedCategory.color} size={22} />
                  : <Stack width={22} height={22} borderRadius={11} backgroundColor={Colors.bgMuted} />}
                <StyledText flex={1} fontSize={13} fontWeight="600" color={selectedCategory ? Colors.textPrimary : Colors.textMuted} numberOfLines={1}>
                  {selectedCategory?.name ?? 'Category'}
                </StyledText>
                <ChevronDownIcon size={14} color={Colors.textMuted} />
              </PickerRow>

              <PickerRow onPress={() => setShowDate(true)}>
                <Stack width={28} height={28} borderRadius={8} backgroundColor={Colors.accent} alignItems="center" justifyContent="center">
                  <CalendarIcon size={15} color={Colors.primary} strokeWidth={2} />
                </Stack>
                <StyledText flex={1} fontSize={13} fontWeight="600" color={Colors.textPrimary} numberOfLines={1}>
                  {format(date, 'MMM d, yyyy')}
                </StyledText>
                <ChevronDownIcon size={14} color={Colors.textMuted} />
              </PickerRow>
            </Stack>
          )}

          {/* Transfer date */}
          {txType === 'transfer' && (
            <Stack paddingHorizontal={20} marginBottom={12}>
              <PickerPill onPress={() => setShowDate(true)}>
                <Stack width={28} height={28} borderRadius={8} backgroundColor={Colors.accent} alignItems="center" justifyContent="center">
                  <CalendarIcon size={15} color={Colors.primary} strokeWidth={2} />
                </Stack>
                <StyledText flex={1} fontSize={15} fontWeight="600" color={Colors.textPrimary} textAlign="center">
                  {format(date, 'MMM d, yyyy')}
                </StyledText>
                <ChevronDownIcon size={16} color={Colors.textMuted} />
              </PickerPill>
            </Stack>
          )}

          {/* ── Notes ────────────────────────────────────────────────── */}
          <Stack paddingHorizontal={20} marginBottom={24}>
            <Stack borderRadius={16} overflow="hidden" backgroundColor={Colors.bgCard} style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <StyledTextInput
                variant="filled"
                placeholder="Add a note…"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
                fontSize={14}
                borderRadius={16}
              />
            </Stack>
          </Stack>

          {/* ── Save button ───────────────────────────────────────────── */}
          <Stack paddingHorizontal={20}>
            <TouchableOpacity onPress={handleSave} disabled={!isValid} activeOpacity={0.82}
              style={{
                paddingVertical: 18, borderRadius: 18,
                backgroundColor: isValid ? accentColor : Colors.bgMuted,
                alignItems: 'center', justifyContent: 'center',
                ...(isValid ? { shadowColor: accentColor, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 7 } : {}),
              }}>
              <StyledText fontSize={16} fontWeight="800" color={isValid ? Colors.white : Colors.textMuted}>
                Save Transaction
              </StyledText>
            </TouchableOpacity>
          </Stack>

        </ScrollView>

        {/* ── Date popup ────────────────────────────────────────────── */}
        <Popup visible={showDate} onClose={() => setShowDate(false)} title="Select date" showClose position="bottom" round roundRadius={20}>
          <Stack paddingHorizontal={16} paddingBottom={24}>
            <StyledDatePicker mode="date" variant="inline" value={date} onChange={setDate} showTodayButton
              colors={{ selected: accentColor, today: accentColor, confirmBg: accentColor }} />
            <TouchableOpacity onPress={() => setShowDate(false)} activeOpacity={0.82}
              style={{ paddingVertical: 14, borderRadius: 14, backgroundColor: accentColor, alignItems: 'center', marginTop: 8 }}>
              <StyledText fontSize={15} fontWeight="700" color={Colors.white}>Confirm Date</StyledText>
            </TouchableOpacity>
          </Stack>
        </Popup>

        {/* ── Pickers ───────────────────────────────────────────────── */}
        <AccountPicker visible={showAccount} accounts={accounts} selected={accountId}
          onSelect={a => setAccountId(a.id)} onClose={() => setShowAccount(false)} />
        <AccountPicker visible={showToAccount} accounts={accounts.filter(a => a.id !== accountId)} selected={toAccountId}
          onSelect={a => setToAccountId(a.id)} onClose={() => setShowToAccount(false)} />
        <CategoryPicker visible={showCategory} expenseCategories={expenseCats} incomeCategories={incomeCats}
          selected={categoryId} transactionType={txType === 'transfer' ? 'expense' : txType}
          onSelect={c => setCategoryId(c.id)} onClose={() => setShowCategory(false)} />
      </Stack>
    </StyledPage>
  )
}
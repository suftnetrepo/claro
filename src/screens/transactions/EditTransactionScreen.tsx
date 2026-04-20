import React, { useState, useCallback, useEffect } from 'react'
import { Keyboard, View, TouchableOpacity, ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import {
  StyledText, StyledPressable, StyledTextInput,
  StyledDatePicker, Popup, StyledPage, StyledHeader,
} from 'fluent-styles'
import { format } from 'date-fns'
import { CalendarIcon, ChevronLeftIcon, CheckIcon } from '../../icons'
import { IconCircle } from '../../icons/map'
import { useColors } from '../../constants'
import { dialogueService, toastService, loaderService } from 'fluent-styles'
import {
  useTransactions, useAccounts, useCategories, useSettings,
} from '../../hooks'
import { useRecordsStore } from '../../stores'
import { transactionService } from '../../services/transactionService'
import { Calculator } from './Calculator'
import { AccountPicker } from './AccountPicker'
import { CategoryPicker } from './CategoryPicker'

type TxType = 'expense' | 'income' | 'transfer'

const TYPE_TABS = [
  { value: 'expense'  as TxType, label: 'Expense'  },
  { value: 'income'   as TxType, label: 'Income'   },
  { value: 'transfer' as TxType, label: 'Transfer' },
]

// ─── Detail row — label left, value/control right ────────────────────────────
function DetailRow({ icon, label, onPress, children, isLast = false }: {
  icon: React.ReactNode; label: string; onPress?: () => void
  children: React.ReactNode; isLast?: boolean
}) {
  const Colors = useColors()
  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <StyledText flex={1} fontSize={15} fontWeight="600" color={Colors.textPrimary}>{label}</StyledText>
      {children}
    </View>
  )
  return (
    <View>
      {onPress
        ? <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{inner}</TouchableOpacity>
        : inner}
      {!isLast && <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 66 }} />}
    </View>
  )
}

export default function EditTransactionScreen() {
  const Colors = useColors()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: settingsData } = useSettings()
  const { update } = useTransactions()
  const { data: accounts } = useAccounts()
  const { data: expenseCats } = useCategories('expense')
  const { data: incomeCats }  = useCategories('income')
  const { invalidateData } = useRecordsStore()
  const symbol = settingsData?.currencySymbol ?? '$'

  const [loaded,      setLoaded]      = useState(false)
  const [txType,      setTxType]      = useState<TxType>('expense')
  const [amount,      setAmount]      = useState('0')
  const [accountId,   setAccountId]   = useState<string | null>(null)
  const [toAccountId, setToAccountId] = useState<string | null>(null)
  const [categoryId,  setCategoryId]  = useState<string | null>(null)
  const [date,        setDate]        = useState<Date>(new Date())
  const [notes,       setNotes]       = useState('')
  const [showAccount,   setShowAccount]   = useState(false)
  const [showToAccount, setShowToAccount] = useState(false)
  const [showCategory,  setShowCategory]  = useState(false)
  const [showDate,      setShowDate]      = useState(false)

  useEffect(() => {
    if (!id) return
    transactionService.getById(id).then(tx => {
      if (!tx) { toastService.error('Not found', 'Transaction not found'); router.back(); return }
      setTxType(tx.type as TxType)
      setAmount(String(tx.amount))
      setAccountId(tx.accountId)
      setToAccountId(tx.toAccountId ?? null)
      setCategoryId(tx.categoryId ?? null)
      setDate(new Date(tx.date))
      setNotes(tx.notes ?? '')
      setLoaded(true)
    })
  }, [id])

  const accentColor = txType === 'income' ? Colors.income : txType === 'transfer' ? Colors.transfer : Colors.expense
  const selectedAccount   = accounts.find(a => a.id === accountId)
  const selectedToAccount = accounts.find(a => a.id === toAccountId)
  const allCats           = [...expenseCats, ...incomeCats]
  const selectedCategory  = allCats.find(c => c.id === categoryId)

  const handleSave = useCallback(async () => {
    const num = parseFloat(amount)
    if (!num || num <= 0)          { toastService.error('Invalid amount', 'Enter an amount greater than 0'); return }
    if (!accountId)                { toastService.error('No account', 'Please select an account'); return }
    if (txType === 'transfer' && !toAccountId) { toastService.error('No destination', 'Select a destination account'); return }
    Keyboard.dismiss()
    const loadId = loaderService.show({ label: 'Saving…', variant: 'spinner' })
    try {
      await update(id!, { type: txType, amount: num, date, notes: notes.trim() || null, accountId: accountId!, categoryId: categoryId ?? null, toAccountId: txType === 'transfer' ? (toAccountId ?? null) : null })
      invalidateData()
      toastService.success('Transaction updated')
      router.back()
    } catch (err: any) {
      toastService.error('Failed to save', err?.message)
    } finally {
      loaderService.hide(loadId)
    }
  }, [amount, accountId, toAccountId, txType, date, notes, categoryId, update, id, invalidateData])

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <StyledText color={Colors.textMuted}>Loading…</StyledText>
      </View>
    )
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        {/* Header — matches Add Transaction */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
          backgroundColor: Colors.bg,
        }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <ChevronLeftIcon size={18} color={Colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
          <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.3}>
            Edit Transaction
          </StyledText>
          {/* Save button top-right */}
          <TouchableOpacity onPress={handleSave} activeOpacity={0.82}
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: accentColor, alignItems: 'center', justifyContent: 'center',
              shadowColor: accentColor, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 }}>
            <CheckIcon size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </StyledHeader.Full>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Type badge — locked, read-only when editing ──────────── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, alignItems: 'center' }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            paddingVertical: 9, paddingHorizontal: 20, borderRadius: 30,
            backgroundColor: Colors.bgCard,
            shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 }, elevation: 2,
          }}>
            {/* Coloured dot */}
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accentColor }} />
            <StyledText fontSize={14} fontWeight="700" color={accentColor}>
              {txType.charAt(0).toUpperCase() + txType.slice(1)}
            </StyledText>
            {/* Lock icon hint */}
            <StyledText fontSize={12} color={Colors.textMuted} style={{ marginLeft: 2 }}>
              🔒
            </StyledText>
          </View>
        </View>

        {/* ── Amount + keypad — no background tint ─────────────────── */}
        <Calculator value={amount} onChange={setAmount} symbol={symbol} accentColor={accentColor} />

        {/* ── Details card ─────────────────────────────────────────── */}
        <View style={{
          marginHorizontal: 16, marginTop: 8, borderRadius: 20,
          backgroundColor: Colors.bgCard, overflow: 'hidden',
          shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 }, elevation: 2,
        }}>
          {/* Account */}
          <DetailRow
            icon={<StyledText fontSize={16}>💳</StyledText>}
            label="Account"
            onPress={() => setShowAccount(true)}>
            {selectedAccount ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconCircle iconKey={selectedAccount.icon} bg={selectedAccount.color} size={28} type="account" />
                <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>{selectedAccount.name}</StyledText>
              </View>
            ) : (
              <StyledText fontSize={14} color={Colors.primary} fontWeight="600">Select →</StyledText>
            )}
          </DetailRow>

          {/* To Account (transfer only) */}
          {txType === 'transfer' && (
            <DetailRow icon={<StyledText fontSize={16}>🔄</StyledText>} label="To Account" onPress={() => setShowToAccount(true)}>
              {selectedToAccount ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <IconCircle iconKey={selectedToAccount.icon} bg={selectedToAccount.color} size={28} type="account" />
                  <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>{selectedToAccount.name}</StyledText>
                </View>
              ) : (
                <StyledText fontSize={14} color={Colors.primary} fontWeight="600">Select →</StyledText>
              )}
            </DetailRow>
          )}

          {/* Category */}
          {txType !== 'transfer' && (
            <DetailRow icon={<StyledText fontSize={16}>🏷️</StyledText>} label="Category" onPress={() => setShowCategory(true)}>
              {selectedCategory ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <IconCircle iconKey={selectedCategory.icon} bg={selectedCategory.color} size={28} />
                  <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>{selectedCategory.name}</StyledText>
                </View>
              ) : (
                <StyledText fontSize={14} color={Colors.primary} fontWeight="600">Select →</StyledText>
              )}
            </DetailRow>
          )}

          {/* Date */}
          <DetailRow icon={<CalendarIcon size={18} color={Colors.primary} strokeWidth={2} />} label="Date" onPress={() => setShowDate(true)}>
            <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>{format(date, 'MMM d, yyyy')}</StyledText>
          </DetailRow>

          {/* Notes */}
          <DetailRow icon={<StyledText fontSize={16}>📝</StyledText>} label="Note" isLast>
            <StyledTextInput
              placeholder="Add notes…"
              value={notes}
              onChangeText={setNotes}
              variant="ghost"
              multiline
              numberOfLines={1}
              placeholderTextColor={Colors.textMuted}
              fontSize={14}
              color={Colors.textPrimary}
              textAlign="right"
              backgroundColor="transparent"
              style={{ flex: 1, backgroundColor: 'transparent' }}
            />
          </DetailRow>
        </View>

      </ScrollView>

      {/* Date popup */}
      <Popup visible={showDate} onClose={() => setShowDate(false)} title="Select date" showClose position="bottom" round roundRadius={20}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <StyledDatePicker mode="date" variant="inline" value={date} onChange={setDate} showTodayButton
            colors={{ selected: accentColor, today: accentColor, confirmBg: accentColor }} />
          <TouchableOpacity onPress={() => setShowDate(false)} activeOpacity={0.82}
            style={{ paddingVertical: 14, borderRadius: 14, backgroundColor: accentColor, alignItems: 'center', marginTop: 8 }}>
            <StyledText fontSize={15} fontWeight="700" color={Colors.white}>Confirm Date</StyledText>
          </TouchableOpacity>
        </View>
      </Popup>

      <AccountPicker visible={showAccount} accounts={accounts} selected={accountId}
        onSelect={a => setAccountId(a.id)} onClose={() => setShowAccount(false)} />
      <AccountPicker visible={showToAccount} accounts={accounts.filter(a => a.id !== accountId)} selected={toAccountId}
        onSelect={a => setToAccountId(a.id)} onClose={() => setShowToAccount(false)} />
      <CategoryPicker visible={showCategory} expenseCategories={expenseCats} incomeCategories={incomeCats}
        selected={categoryId} transactionType={txType === 'transfer' ? 'expense' : txType}
        onSelect={c => setCategoryId(c.id)} onClose={() => setShowCategory(false)} />
    </StyledPage>
  )
}
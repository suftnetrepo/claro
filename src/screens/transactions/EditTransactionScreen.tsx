import React, { useState, useCallback, useEffect } from 'react'
import { Keyboard } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledTextInput, StyledScrollView,
  StyledDatePicker, Popup, StyledPage, StyledHeader, StyledCard,
} from 'fluent-styles'
import { format } from 'date-fns'
import { CalendarIcon, ChevronLeftIcon, CheckIcon } from '../../icons'
import { IconCircle } from '../../icons/map'
import { useColors } from '../../constants'
import {  toastService, loaderService } from 'fluent-styles'
import { useTransactions, useAccounts, useCategories, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { transactionService } from '../../services/transactionService'
import { Calculator } from './Calculator'
import { AccountPicker } from './AccountPicker'
import { CategoryPicker } from './CategoryPicker'
import { Text } from '@/components'

type TxType = 'expense' | 'income' | 'transfer'

function DetailRow({ icon, label, onPress, children, isLast = false }: {
  icon: React.ReactNode; label: string; onPress?: () => void
  children: React.ReactNode; isLast?: boolean
}) {
  const Colors = useColors()
  const inner = (
    <Stack flexDirection="row" alignItems="center" gap={14} paddingHorizontal={16} paddingVertical={14}>
      <Stack width={36} height={36} borderRadius={10} backgroundColor={Colors.accent} alignItems="center" justifyContent="center">
        {icon}
      </Stack>
      <Text flex={1} fontSize={15} fontWeight="600" color={Colors.textPrimary}>{label}</Text>
      {children}
    </Stack>
  )
  return (
    <Stack>
      {onPress
        ? <StyledPressable onPress={onPress}>{inner}</StyledPressable>
        : inner}
      {!isLast && <Stack height={1} backgroundColor={Colors.border} marginLeft={66} opacity={0.6} />}
    </Stack>
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
      setTxType(tx.type as TxType); setAmount(String(tx.amount)); setAccountId(tx.accountId)
      setToAccountId(tx.toAccountId ?? null); setCategoryId(tx.categoryId ?? null)
      setDate(new Date(tx.date)); setNotes(tx.notes ?? ''); setLoaded(true)
    })
  }, [id])

  const accentColor = txType === 'income' ? Colors.income : txType === 'transfer' ? Colors.transfer : Colors.expense
  const selectedAccount   = accounts.find(a => a.id === accountId)
  const selectedToAccount = accounts.find(a => a.id === toAccountId)
  const allCats           = [...expenseCats, ...incomeCats]
  const selectedCategory  = allCats.find(c => c.id === categoryId)

  const handleSave = useCallback(async () => {
    const num = parseFloat(amount)
    if (!num || num <= 0) { toastService.error('Invalid amount', 'Enter an amount greater than 0'); return }
    if (!accountId) { toastService.error('No account', 'Please select an account'); return }
    if (txType === 'transfer' && !toAccountId) { toastService.error('No destination', 'Select a destination account'); return }
    Keyboard.dismiss()
    const loadId = loaderService.show({ label: 'Saving…', variant: 'spinner' })
    try {
      await update(id!, { type: txType, amount: num, date, notes: notes.trim() || null, accountId: accountId!, categoryId: categoryId ?? null, toAccountId: txType === 'transfer' ? (toAccountId ?? null) : null })
      invalidateData(); toastService.success('Transaction updated'); router.back()
    } catch (err: any) { toastService.error('Failed to save', err?.message) }
    finally { loaderService.hide(loadId) }
  }, [amount, accountId, toAccountId, txType, date, notes, categoryId, update, id, invalidateData])

  if (!loaded) {
    return (
      <Stack flex={1} backgroundColor={Colors.bg} alignItems="center" justifyContent="center">
        <Text color={Colors.textMuted}>Loading…</Text>
      </Stack>
    )
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        <Stack backgroundColor={Colors.bg} paddingHorizontal={20}  >
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <StyledPressable width={38} height={38} borderRadius={19} backgroundColor={Colors.bgCard}
              alignItems="center" justifyContent="center" onPress={() => router.back()}
              style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <ChevronLeftIcon size={18} color={Colors.textPrimary} strokeWidth={2.5} />
            </StyledPressable>
            <Text variant='title' fontWeight="700" color={Colors.textPrimary} letterSpacing={-0.3}>Edit Transaction</Text>
            <StyledPressable width={38} height={38} borderRadius={19} backgroundColor={accentColor}
              alignItems="center" justifyContent="center" onPress={handleSave}
              style={{ shadowColor: accentColor, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 }}>
              <CheckIcon size={18} color="#fff" strokeWidth={2.5} />
            </StyledPressable>
          </Stack>
        </Stack>
      </StyledHeader.Full>

      <StyledScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, marginTop:8 }}>

        {/* Type badge — locked */}
        <Stack paddingHorizontal={20} paddingBottom={12} alignItems="center" >
          <StyledCard borderRadius={30} paddingHorizontal={20} paddingVertical={8}
            backgroundColor={Colors.bgCard}
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <Stack horizontal alignItems="center" gap={8}>
              <Stack width={8} height={8} borderRadius={4} backgroundColor={accentColor} />
              <Text variant='caption' fontSize={14} fontWeight="700" color={accentColor}>
                {txType.charAt(0).toUpperCase() + txType.slice(1)}
              </Text>
              <Text fontSize={12} color={Colors.textMuted} marginLeft={2}>🔒</Text>
            </Stack>
          </StyledCard>
        </Stack>

        {/* Calculator */}
        <Calculator value={amount} onChange={setAmount} symbol={symbol} accentColor={accentColor} />

        {/* Details card */}
        <StyledCard marginHorizontal={16} marginTop={8} borderRadius={20} backgroundColor={Colors.bgCard} overflow="hidden"
          style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>

          <DetailRow icon={<StyledText fontSize={16}>💳</StyledText>} label="Account" onPress={() => setShowAccount(true)}>
            {selectedAccount ? (
              <Stack horizontal alignItems="center" gap={8}>
                <IconCircle iconKey={selectedAccount.icon} bg={selectedAccount.color} size={28} type="account" />
                <Text fontSize={14} fontWeight="700" color={Colors.textPrimary}>{selectedAccount.name}</Text>
              </Stack>
            ) : <Text fontSize={14} color={Colors.primary} fontWeight="600">Select →</Text>}
          </DetailRow>

          {txType === 'transfer' && (
            <DetailRow icon={<Text fontSize={16}>🔄</Text>} label="To Account" onPress={() => setShowToAccount(true)}>
              {selectedToAccount ? (
                <Stack horizontal alignItems="center" gap={8}>
                  <IconCircle iconKey={selectedToAccount.icon} bg={selectedToAccount.color} size={28} type="account" />
                  <Text fontSize={14} fontWeight="700" color={Colors.textPrimary}>{selectedToAccount.name}</Text>
                </Stack>
              ) : <Text fontSize={14} color={Colors.primary} fontWeight="600">Select →</Text>}
            </DetailRow>
          )}

          {txType !== 'transfer' && (
            <DetailRow icon={<Text fontSize={16}>🏷️</Text>} label="Category" onPress={() => setShowCategory(true)}>
              {selectedCategory ? (
                <Stack horizontal alignItems="center" gap={8}>
                  <IconCircle iconKey={selectedCategory.icon} bg={selectedCategory.color} size={28} />
                  <Text fontSize={14} fontWeight="700" color={Colors.textPrimary}>{selectedCategory.name}</Text>
                </Stack>
              ) : <Text fontSize={14} color={Colors.primary} fontWeight="600">Select →</Text>}
            </DetailRow>
          )}

          <DetailRow icon={<CalendarIcon size={18} color={Colors.primary} strokeWidth={2} />} label="Date" onPress={() => setShowDate(true)}>
            <Text fontSize={14} fontWeight="700" color={Colors.textPrimary}>{format(date, 'MMM d, yyyy')}</Text>
          </DetailRow>

          <DetailRow icon={<Text fontSize={16}>📝</Text>} label="Note" isLast>
            <StyledTextInput placeholder="Add notes…" value={notes} onChangeText={setNotes}
              variant="ghost" multiline numberOfLines={1}
              placeholderTextColor={Colors.textMuted} fontSize={14} color={Colors.textPrimary}
              textAlign="right" backgroundColor="transparent" style={{ flex: 1, backgroundColor: 'transparent' }} />
          </DetailRow>
        </StyledCard>

      </StyledScrollView>

      <Popup visible={showDate} onClose={() => setShowDate(false)} title="Select date" showClose position="bottom" round roundRadius={20}>
        <Stack paddingHorizontal={16} paddingBottom={24}>
          <StyledDatePicker mode="date" variant="inline" value={date} onChange={setDate} showTodayButton
            colors={{ selected: accentColor, today: accentColor, confirmBg: accentColor }} />
          <StyledPressable paddingVertical={14} borderRadius={14} backgroundColor={accentColor} alignItems="center" marginTop={8} onPress={() => setShowDate(false)}>
            <Text fontSize={15} fontWeight="700" color={Colors.white}>Confirm Date</Text>
          </StyledPressable>
        </Stack>
      </Popup>

      <AccountPicker visible={showAccount} accounts={accounts} selected={accountId} onSelect={a => setAccountId(a.id)} onClose={() => setShowAccount(false)} />
      <AccountPicker visible={showToAccount} accounts={accounts.filter(a => a.id !== accountId)} selected={toAccountId} onSelect={a => setToAccountId(a.id)} onClose={() => setShowToAccount(false)} />
      <CategoryPicker visible={showCategory} expenseCategories={expenseCats} incomeCategories={incomeCats} selected={categoryId} transactionType={txType === 'transfer' ? 'expense' : txType} onSelect={c => setCategoryId(c.id)} onClose={() => setShowCategory(false)} />
    </StyledPage>
  )
}
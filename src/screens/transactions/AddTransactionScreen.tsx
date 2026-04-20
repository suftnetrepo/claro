import React, { useState, useCallback } from 'react'
import { Keyboard } from 'react-native'
import { router } from 'expo-router'
import {
  Stack, StyledPressable, StyledTextInput,
  StyledScrollView, StyledCard, StyledPage, StyledHeader,
} from 'fluent-styles'
import { toastService, loaderService } from 'fluent-styles'
import { format } from 'date-fns'
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, CheckIcon } from '../../icons'
import { IconCircle } from '../../icons/map'
import { useColors } from '../../constants'
import { useTransactions, useAccounts, useCategories, useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { Text } from '../../components'
import { Calculator } from './Calculator'
import { AccountPicker } from './AccountPicker'
import { CategoryPicker } from './CategoryPicker'
import { StyledDatePicker, Popup } from 'fluent-styles'

type TxType = 'expense' | 'income' | 'transfer'

const TYPE_TABS = [
  { value: 'expense'  as TxType, label: 'Expense'  },
  { value: 'income'   as TxType, label: 'Income'   },
  { value: 'transfer' as TxType, label: 'Transfer' },
]

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

  const accentColor = txType === 'income' ? Colors.income : txType === 'transfer' ? Colors.transfer : Colors.expense
  const selectedAccount   = accounts.find(a => a.id === accountId)
  const selectedToAccount = accounts.find(a => a.id === toAccountId)
  const allCats           = [...expenseCats, ...incomeCats]
  const selectedCategory  = allCats.find(c => c.id === categoryId)
  const isValid           = parseFloat(amount) > 0 && !!accountId

  const handleTypeChange = (type: TxType) => { setTxType(type); setCategoryId(null) }

  const handleSave = useCallback(async () => {
    const num = parseFloat(amount)
    if (!num || num <= 0) { toastService.error('Invalid amount', 'Enter an amount greater than 0'); return }
    if (!accountId) { toastService.error('No account', 'Please select an account'); return }
    if (txType === 'transfer' && !toAccountId) { toastService.error('No destination', 'Select a destination account'); return }
    Keyboard.dismiss()
    const loadId = loaderService.show({ label: 'Saving…', variant: 'spinner' })
    try {
      await createTransaction({ type: txType, amount: num, date, notes: notes.trim() || null, accountId: accountId!, categoryId: categoryId ?? null, toAccountId: txType === 'transfer' ? (toAccountId ?? null) : null })
      invalidateData(); toastService.success('Transaction saved'); router.back()
    } catch (err: any) { toastService.error('Failed to save', err?.message) }
    finally { loaderService.hide(loadId) }
  }, [amount, accountId, toAccountId, txType, date, notes, categoryId, createTransaction, invalidateData])

  return (
    <StyledPage backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        <Stack backgroundColor={Colors.bg} paddingHorizontal={20} >
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <StyledPressable width={38} height={38} borderRadius={19} backgroundColor={Colors.bgCard}
              alignItems="center" justifyContent="center" onPress={() => router.back()}
              style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <ChevronLeftIcon size={18} color={Colors.textPrimary} strokeWidth={2.5} />
            </StyledPressable>
            <Text variant='title' fontWeight="700" color={Colors.textPrimary} letterSpacing={-0.3}>Add Transaction</Text>
            <Stack width={38} />
          </Stack>
        </Stack>
      </StyledHeader.Full>

      <Stack flex={1} backgroundColor={Colors.bg}>
        <StyledScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Type selector */}
          <Stack paddingHorizontal={20} paddingTop={16} paddingBottom={8}>
            <StyledCard borderRadius={32} backgroundColor={Colors.bgCard} padding={5}
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <Stack horizontal gap={4}>
                {TYPE_TABS.map(t => {
                  const active = txType === t.value
                  const tColor = t.value === 'income' ? Colors.income : t.value === 'transfer' ? Colors.transfer : Colors.expense
                  return (
                    <StyledPressable key={t.value} flex={1} paddingVertical={11} borderRadius={32}
                      alignItems="center" justifyContent="center" gap={4}
                      backgroundColor={active ? Colors.bg : 'transparent'}
                      onPress={() => handleTypeChange(t.value)}
                      style={active ? { shadowColor: tColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 2 } : {}}>
                      <Text fontSize={14} fontWeight={active ? '800' : '500'} color={active ? tColor : Colors.textMuted}>{t.label}</Text>
                      {/* {active && <Stack width={4} height={4} borderRadius={2} backgroundColor={tColor} />} */}
                    </StyledPressable>
                  )
                })}
              </Stack>
            </StyledCard>
          </Stack>

          {/* Amount */}
          <Stack paddingTop={4}>
            <Text variant="caption" color={Colors.textMuted} letterSpacing={1.2} textAlign="center" paddingTop={8}>INPUT AMOUNT</Text>
            <Calculator value={amount} onChange={setAmount} symbol={symbol} accentColor={accentColor} />
          </Stack>

          {/* Account */}
          <Stack paddingHorizontal={20} marginBottom={12}>
            <StyledPressable flexDirection="row" alignItems="center" justifyContent="center" gap={10}
              paddingVertical={14} paddingHorizontal={20} borderRadius={18}
              backgroundColor={Colors.bgCard} onPress={() => setShowAccount(true)}
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              {selectedAccount ? <IconCircle iconKey={selectedAccount.icon} bg={selectedAccount.color} size={24} type="account" /> : <Stack width={24} height={24} borderRadius={12} backgroundColor={Colors.bgMuted} />}
              <Text fontSize={15} fontWeight="600" flex={1} textAlign="center" color={selectedAccount ? Colors.textPrimary : Colors.textMuted}>{selectedAccount?.name ?? 'Select account'}</Text>
              <ChevronDownIcon size={16} color={Colors.textMuted} />
            </StyledPressable>
          </Stack>

          {/* Transfer destination */}
          {txType === 'transfer' && (
            <Stack paddingHorizontal={20} marginBottom={12}>
              <StyledPressable flexDirection="row" alignItems="center" justifyContent="center" gap={10}
                paddingVertical={14} paddingHorizontal={20} borderRadius={18}
                backgroundColor={Colors.bgCard} onPress={() => setShowToAccount(true)}
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                {selectedToAccount ? <IconCircle iconKey={selectedToAccount.icon} bg={selectedToAccount.color} size={24} type="account" /> : <Stack width={24} height={24} borderRadius={12} backgroundColor={Colors.bgMuted} />}
                <Text fontSize={15} fontWeight="600" flex={1} textAlign="center" color={selectedToAccount ? Colors.textPrimary : Colors.textMuted}>{selectedToAccount?.name ?? 'To account'}</Text>
                <ChevronDownIcon size={16} color={Colors.textMuted} />
              </StyledPressable>
            </Stack>
          )}

          {/* Category + Date */}
          {txType !== 'transfer' && (
            <Stack horizontal paddingHorizontal={20} gap={10} marginBottom={12}>
              <StyledPressable flex={1} flexDirection="row" alignItems="center" gap={10}
                paddingVertical={13} paddingHorizontal={14} borderRadius={16}
                backgroundColor={Colors.bgCard} onPress={() => setShowCategory(true)}
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                {selectedCategory ? <IconCircle iconKey={selectedCategory.icon} bg={selectedCategory.color} size={22} /> : <Stack width={22} height={22} borderRadius={11} backgroundColor={Colors.bgMuted} />}
                <Text flex={1} fontSize={13} fontWeight="600" numberOfLines={1} color={selectedCategory ? Colors.textPrimary : Colors.textMuted}>{selectedCategory?.name ?? 'Category'}</Text>
                <ChevronDownIcon size={14} color={Colors.textMuted} />
              </StyledPressable>

              <StyledPressable flex={1} flexDirection="row" alignItems="center" gap={10}
                paddingVertical={13} paddingHorizontal={14} borderRadius={16}
                backgroundColor={Colors.bgCard} onPress={() => setShowDate(true)}
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                <Stack width={28} height={28} borderRadius={8} backgroundColor={Colors.accent} alignItems="center" justifyContent="center">
                  <CalendarIcon size={15} color={Colors.primary} strokeWidth={2} />
                </Stack>
                <Text flex={1} fontSize={13} fontWeight="600" numberOfLines={1} color={Colors.textPrimary}>{format(date, 'MMM d, yyyy')}</Text>
                <ChevronDownIcon size={14} color={Colors.textMuted} />
              </StyledPressable>
            </Stack>
          )}

          {/* Transfer date */}
          {txType === 'transfer' && (
            <Stack paddingHorizontal={20} marginBottom={12}>
              <StyledPressable flexDirection="row" alignItems="center" justifyContent="center" gap={10}
                paddingVertical={14} paddingHorizontal={20} borderRadius={18}
                backgroundColor={Colors.bgCard} onPress={() => setShowDate(true)}
                style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                <Stack width={28} height={28} borderRadius={8} backgroundColor={Colors.accent} alignItems="center" justifyContent="center">
                  <CalendarIcon size={15} color={Colors.primary} strokeWidth={2} />
                </Stack>
                <Text flex={1} fontSize={15} fontWeight="600" textAlign="center" color={Colors.textPrimary}>{format(date, 'MMM d, yyyy')}</Text>
                <ChevronDownIcon size={16} color={Colors.textMuted} />
              </StyledPressable>
            </Stack>
          )}

          {/* Notes */}
          <Stack paddingHorizontal={20} marginBottom={24}>
            <StyledCard borderRadius={16} overflow="hidden" backgroundColor={Colors.bgCard}
              style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <StyledTextInput variant="filled" placeholder="Add a note…" value={notes} onChangeText={setNotes}
                multiline numberOfLines={2} fontSize={14} borderRadius={16} />
            </StyledCard>
          </Stack>

          {/* Save */}
          <Stack paddingHorizontal={20}>
            <StyledPressable paddingVertical={18} borderRadius={18} alignItems="center" justifyContent="center"
              backgroundColor={isValid ? accentColor : Colors.bgMuted}
              onPress={handleSave} disabled={!isValid}
              style={isValid ? { shadowColor: accentColor, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 7 } : {}}>
              <Text fontSize={16} fontWeight="800" color={isValid ? Colors.white : Colors.textMuted}>Save Transaction</Text>
            </StyledPressable>
          </Stack>
        </StyledScrollView>

        <Popup visible={showDate} onClose={() => setShowDate(false)} title="Select date" showClose position="bottom" round roundRadius={20}>
          <Stack paddingHorizontal={16} paddingBottom={24}>
            <StyledDatePicker mode="date" variant="inline" value={date} onChange={setDate} showTodayButton
              colors={{ selected: accentColor, today: accentColor, confirmBg: accentColor }} />
            <StyledPressable paddingVertical={14} borderRadius={14} backgroundColor={accentColor} alignItems="center" marginTop={8} onPress={() => setShowDate(false)}>
              <Text variant="button" color={Colors.white}>Confirm Date</Text>
            </StyledPressable>
          </Stack>
        </Popup>

        <AccountPicker visible={showAccount} accounts={accounts} selected={accountId} onSelect={a => setAccountId(a.id)} onClose={() => setShowAccount(false)} />
        <AccountPicker visible={showToAccount} accounts={accounts.filter(a => a.id !== accountId)} selected={toAccountId} onSelect={a => setToAccountId(a.id)} onClose={() => setShowToAccount(false)} />
        <CategoryPicker visible={showCategory} expenseCategories={expenseCats} incomeCategories={incomeCats} selected={categoryId} transactionType={txType === 'transfer' ? 'expense' : txType} onSelect={c => setCategoryId(c.id)} onClose={() => setShowCategory(false)} />
      </Stack>
    </StyledPage>
  )
}
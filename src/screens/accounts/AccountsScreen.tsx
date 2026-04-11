import React from 'react'
import { router } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledScrollView, StyledCard,
  StyledSkeleton, StyledEmptyState, StyledDivider,
} from 'fluent-styles'
import { dialogueService, toastService } from 'fluent-styles'
import { IconCircle } from '../../icons/map'
import { AddIcon, ChevronLeftIcon, MoreIcon } from '../../icons'
import { Colors, useColors } from '../../constants'
import { useAccounts, useSettings } from '../../hooks'
import { formatCurrency } from '../../utils'

export default function AccountsScreen() {
  const Colors = useColors()
  const { data: settingsData } = useSettings()
  const symbol = settingsData?.currencySymbol ?? '$'
  const { data: accs, loading, remove, totalBalance } = useAccounts()

  const handleDelete = async (id: string, name: string) => {
    const ok = await dialogueService.confirm({
      title:        `Delete "${name}"?`,
      message:      'All transactions for this account will also be deleted.',
      icon:         '🗑️',
      confirmLabel: 'Delete',
      destructive:  true,
    })
    if (ok) {
      await remove(id)
      toastService.success('Account deleted')
    }
  }

  return (
    <Stack flex={1} backgroundColor={Colors.bg}>
      <Stack horizontal alignItems="center" gap={12} paddingHorizontal={16} paddingTop={8} paddingBottom={16}>
        <StyledPressable
          width={36} height={36} borderRadius={18}
          backgroundColor={Colors.bgMuted}
          alignItems="center" justifyContent="center"
          onPress={() => router.back()}
        >
          <ChevronLeftIcon size={20} color={Colors.textPrimary} strokeWidth={2.2} />
        </StyledPressable>
        <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>Accounts</StyledText>
      </Stack>

      <Stack alignItems="center" paddingBottom={20}>
        <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={1}>ALL ACCOUNTS</StyledText>
        <StyledText fontSize={32} fontWeight="800" color={Colors.primary} marginTop={6} letterSpacing={-1}>
          {formatCurrency(totalBalance, symbol)}
        </StyledText>
      </Stack>

      {loading ? (
        <Stack padding={16}><StyledSkeleton template="list-item" repeat={3} animation="shimmer" /></Stack>
      ) : (
        <StyledScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <StyledText fontSize={15} fontWeight="800" color={Colors.textPrimary} marginHorizontal={16} marginBottom={10}>
            Accounts
          </StyledText>

          <StyledCard marginHorizontal={16} borderRadius={16} backgroundColor={Colors.bgCard} borderWidth={1} borderColor={Colors.border} overflow="hidden">
            {accs.map((acc, i) => (
              <Stack key={acc.id}>
                <StyledPressable
                  flexDirection="row" alignItems="center"
                  paddingHorizontal={16} paddingVertical={14}
                  onPress={() => router.push({
                    pathname: '/add-account' as any,
                    params: { id: acc.id, name: acc.name, icon: acc.icon, color: acc.color, balance: String(acc.balance) },
                  })}
                >
                  <IconCircle iconKey={acc.icon} bg={acc.color} size={48} type="account" />
                  <Stack flex={1} gap={3} marginLeft={14}>
                    <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>{acc.name}</StyledText>
                    <StyledText fontSize={13} color={Colors.textMuted}>{formatCurrency(acc.balance, symbol)}</StyledText>
                  </Stack>
                  {/* Delete button directly on the row — no nested dialogue */}
                  <StyledPressable
                    width={36} height={36} borderRadius={18}
                    backgroundColor={Colors.expenseLight}
                    alignItems="center" justifyContent="center"
                    onPress={() => handleDelete(acc.id, acc.name)}
                  >
                    <StyledText fontSize={14}>🗑️</StyledText>
                  </StyledPressable>
                </StyledPressable>
                {i < accs.length - 1 && <StyledDivider borderBottomColor={Colors.border} marginLeft={78} />}
              </Stack>
            ))}
          </StyledCard>

          {accs.length === 0 && <StyledEmptyState variant="minimal" illustration="💳" title="No accounts yet" animated />}

          <StyledPressable
            flexDirection="row" alignItems="center" justifyContent="center" gap={10}
            marginHorizontal={20} marginTop={16} paddingVertical={16}
            borderRadius={12} borderWidth={1} borderColor={Colors.primary}
            onPress={() => router.push('/add-account' as any)}
          >
            <AddIcon size={18} color={Colors.primary} strokeWidth={2.5} />
            <StyledText fontSize={14} fontWeight="700" color={Colors.primary}>ADD NEW ACCOUNT</StyledText>
          </StyledPressable>
        </StyledScrollView>
      )}
    </Stack>
  )
}

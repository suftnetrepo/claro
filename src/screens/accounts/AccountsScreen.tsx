import React from 'react'
import { router } from 'expo-router'
import {
  Stack, StyledPressable, StyledScrollView, StyledCard,
  StyledSkeleton, StyledEmptyState, StyledDivider, StyledPage, StyledHeader,
} from 'fluent-styles'
import { dialogueService, toastService } from 'fluent-styles'
import { IconCircle } from '../../icons/map'
import { AddIcon, ChevronLeftIcon, DeleteIcon } from '../../icons'
import { Text, RowDivider } from '../../components'
import { useColors } from '../../constants'
import { usePremium } from '../../hooks/usePremium'
import { PremiumBanner } from '../premium/PremiumGate'
import { useAccounts, useSettings } from '../../hooks'
import { formatCurrency } from '../../utils'


export default function AccountsScreen() {
  const Colors  = useColors()
  const premium = usePremium()
  const { data: settingsData } = useSettings()
  const symbol = settingsData?.currencySymbol ?? '$'
  const { data: accs, loading, remove, totalBalance } = useAccounts()

  const handleDelete = async (id: string, name: string) => {
    const ok = await dialogueService.confirm({
      title: `Delete "${name}"?`,
      message: 'All transactions for this account will also be deleted.',
      icon: '🗑️', confirmLabel: 'Delete', destructive: true,
    })
    if (ok) { await remove(id); toastService.success('Account deleted') }
  }

  return (
    <StyledPage backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        {/* Header */}
        <Stack backgroundColor={Colors.bg} paddingHorizontal={20} paddingBottom={14}>
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <StyledPressable width={38} height={38} borderRadius={19}
              backgroundColor={Colors.bgCard} alignItems="center" justifyContent="center"
              onPress={() => router.navigate("/(tabs)/settings")}
              style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <ChevronLeftIcon size={18} color={Colors.textPrimary} strokeWidth={2.5} />
            </StyledPressable>
            <Text variant='title' fontSize={17} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.3}>
              Accounts
            </Text>
            <Stack width={38} />
          </Stack>
        </Stack>
      </StyledHeader.Full>

      {loading ? (
        <Stack padding={16}><StyledSkeleton template="list-item" repeat={3} animation="shimmer" /></Stack>
      ) : (
        <StyledScrollView contentContainerStyle={{ paddingBottom: 120 }}>

          {/* Total balance hero card */}
          <StyledCard
            marginHorizontal={16} marginTop={8} marginBottom={16}
            borderRadius={22} padding={24} shadow="medium"
            backgroundColor={Colors.primary}>
            <Text variant='label' fontSize={13} fontWeight="600" color="rgba(255,255,255,0.7)" letterSpacing={0.3}>
              Total Balance
            </Text>
            <Text variant='amount' fontSize={38} fontWeight="800" color="#fff" letterSpacing={-1.5} marginTop={6}>
              {formatCurrency(totalBalance, symbol)}
            </Text>
            <Text variant='label' fontSize={12} color="rgba(255,255,255,0.6)" marginTop={6}>
              Across {accs.length} account{accs.length !== 1 ? 's' : ''}
            </Text>
          </StyledCard>

          {/* Account list */}
          {accs.length > 0 && (
            <Stack marginHorizontal={16} marginBottom={16} gap={0}>
              <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={10}>
                <Text fontSize={15} fontWeight="800" color={Colors.textPrimary}>My Accounts</Text>
                <Text fontSize={12} color={Colors.textMuted}>{accs.length} total</Text>
              </Stack>
              <StyledCard borderRadius={18} backgroundColor={Colors.bgCard} shadow="light" overflow="hidden">
                {accs.map((acc, i) => (
                  <Stack key={acc.id}>
                    <StyledPressable
                      flexDirection="row" alignItems="center"
                      paddingHorizontal={16} paddingVertical={14}
                      backgroundColor={Colors.bgCard}
                      onPress={() => router.push({
                        pathname: '/add-account' as any,
                        params: { id: acc.id, name: acc.name, icon: acc.icon, color: acc.color, balance: String(acc.balance) },
                      })}
                    >
                      <IconCircle iconKey={acc.icon} bg={acc.color} size={46} type="account" />
                      <Stack flex={1} gap={3} marginLeft={14}>
                        <Text fontSize={15} fontWeight="700" color={Colors.textPrimary}>{acc.name}</Text>
                        <Text fontSize={13} fontWeight="600"
                          color={acc.balance >= 0 ? Colors.income : Colors.expense}>
                          {acc.balance >= 0 ? '+' : ''}{formatCurrency(acc.balance, symbol)}
                        </Text>
                      </Stack>
                      {/* Delete button */}
                      <StyledPressable
                        width={34} height={34} borderRadius={10}
                        backgroundColor={Colors.expenseLight}
                        alignItems="center" justifyContent="center"
                        onPress={() => handleDelete(acc.id, acc.name)}
                      >
                        <DeleteIcon size={16} color={Colors.expense} strokeWidth={2} />
                      </StyledPressable>
                    </StyledPressable>
                    {i < accs.length - 1 && (
                      <RowDivider />
                    )}
                  </Stack>
                ))}
              </StyledCard>
            </Stack>
          )}

          {accs.length === 0 && (
            <StyledEmptyState variant="minimal" illustration="💳" title="No accounts yet"
              description="Add an account to start tracking your finances" animated />
          )}

          {/* Premium banner */}
          {!premium.isPremium && <PremiumBanner message="Free: 1 account" subtext="Upgrade for unlimited accounts" />}

          {/* Add new account button */}
          <StyledPressable
            flexDirection="row" alignItems="center" justifyContent="center" gap={10}
            marginHorizontal={16} marginTop={8} paddingVertical={16}
            borderRadius={18}
            backgroundColor={premium.canAddAccount((accs ?? []).length) ? Colors.primary : Colors.bgMuted}
            onPress={() => premium.canAddAccount((accs ?? []).length)
              ? router.push('/add-account' as any)
              : router.push('/premium' as any)}
            style={premium.canAddAccount((accs ?? []).length)
              ? { shadowColor: Colors.primary, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 }
              : undefined}
          >
            <AddIcon size={18} color={premium.canAddAccount((accs ?? []).length) ? '#fff' : Colors.textMuted} strokeWidth={2.5} />
            <Text fontSize={14} fontWeight="700"
              color={premium.canAddAccount((accs ?? []).length) ? '#fff' : Colors.textMuted}>
              {premium.canAddAccount((accs ?? []).length) ? 'Add New Account' : '🔒 Upgrade for More'}
            </Text>
          </StyledPressable>

        </StyledScrollView>
      )}
    </StyledPage>
  )
}
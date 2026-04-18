import React from 'react'
import { router } from 'expo-router'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { useColors } from '../../constants'
import { Text } from '../../components'
import { usePremium } from '../../hooks/usePremium'

interface PremiumGateProps {
  /** What feature is being gated — shown in the lock banner */
  feature:     string
  /** Short description shown below the feature name */
  description?: string
  /** Children shown when premium is active */
  children:    React.ReactNode
  /** Render a compact inline banner instead of a full overlay */
  compact?:    boolean
}

/**
 * Wraps any UI section. Shows children if premium, otherwise shows a lock
 * banner with an "Upgrade" button that opens the paywall.
 *
 * Usage:
 *   <PremiumGate feature="Unlimited budgets">
 *     <AddBudgetButton />
 *   </PremiumGate>
 */
export const PremiumGate: React.FC<PremiumGateProps> = ({
  feature, description, children, compact = false,
}) => {
  const Colors  = useColors()
  const { isPremium } = usePremium()

  if (isPremium) return <>{children}</>

  if (compact) {
    return (
      <Stack
        horizontal alignItems="center" gap={12}
        paddingVertical={12} paddingHorizontal={16}
        borderRadius={14}
        backgroundColor={Colors.bgMuted}
        borderWidth={1} borderColor={Colors.border}
      >
        <StyledText fontSize={18}>⚡</StyledText>
        <Stack flex={1} gap={2}>
          <Text variant="label" color={Colors.textPrimary}>
            {feature}
          </Text>
          {description && (
            <Text variant="subLabel" color={Colors.textMuted}>{description}</Text>
          )}
        </Stack>
        <StyledPressable
          paddingVertical={8} paddingHorizontal={14}
          borderRadius={20} backgroundColor="#6366F1"
          onPress={() => router.push('/premium' as any)}
        >
          <Text variant="button" color="#fff">Upgrade</Text>
        </StyledPressable>
      </Stack>
    )
  }

  return (
    <Stack
      alignItems="center" justifyContent="center" gap={12}
      paddingVertical={32} paddingHorizontal={24}
      borderRadius={20}
      backgroundColor={Colors.bgCard}
      borderWidth={1} borderColor={Colors.border}
      borderStyle="dashed"
    >
      <Stack
        width={52} height={52} borderRadius={26}
        backgroundColor="#6366F115"
        alignItems="center" justifyContent="center"
      >
        <StyledText fontSize={24}>🔒</StyledText>
      </Stack>
      <Stack alignItems="center" gap={4}>
        <Text variant="subtitle" color={Colors.textPrimary}>
          {feature}
        </Text>
        {description && (
          <Text variant="body" color={Colors.textMuted} textAlign="center">
            {description}
          </Text>
        )}
      </Stack>
      <StyledPressable
        paddingVertical={12} paddingHorizontal={28}
        borderRadius={24} backgroundColor="#6366F1"
        onPress={() => router.push('/premium' as any)}
        style={{
          shadowColor: '#6366F1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text variant="button" color="#fff">
          Unlock with Premium ⚡
        </Text>
      </StyledPressable>
    </Stack>
  )
}

/**
 * Inline banner shown at the top of a screen to nudge free users.
 * Dismissible — disappears once tapped through or user is premium.
 */
export const PremiumBanner: React.FC<{
  message:  string
  subtext?: string
}> = ({ message, subtext }) => {
  const Colors    = useColors()
  const { isPremium } = usePremium()

  if (isPremium) return null

  return (
    <StyledPressable
      flexDirection='row' alignItems="center" gap={12}
      marginHorizontal={16} marginBottom={12}
      paddingVertical={12} paddingHorizontal={16}
      borderRadius={16}
      backgroundColor="#6366F115"
      borderWidth={1} borderColor="#6366F130"
      onPress={() => router.push('/premium' as any)}
    >
      <StyledText fontSize={20}>⚡</StyledText>
      <Stack flex={1} gap={2}>
        <Text variant="label" color="#6366F1">{message}</Text>
        {subtext && <Text variant="caption" color={Colors.textMuted}>{subtext}</Text>}
      </Stack>
      <Text variant="label" color="#6366F1">→</Text>
    </StyledPressable>
  )
}

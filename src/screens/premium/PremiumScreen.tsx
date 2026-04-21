import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Stack, StyledText, StyledPressable, StyledCard, StyledPage } from 'fluent-styles'
import { useColors } from '../../constants'
import { PREMIUM_FEATURES, PREMIUM_PRICING } from '../../constants/premium'
import { usePremium } from '../../hooks/usePremium'
import { Text } from '../../components'
import {
  CheckIcon, CloseIcon, AccountsTabIcon, BudgetsTabIcon,
  TrendUpIcon, SettingsTabIcon, CopyIcon, CalendarIcon, BellIcon,
} from '../../icons'

type PlanKey = 'MONTHLY' | 'YEARLY' | 'ONE_TIME'

// Map each feature to a proper SVG icon component
const FEATURE_ICONS: Record<string, React.ReactNode> = {}

const planColor = '#6366F1'

// Feature icon with coloured circle bg — uses our custom SVG icons
const FeatureIcon: React.FC<{ index: number }> = ({ index }) => {
  const icons = [
    <AccountsTabIcon  size={18} color={planColor} strokeWidth={2} />,  // accounts
    <BudgetsTabIcon   size={18} color={planColor} strokeWidth={2} />,  // budgets
    <BellIcon         size={18} color={planColor} strokeWidth={2} />,  // transactions (infinity)
    <SettingsTabIcon  size={18} color={planColor} strokeWidth={2} />,  // themes (palette)
    <TrendUpIcon      size={18} color={planColor} strokeWidth={2} />,  // export
    <TrendUpIcon      size={18} color={planColor} strokeWidth={2} />,  // analysis
    <CalendarIcon     size={18} color={planColor} strokeWidth={2} />,  // future
  ]
  return (
    <Stack
      width={40} height={40} borderRadius={20}
      backgroundColor={planColor + '15'}
      alignItems="center" justifyContent="center"
    >
      {icons[index] ?? <BellIcon size={18} color={planColor} strokeWidth={2} />}
    </Stack>
  )
}

export default function PremiumScreen() {
  const Colors  = useColors()
  const premium = usePremium()

  const [selected,    setSelected]    = useState<PlanKey>('YEARLY')

  const handlePurchasePress = async () => {
    let success = false
    if (selected === 'MONTHLY')  success = await premium.buyMonthly()
    if (selected === 'YEARLY')   success = await premium.buyYearly()
    if (selected === 'ONE_TIME') success = await premium.buyLifetime()
    if (success) router.back()
  }

  // ── Already premium ────────────────────────────────────────────────────────
  if (premium.isPremium) {
    return (
      <StyledPage flex={1} backgroundColor={Colors.bg}>
        <Stack flex={1}
          alignItems="center" justifyContent="center" gap={16} padding={32}>
          <StyledText fontSize={48}>🎉</StyledText>
          <Text variant="header" color={Colors.textPrimary} textAlign="center">
            You're on Premium
          </Text>
          <Text variant="body" color={Colors.textMuted} textAlign="center">
            {premium.plan === 'lifetime'
              ? 'Lifetime access — enjoy all features forever.'
              : `Your ${premium.plan} subscription is active.`}
          </Text>
          <StyledPressable
            marginTop={8} paddingVertical={14} paddingHorizontal={32}
            borderRadius={30} backgroundColor={planColor}
            onPress={() => router.back()}
          >
            <Text variant="button" color="#fff">Back to Claro</Text>
          </StyledPressable>
        </Stack>
      </StyledPage>
    )
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <StyledPage.Header 
      onBackPress={()=> router.navigate("/(tabs)/settings")}
        backArrowProps={{
          color: Colors.textPrimary
        }}
       showBackArrow marginHorizontal={16} shapeProps={{
        backgroundColor : Colors.bgCard,
        size            : 38,
        borderRadius    : 19,
        shadowColor     : '#000',
      }}>

      </StyledPage.Header>
      <Stack flex={1}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Compact hero — fits above fold ──────────────────────────── */}
        <Stack
          alignItems="center" paddingHorizontal={24}
           paddingBottom={20}
        >
          <Stack flexDirection="row" alignItems="center" gap={10} marginBottom={6}>
            <Stack
              width={40} height={40} borderRadius={20}
              backgroundColor={planColor + '18'}
              alignItems="center" justifyContent="center"
            >
              <StyledText fontSize={22}>⚡</StyledText>
            </Stack>
            <Text variant="header" color={Colors.textPrimary} letterSpacing={-0.5}>
              Claro Premium
            </Text>
          </Stack>
          <Text variant="body" color={Colors.textMuted} textAlign="center">
            Unlock everything. No limits, no ads, no nonsense.
          </Text>
        </Stack>

        {/* ── Feature list ────────────────────────────────────────────── */}
        <StyledCard
          marginHorizontal={20} marginBottom={20}
          borderRadius={20} backgroundColor={Colors.bgCard}
          borderWidth={1} borderColor={Colors.border}
          paddingVertical={12} paddingHorizontal={16}
        >
          <Stack gap={0}>
            {PREMIUM_FEATURES.map((f, i) => (
              <Stack key={i}>
                <Stack flexDirection="row" alignItems="center" gap={12} paddingVertical={10}>
                  <FeatureIcon index={i} />
                  <Stack flex={1} gap={1}>
                    <Text variant="label" color={Colors.textPrimary}>
                      {f.title}
                    </Text>
                    <Text variant="subLabel" color={Colors.textMuted}>
                      {f.description}
                    </Text>
                  </Stack>
                  <CheckIcon size={16} color={planColor} strokeWidth={2.5} />
                </Stack>
                {i < PREMIUM_FEATURES.length - 1 && (
                  <Stack height={1} backgroundColor={Colors.border} marginLeft={52} />
                )}
              </Stack>
            ))}
          </Stack>
        </StyledCard>

        {/* ── Plan selector ───────────────────────────────────────────── */}
        <Stack paddingHorizontal={20} gap={10} marginBottom={20}>
          <Text variant="overline" color={Colors.textMuted} marginBottom={2}>
            CHOOSE YOUR PLAN
          </Text>

          {(['YEARLY', 'ONE_TIME', 'MONTHLY'] as PlanKey[]).map(key => {
            const p      = PREMIUM_PRICING[key]
            const active = selected === key
            const isBestValue = key === 'ONE_TIME'

            return (
              <StyledPressable
                key={key}
                onPress={() => setSelected(key)}
                borderRadius={16}
                borderWidth={2}
                borderColor={active ? planColor : Colors.border}
                backgroundColor={active ? planColor + '10' : Colors.bgCard}
                paddingVertical={14} paddingHorizontal={16}
              >
                <Stack flexDirection="row" alignItems="center" gap={12}>

                  {/* Radio dot */}
                  <Stack
                    width={22} height={22} borderRadius={11}
                    borderWidth={2}
                    borderColor={active ? planColor : Colors.textMuted}
                    alignItems="center" justifyContent="center"
                    flexShrink={0}
                  >
                    {active && (
                      <Stack width={11} height={11} borderRadius={6} backgroundColor={planColor} />
                    )}
                  </Stack>

                  {/* Label + subtitle */}
                  <Stack flex={1} gap={2}>
                    <Stack flexDirection="row" alignItems="center" gap={6} flexWrap="wrap">
                      <Text variant="button" color={Colors.textPrimary}>
                        {p.label}
                      </Text>
                      {'saving' in p && (
                        <Stack paddingHorizontal={7} paddingVertical={2}
                          borderRadius={6} backgroundColor={planColor}>
                          <Text variant="caption" color="#fff">
                            {(p as any).saving}
                          </Text>
                        </Stack>
                      )}
                      {isBestValue && (
                        <Stack paddingHorizontal={7} paddingVertical={2}
                          borderRadius={6} backgroundColor="#F59E0B">
                          <Text variant="caption" color="#fff">
                            BEST VALUE
                          </Text>
                        </Stack>
                      )}
                    </Stack>
                    {'trial' in p && (
                      <Text variant="label" color={planColor}>
                        {(p as any).trial}
                      </Text>
                    )}
                    {key === 'ONE_TIME' && (
                      <Text variant="bodySmall" color={Colors.textMuted}>
                        Pay once, use forever
                      </Text>
                    )}
                    {key === 'MONTHLY' && (
                      <Text variant="bodySmall" color={Colors.textMuted}>
                        Billed monthly, cancel anytime
                      </Text>
                    )}
                  </Stack>

                  {/* Price */}
                  <Stack alignItems="flex-end" gap={1} flexShrink={0}>
                    <Text variant="metric" color={active ? planColor : Colors.textPrimary}>
                      {p.price}
                    </Text>
                    <Text variant="caption" color={Colors.textMuted}>
                      {p.period}
                    </Text>
                  </Stack>

                </Stack>
              </StyledPressable>
            )
          })}
        </Stack>

        {/* ── CTA button ──────────────────────────────────────────────── */}
        <Stack paddingHorizontal={20} gap={12}>
          <StyledPressable
            paddingVertical={18} borderRadius={30}
            backgroundColor={planColor}
            alignItems="center" justifyContent="center"
            onPress={handlePurchasePress}
            style={{
              shadowColor:   planColor,
              shadowOffset:  { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius:  12,
              elevation:     6,
            }}
          >
            <Text variant="button" color="#fff">
              {selected === 'YEARLY'   ? '🎉 Start 7-Day Free Trial' :
               selected === 'ONE_TIME' ? '⚡ Buy Lifetime Access' :
               '🚀 Start Monthly Plan'}
            </Text>
          </StyledPressable>

          <Stack alignItems="center" gap={6}>
            <StyledPressable onPress={premium.restore}>
              <Text variant="label" color={planColor}>
                Restore purchases
              </Text>
            </StyledPressable>
            <Text variant="caption" color={Colors.textMuted} textAlign="center" lineHeight={16}>
              Subscriptions renew automatically. Cancel anytime.{'\n'}
              Payment charged to your Apple ID at confirmation.
            </Text>
          </Stack>
        </Stack>

        </ScrollView>
      </Stack>
    </StyledPage>
  )
}

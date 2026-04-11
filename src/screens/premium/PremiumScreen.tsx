import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Stack, StyledText, StyledPressable, StyledCard } from 'fluent-styles'
import { useColors } from '../../constants'
import { PREMIUM_FEATURES, PREMIUM_PRICING } from '../../constants/premium'
import { usePremium } from '../../hooks/usePremium'
import {
  CheckIcon, CloseIcon, AccountsTabIcon, BudgetsTabIcon,
  TrendUpIcon, SettingsTabIcon, CopyIcon, CalendarIcon, BellIcon,
} from '../../icons'
import { MockPaymentSheet } from './MockPaymentSheet'

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
  const [showPayment, setShowPayment] = useState(false)

  const handlePurchasePress = () => setShowPayment(true)

  const handlePaymentConfirm = async () => {
    setShowPayment(false)
    let success = false
    if (selected === 'MONTHLY')  success = await premium.buyMonthly()
    if (selected === 'YEARLY')   success = await premium.buyYearly()
    if (selected === 'ONE_TIME') success = await premium.buyLifetime()
    if (success) router.back()
  }

  // ── Already premium ────────────────────────────────────────────────────────
  if (premium.isPremium) {
    return (
      <Stack flex={1} backgroundColor={Colors.bg}
        alignItems="center" justifyContent="center" gap={16} padding={32}>
        <StyledText fontSize={48}>🎉</StyledText>
        <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} textAlign="center">
          You're on Premium
        </StyledText>
        <StyledText fontSize={15} color={Colors.textMuted} textAlign="center">
          {premium.plan === 'lifetime'
            ? 'Lifetime access — enjoy all features forever.'
            : `Your ${premium.plan} subscription is active.`}
        </StyledText>
        <StyledPressable
          marginTop={8} paddingVertical={14} paddingHorizontal={32}
          borderRadius={30} backgroundColor={planColor}
          onPress={() => router.back()}
        >
          <StyledText fontSize={15} fontWeight="700" color="#fff">Back to Claro</StyledText>
        </StyledPressable>
      </Stack>
    )
  }

  return (
    <Stack flex={1} backgroundColor={Colors.bg}>

      {/* ── Close button — overlaid top right ───────────────────────── */}
      <Stack
        position="absolute" top={16} right={20}
        zIndex={10}
      >
        <StyledPressable
          width={32} height={32} borderRadius={16}
          backgroundColor={Colors.bgMuted}
          alignItems="center" justifyContent="center"
          onPress={() => router.back()}
        >
          <CloseIcon size={16} color={Colors.textMuted} />
        </StyledPressable>
      </Stack>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Compact hero — fits above fold ──────────────────────────── */}
        <Stack
          alignItems="center" paddingHorizontal={24}
          paddingTop={20} paddingBottom={20}
        >
          <Stack flexDirection="row" alignItems="center" gap={10} marginBottom={6}>
            <Stack
              width={40} height={40} borderRadius={20}
              backgroundColor={planColor + '18'}
              alignItems="center" justifyContent="center"
            >
              <StyledText fontSize={22}>⚡</StyledText>
            </Stack>
            <StyledText fontSize={24} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>
              Claro Premium
            </StyledText>
          </Stack>
          <StyledText fontSize={14} color={Colors.textMuted} textAlign="center">
            Unlock everything. No limits, no ads, no nonsense.
          </StyledText>
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
                    <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>
                      {f.title}
                    </StyledText>
                    <StyledText fontSize={12} color={Colors.textMuted}>
                      {f.description}
                    </StyledText>
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
          <StyledText fontSize={12} fontWeight="700" color={Colors.textMuted}
            letterSpacing={0.8} marginBottom={2}>
            CHOOSE YOUR PLAN
          </StyledText>

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
                      <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
                        {p.label}
                      </StyledText>
                      {'saving' in p && (
                        <Stack paddingHorizontal={7} paddingVertical={2}
                          borderRadius={6} backgroundColor={planColor}>
                          <StyledText fontSize={10} fontWeight="700" color="#fff">
                            {(p as any).saving}
                          </StyledText>
                        </Stack>
                      )}
                      {isBestValue && (
                        <Stack paddingHorizontal={7} paddingVertical={2}
                          borderRadius={6} backgroundColor="#F59E0B">
                          <StyledText fontSize={10} fontWeight="700" color="#fff">
                            BEST VALUE
                          </StyledText>
                        </Stack>
                      )}
                    </Stack>
                    {'trial' in p && (
                      <StyledText fontSize={12} color={planColor} fontWeight="600">
                        {(p as any).trial}
                      </StyledText>
                    )}
                    {key === 'ONE_TIME' && (
                      <StyledText fontSize={12} color={Colors.textMuted}>
                        Pay once, use forever
                      </StyledText>
                    )}
                    {key === 'MONTHLY' && (
                      <StyledText fontSize={12} color={Colors.textMuted}>
                        Billed monthly, cancel anytime
                      </StyledText>
                    )}
                  </Stack>

                  {/* Price */}
                  <Stack alignItems="flex-end" gap={1} flexShrink={0}>
                    <StyledText fontSize={20} fontWeight="800"
                      color={active ? planColor : Colors.textPrimary}>
                      {p.price}
                    </StyledText>
                    <StyledText fontSize={11} color={Colors.textMuted}>
                      {p.period}
                    </StyledText>
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
            <StyledText fontSize={16} fontWeight="800" color="#fff">
              {selected === 'YEARLY'   ? '🎉 Start 7-Day Free Trial' :
               selected === 'ONE_TIME' ? '⚡ Buy Lifetime Access' :
               '🚀 Start Monthly Plan'}
            </StyledText>
          </StyledPressable>

          <Stack alignItems="center" gap={6}>
            <StyledPressable onPress={premium.restore}>
              <StyledText fontSize={13} color={planColor} fontWeight="600">
                Restore purchases
              </StyledText>
            </StyledPressable>
            <StyledText fontSize={11} color={Colors.textMuted} textAlign="center" lineHeight={16}>
              Subscriptions renew automatically. Cancel anytime.{'\n'}
              Payment charged to your Apple ID at confirmation.
            </StyledText>
          </Stack>
        </Stack>

      </ScrollView>

      {/* ── Mock payment sheet ──────────────────────────────────────── */}
      <MockPaymentSheet
        visible={showPayment}
        plan={selected}
        onConfirm={handlePaymentConfirm}
        onCancel={() => setShowPayment(false)}
      />

    </Stack>
  )
}

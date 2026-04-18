import React, { useState, useEffect, useCallback } from 'react'
import { router } from 'expo-router'
import { FlatList, ActivityIndicator } from 'react-native'
import {
  Stack, StyledText, StyledPressable, StyledScrollView,
  StyledCard, StyledDivider, Switch, Popup, StyledPage,
} from 'fluent-styles'
import { Text } from '../../components'
import { toastService, dialogueService } from 'fluent-styles'
import {
  ChevronRightIcon, CheckIcon, LockIcon, FingerprintIcon,
  AccountsTabIcon, CategoriesTabIcon, SettingsTabIcon,
  DeleteIcon, TrendUpIcon, CalendarIcon, CopyIcon, BellIcon,
} from '../../icons'
import { Colors, useColors, CURRENCIES } from '../../constants'
import { usePremium } from '../../hooks/usePremium'
import { PREMIUM_THEMES } from '../../constants/premium'
import { THEMES, THEME_META, type ThemeKey } from '../../constants/themes'
import { useThemeStore, usePremiumStore } from '../../stores'
import { exportCSV, exportJSON } from '../../services/exportService'
import { clearEntitlement } from '../../services/premiumService'
import { useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import {
  isBiometricAvailable, isBiometricEnabled, setBiometricEnabled,
  hasPin, deletePin, clearSetup,
} from '../../utils/security'

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <Text
    variant="overline" color={Colors.textMuted}
    letterSpacing={1}
    paddingHorizontal={20} paddingTop={24} paddingBottom={8}
  >
    {label.toUpperCase()}
  </Text>
)

// ─── Row — navigates or shows chevron ────────────────────────────────────────
const SettingsRow: React.FC<{
  icon:     React.ReactNode
  label:    string
  value?:   string
  subtitle?: string
  onPress:  () => void
  danger?:  boolean
  loading?:  boolean
}> = ({ icon, label, value, subtitle, onPress, danger = false, loading = false }) => {
  const Colors = useColors()
  return (
    <StyledPressable
      flexDirection="row" alignItems="center" gap={14}
      paddingHorizontal={20} paddingVertical={14}
      backgroundColor={Colors.bgCard}
      onPress={onPress}
      disabled={loading}
      opacity={loading ? 0.6 : 1}
    >
      <Stack width={28} height={28} alignItems="center" justifyContent="center">
        {icon}
      </Stack>
      <Stack flex={1} gap={subtitle ? 2 : 0}>
        <Text variant="button"
          color={danger ? Colors.expense : Colors.textPrimary}>
          {label}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" color={Colors.textMuted}>{subtitle}</Text>
        ) : null}
      </Stack>
      {value && !loading ? (
        <Text variant="body" color={Colors.textMuted} marginRight={6}>{value}</Text>
      ) : null}
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <ChevronRightIcon size={16} color={Colors.textMuted} strokeWidth={2} />
      )}
    </StyledPressable>
  )
}

// ─── Row — toggle switch ──────────────────────────────────────────────────────
const SwitchRow: React.FC<{
  icon:     React.ReactNode
  label:    string
  subtitle?: string
  value:    boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}> = ({ icon, label, subtitle, value, onChange, disabled }) => (
  <Stack
    flexDirection="row" alignItems="center" gap={14}
    paddingHorizontal={20} paddingVertical={14}
    backgroundColor={Colors.bgCard}
  >
    <Stack width={28} height={28} alignItems="center" justifyContent="center">
      {icon}
    </Stack>
    <Stack flex={1} gap={2}>
      <Text variant="button" color={Colors.textPrimary}>{label}</Text>
      {subtitle ? (
        <Text variant="bodySmall" color={Colors.textMuted}>{subtitle}</Text>
      ) : null}
    </Stack>
    <Switch
      value={value}
      onChange={onChange}
      disabled={disabled}
      size="sm"
      activeColor={Colors.primary}
    />
  </Stack>
)

// ─── Currency picker sheet ────────────────────────────────────────────────────
const CurrencyPicker: React.FC<{
  current:  string
  onSelect: (code: string, symbol: string) => void
}> = ({ current, onSelect }) => (
  <FlatList
    data={[...CURRENCIES]}
    keyExtractor={item => item.code}
    style={{ maxHeight: 400 }}
    renderItem={({ item }) => {
      const isSelected = item.code === current
      return (
        <StyledPressable
          flexDirection="row" alignItems="center" gap={14}
          paddingHorizontal={20} paddingVertical={14}
          backgroundColor={isSelected ? Colors.accent + '33' : Colors.bgCard}
          onPress={() => onSelect(item.code, item.symbol)}
        >
          <Stack
            width={40} height={40} borderRadius={20}
            backgroundColor={Colors.accent}
            alignItems="center" justifyContent="center"
          >
            <Text variant="button" color={Colors.primary}>
              {item.symbol}
            </Text>
          </Stack>
          <Stack flex={1} gap={2}>
            <Text variant="button" color={Colors.textPrimary}>{item.code}</Text>
            <Text variant="bodySmall" color={Colors.textMuted}>{item.name}</Text>
          </Stack>
          {isSelected && <CheckIcon size={18} color={Colors.primary} strokeWidth={2.5} />}
        </StyledPressable>
      )
    }}
    ItemSeparatorComponent={() => (
      <StyledDivider borderBottomColor={Colors.border} marginLeft={74} />
    )}
  />
)

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const Colors = useColors()
  const premium = usePremium()
  const { themeKey, setTheme } = useThemeStore()
  const { data: settings, update: updateSettings } = useSettings()
  const { invalidateData } = useRecordsStore()

  const [bioAvailable,   setBioAvailable]   = useState(false)
  const [bioEnabled,     setBioEnabledState] = useState(false)
  const [showCurrency,   setShowCurrency]   = useState(false)
  const [exportingCSV,   setExportingCSV]   = useState(false)
  const [exportingJSON,  setExportingJSON]  = useState(false)

  useEffect(() => {
    Promise.all([isBiometricAvailable(), isBiometricEnabled()])
      .then(([avail, enabled]) => {
        setBioAvailable(avail)
        setBioEnabledState(enabled)
      })
  }, [])

  // ─── Currency ──────────────────────────────────────────────────────────────
  const handleCurrencySelect = useCallback(async (code: string, symbol: string) => {
    setShowCurrency(false)
    await updateSettings({ currency: code, currencySymbol: symbol })
    invalidateData()
    toastService.success(`Currency changed to ${code}`)
  }, [updateSettings, invalidateData])

  // ─── Biometric ────────────────────────────────────────────────────────────
  const handleBioToggle = useCallback(async (enabled: boolean) => {
    await setBiometricEnabled(enabled)
    setBioEnabledState(enabled)
    toastService.success(enabled ? 'Biometric unlock enabled' : 'Biometric unlock disabled')
  }, [])

  // ─── Export ───────────────────────────────────────────────────────────────
  const handleExportCSV = useCallback(async () => {
    setExportingCSV(true)
    try {
      await exportCSV()
      toastService.success('Transactions exported as CSV')
    } catch (err: any) {
      toastService.error('Export failed', err?.message)
    } finally {
      setExportingCSV(false)
    }
  }, [])

  const handleExportJSON = useCallback(async () => {
    setExportingJSON(true)
    try {
      await exportJSON()
      toastService.success('Full backup created as JSON')
    } catch (err: any) {
      toastService.error('Backup failed', err?.message)
    } finally {
      setExportingJSON(false)
    }
  }, [])

  // ─── Change PIN ────────────────────────────────────────────────────────────
  const handleChangePIN = useCallback(() => {
    router.push('/change-pin' as any)
  }, [])

  // ─── Dev: reset premium (remove before production) ─────────────────────────
  const handleResetPremium = useCallback(async () => {
    const ok = await dialogueService.confirm({
      title:        'Reset premium?',
      message:      'This will remove your premium entitlement so you can test the paywall again.',
      icon:         '🧪',
      confirmLabel: 'Reset',
      destructive:  true,
    })
    if (!ok) return
    await clearEntitlement()
    usePremiumStore.getState().setEntitlement(false, null)
    toastService.info('Premium reset', 'App is now in free mode')
  }, [])

  // ─── Reset PIN ─────────────────────────────────────────────────────────────
  const handleResetApp = useCallback(async () => {
    const ok = await dialogueService.confirm({
      title:        'Reset app?',
      message:      'This will delete your PIN and all settings. You will go through setup again.',
      icon:         '⚠️',
      confirmLabel: 'Reset',
      destructive:  true,
    })
    if (!ok) return
    // Clear all secure storage
    await deletePin()
    await clearSetup()
    toastService.success('App reset — restarting setup')
    // Navigate to onboarding
    setTimeout(() => {
      router.replace('/(onboarding)/setup-pin' as any)
    }, 800)
  }, [])

  const currentCurrency = CURRENCIES.find(c => c.code === settings?.currency)

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <Stack flex={1}>
        <Stack paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
          <Text variant="header" color={Colors.textPrimary} letterSpacing={-0.5}>
            Settings
          </Text>
        </Stack>

      <StyledScrollView contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Premium ─────────────────────────────────────────────────── */}
        {!premium.isPremium ? (
          <StyledPressable
            marginHorizontal={16} marginBottom={8}
            borderRadius={20} overflow="hidden"
            onPress={() => router.push('/premium' as any)}
          >
            <Stack
              paddingVertical={18} paddingHorizontal={20}
              borderRadius={20}
              backgroundColor="#6366F1"
            >
              <Stack horizontal alignItems="center" justifyContent="space-between">
                <Stack gap={4}>
                  <Stack horizontal alignItems="center" gap={8}>
                    <StyledText fontSize={20}>⚡</StyledText>
                    <Text variant="subtitle" color="#fff">Upgrade to Premium</Text>
                  </Stack>
                  <Text variant="bodySmall" color="rgba(255,255,255,0.8)">
                    Unlimited everything · All themes · Export
                  </Text>
                </Stack>
                <Stack
                  paddingVertical={8} paddingHorizontal={16}
                  borderRadius={20} backgroundColor="rgba(255,255,255,0.2)"
                >
                  <Text variant="label" color="#fff">View →</Text>
                </Stack>
              </Stack>
            </Stack>
          </StyledPressable>
        ) : (
          <Stack
            marginHorizontal={16} marginBottom={8}
            paddingVertical={14} paddingHorizontal={20}
            borderRadius={20} backgroundColor="#6366F115"
            borderWidth={1} borderColor="#6366F130"
            horizontal alignItems="center" gap={12}
          >
            <StyledText fontSize={22}>⚡</StyledText>
            <Stack flex={1}>
              <Text variant="label" color="#6366F1">Claro Premium</Text>
              <Text variant="bodySmall" color={Colors.textMuted}>
                {premium.plan === 'lifetime' ? 'Lifetime access' : `${premium.plan} subscription`}
              </Text>
            </Stack>
            <StyledText fontSize={20}>✓</StyledText>
          </Stack>
        )}

        {/* ── Appearance ──────────────────────────────────────────────── */}
        <SectionHeader label="Appearance" />
        <Stack marginHorizontal={16} flexDirection="row" gap={10} flexWrap="wrap">
          {(Object.keys(THEME_META) as ThemeKey[]).map((key) => {
            const meta    = THEME_META[key]
            const theme   = THEMES[key]
            const active  = themeKey === key
            return (
              <StyledPressable
                key={key}
                onPress={() => setTheme(key)}
                alignItems="center" gap={8}
                paddingVertical={14} paddingHorizontal={12}
                borderRadius={16}
                flex={1}
                borderWidth={2}
                borderColor={active ? theme.primary : Colors.border}
                backgroundColor={active ? theme.accent : Colors.bgCard}
              >
                {/* Color swatches */}
                <Stack horizontal gap={4}>
                  {meta.preview.map((c, i) => (
                    <Stack key={i} width={18} height={18} borderRadius={9} backgroundColor={c} />
                  ))}
                </Stack>
                <Text variant="overline"
                  color={active ? theme.primary : Colors.textMuted}>
                  {meta.label}
                </Text>
                {active && (
                  <Stack
                    width={18} height={18} borderRadius={9}
                    backgroundColor={theme.primary}
                    alignItems="center" justifyContent="center"
                  >
                    <CheckIcon size={10} color={Colors.white} strokeWidth={3} />
                  </Stack>
                )}
              </StyledPressable>
            )
          })}
        </Stack>

        {/* ── General ─────────────────────────────────────────────── */}
        <SectionHeader label="General" />
        <StyledCard
          marginHorizontal={16} borderRadius={16}
          backgroundColor={Colors.bgCard}
          borderWidth={1} borderColor={Colors.border}
          overflow="hidden"
        >
          <SettingsRow
            icon={<TrendUpIcon size={20} color={Colors.primary} strokeWidth={2} />}
            label="Currency"
            value={currentCurrency ? `${currentCurrency.symbol} ${currentCurrency.code}` : '—'}
            onPress={() => setShowCurrency(true)}
          />
        </StyledCard>

        {/* ── Manage ──────────────────────────────────────────────── */}
        <SectionHeader label="Manage" />
        <StyledCard
          marginHorizontal={16} borderRadius={16}
          backgroundColor={Colors.bgCard}
          borderWidth={1} borderColor={Colors.border}
          overflow="hidden"
        >
          <SettingsRow
            icon={<AccountsTabIcon size={20} color={Colors.primary} strokeWidth={2} />}
            label="Accounts"
            onPress={() => router.push('/(tabs)/accounts' as any)}
          />
          <StyledDivider borderBottomColor={Colors.border} marginLeft={62} />
          <SettingsRow
            icon={<CategoriesTabIcon size={20} color={Colors.primary} strokeWidth={2} />}
            label="Categories"
            onPress={() => router.push('/(tabs)/categories' as any)}
          />
        </StyledCard>

        {/* ── Security ────────────────────────────────────────────── */}
        <SectionHeader label="Security" />
        <StyledCard
          marginHorizontal={16} borderRadius={16}
          backgroundColor={Colors.bgCard}
          borderWidth={1} borderColor={Colors.border}
          overflow="hidden"
        >
          <SettingsRow
            icon={<LockIcon size={20} color={Colors.primary} strokeWidth={2} />}
            label="Change PIN"
            onPress={handleChangePIN}
          />
          {bioAvailable && (
            <>
              <StyledDivider borderBottomColor={Colors.border} marginLeft={62} />
              <SwitchRow
                icon={<FingerprintIcon size={20} color={Colors.primary} strokeWidth={2} />}
                label="Face ID / Touch ID"
                subtitle="Unlock Claro with biometrics"
                value={bioEnabled}
                onChange={handleBioToggle}
              />
            </>
          )}
        </StyledCard>

        {/* ── About ───────────────────────────────────────────────── */}
        <SectionHeader label="About" />
        <StyledCard
          marginHorizontal={16} borderRadius={16}
          backgroundColor={Colors.bgCard}
          borderWidth={1} borderColor={Colors.border}
          overflow="hidden"
        >
          <Stack flexDirection="row" alignItems="center" gap={14} paddingHorizontal={20} paddingVertical={14}>
            <Stack width={28} height={28} alignItems="center" justifyContent="center">
              <SettingsTabIcon size={20} color={Colors.textMuted} strokeWidth={1.8} />
            </Stack>
            <StyledText flex={1} fontSize={15} fontWeight="600" color={Colors.textPrimary}>Version</StyledText>
            <StyledText fontSize={14} color={Colors.textMuted}>1.0.0</StyledText>
          </Stack>
          <StyledDivider borderBottomColor={Colors.border} marginLeft={62} />
          <Stack flexDirection="row" alignItems="center" gap={14} paddingHorizontal={20} paddingVertical={14}>
            <Stack width={28} height={28} alignItems="center" justifyContent="center">
              <BellIcon size={20} color={Colors.textMuted} strokeWidth={1.8} />
            </Stack>
            <StyledText flex={1} fontSize={15} fontWeight="600" color={Colors.textPrimary}>Built with</StyledText>
            <StyledText fontSize={14} color={Colors.textMuted}>fluent-styles</StyledText>
          </Stack>
        </StyledCard>

        {/* ── Data ───────────────────────────────────────────────────── */}
        <SectionHeader label="Data" />
        <StyledCard
          marginHorizontal={16} borderRadius={16}
          backgroundColor={Colors.bgCard}
          borderWidth={1} borderColor={Colors.border}
          overflow="hidden"
        >
          <SettingsRow
            icon={<CalendarIcon size={20} color={premium.canExport() ? Colors.primary : Colors.textMuted} strokeWidth={2} />}
            label="Export transactions"
            subtitle={exportingCSV ? 'Exporting…' : undefined}
            value={premium.canExport() ? 'CSV' : '🔒 Premium'}
            onPress={() => premium.canExport() && !exportingCSV ? handleExportCSV() : premium.canExport() ? null : router.push('/premium' as any)}
            loading={exportingCSV}
          />
          <StyledDivider borderBottomColor={Colors.border} marginLeft={62} />
          <SettingsRow
            icon={<CopyIcon size={20} color={premium.canExport() ? Colors.primary : Colors.textMuted} strokeWidth={2} />}
            label="Backup all data"
            subtitle={exportingJSON ? 'Creating backup…' : undefined}
            value={premium.canExport() ? 'JSON' : '🔒 Premium'}
            onPress={() => premium.canExport() && !exportingJSON ? handleExportJSON() : premium.canExport() ? null : router.push('/premium' as any)}
            loading={exportingJSON}
          />
        </StyledCard>

        {/* ── Danger zone ─────────────────────────────────────────── */}
        <SectionHeader label="Danger Zone" />
        <StyledCard
          marginHorizontal={16} borderRadius={16}
          backgroundColor={Colors.bgCard}
          borderWidth={1} borderColor={Colors.border}
          overflow="hidden"
        >
          <SettingsRow
            icon={<DeleteIcon size={20} color={Colors.expense} strokeWidth={2} />}
            label="Reset app"
            onPress={handleResetApp}
            danger
          />
          {__DEV__ && (
            <>
              <StyledDivider borderBottomColor={Colors.border} />
              <SettingsRow
                icon={<StyledText fontSize={16}>🧪</StyledText>}
                label="Reset premium (dev)"
                onPress={handleResetPremium}
                danger
              />
            </>
          )}
        </StyledCard>

      </StyledScrollView>

      {/* ── Currency picker — Popup from fluent-styles ─────────────── */}
      <Popup
        visible={showCurrency}
        onClose={() => setShowCurrency(false)}
        title="Select Currency"
        showClose
        position="bottom"
        round
        roundRadius={20}
      >
        <CurrencyPicker
          current={settings?.currency ?? 'USD'}
          onSelect={handleCurrencySelect}
        />
      </Popup>
    </Stack>
  </StyledPage>
  )
}

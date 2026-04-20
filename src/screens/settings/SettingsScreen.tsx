import React, { useState, useEffect, useCallback } from 'react'
import { router } from 'expo-router'
import { FlatList, ActivityIndicator } from 'react-native'
import {
  Stack, StyledText, StyledPressable, StyledScrollView, StyledCard,
  StyledDivider, Switch, Popup, StyledPage,
} from 'fluent-styles'
import { toastService, dialogueService } from 'fluent-styles'
import {
  ChevronRightIcon, CheckIcon, LockIcon, FingerprintIcon,
  AccountsTabIcon, CategoriesTabIcon, SettingsTabIcon,
  DeleteIcon, TrendUpIcon, CalendarIcon, CopyIcon, BellIcon,
} from '../../icons'
import { useColors, CURRENCIES } from '../../constants'
import { usePremium } from '../../hooks/usePremium'
import { THEMES, THEME_META, type ThemeKey } from '../../constants/themes'
import { useThemeStore, usePremiumStore } from '../../stores'
import { exportCSV, exportJSON } from '../../services/exportService'
import { clearEntitlement } from '../../services/premiumService'
import { useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { isBiometricAvailable, isBiometricEnabled, setBiometricEnabled, deletePin, clearSetup } from '../../utils/security'
import { Text } from '../../components'

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  const Colors = useColors()
  return (
    <Stack paddingHorizontal={20} paddingTop={28} paddingBottom={8}>
      <Text variant="overline" color={Colors.textMuted} letterSpacing={1.2}>
        {label.toUpperCase()}
      </Text>
    </Stack>
  )
}

// ─── Icon pill ────────────────────────────────────────────────────────────────
function IconPill({ icon, bg }: { icon: React.ReactNode; bg: string }) {
  return (
    <Stack width={36} height={36} borderRadius={10} backgroundColor={bg} alignItems="center" justifyContent="center">
      {icon}
    </Stack>
  )
}

// ─── Settings row ─────────────────────────────────────────────────────────────
function SettingsRow({ icon, label, value, subtitle, onPress, danger = false, loading = false }: {
  icon: React.ReactNode; label: string; value?: string
  subtitle?: string; onPress: () => void; danger?: boolean; loading?: boolean
}) {
  const Colors = useColors()
  return (
    <StyledPressable flexDirection="row" alignItems="center" gap={14}
      paddingHorizontal={16} paddingVertical={13} backgroundColor={Colors.bgCard}
      onPress={onPress} disabled={loading} opacity={loading ? 0.6 : 1}>
      {icon}
      <Stack flex={1} gap={subtitle ? 2 : 0}>
        <Text fontSize={15} fontWeight="600" color={danger ? Colors.expense : Colors.textPrimary}>{label}</Text>
        {subtitle && <Text variant="bodySmall" color={Colors.textMuted}>{subtitle}</Text>}
      </Stack>
      {value && !loading && <Text variant="subLabel" color={Colors.textMuted} marginRight={4}>{value}</Text>}
      {loading
        ? <ActivityIndicator size="small" color={Colors.primary} />
        : <ChevronRightIcon size={16} color={Colors.textMuted} strokeWidth={2} />}
    </StyledPressable>
  )
}

// ─── Switch row ───────────────────────────────────────────────────────────────
function SwitchRow({ icon, label, subtitle, value, onChange, disabled }: {
  icon: React.ReactNode; label: string; subtitle?: string
  value: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) {
  const Colors = useColors()
  return (
    <Stack flexDirection="row" alignItems="center" gap={14}
      paddingHorizontal={16} paddingVertical={13} backgroundColor={Colors.bgCard}>
      {icon}
      <Stack flex={1} gap={2}>
        <Text fontSize={15} fontWeight="600" color={Colors.textPrimary}>{label}</Text>
        {subtitle && <Text variant="bodySmall" color={Colors.textMuted}>{subtitle}</Text>}
      </Stack>
      <Switch value={value} onChange={onChange} disabled={disabled} size="sm" activeColor={Colors.primary} />
    </Stack>
  )
}

// ─── Settings group card ──────────────────────────────────────────────────────
function SettingsGroup({ children }: { children: React.ReactNode }) {
  const Colors = useColors()
  return (
    <StyledCard marginHorizontal={16} borderRadius={18} overflow="hidden"
      backgroundColor={Colors.bgCard} shadow="light">
      {children}
    </StyledCard>
  )
}

// ─── Row divider ──────────────────────────────────────────────────────────────
function RowDivider() {
  const Colors = useColors()
  return <Stack height={1} backgroundColor={Colors.border} marginLeft={66} opacity={0.6} />
}

// ─── Currency picker ──────────────────────────────────────────────────────────
function CurrencyPicker({ current, onSelect }: { current: string; onSelect: (code: string, symbol: string) => void }) {
  const Colors = useColors()
  return (
    <FlatList
      data={[...CURRENCIES]}
      keyExtractor={item => item.code}
      style={{ maxHeight: 400 }}
      renderItem={({ item }) => {
        const isSelected = item.code === current
        return (
          <StyledPressable flexDirection="row" alignItems="center" gap={14}
            paddingHorizontal={20} paddingVertical={14}
            backgroundColor={isSelected ? Colors.accent : Colors.bgCard}
            onPress={() => onSelect(item.code, item.symbol)}>
            <Stack width={40} height={40} borderRadius={20} backgroundColor={Colors.accent} alignItems="center" justifyContent="center">
              <Text fontSize={16} fontWeight="700" color={Colors.primary}>{item.symbol}</Text>
            </Stack>
            <Stack flex={1} gap={2}>
              <Text fontSize={15} fontWeight="600" color={Colors.textPrimary}>{item.code}</Text>
              <Text variant="bodySmall" color={Colors.textMuted}>{item.name}</Text>
            </Stack>
            {isSelected && <CheckIcon size={18} color={Colors.primary} strokeWidth={2.5} />}
          </StyledPressable>
        )
      }}
      ItemSeparatorComponent={() => <StyledDivider borderBottomColor={Colors.border} marginLeft={74} opacity={0.6} />}
    />
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const Colors  = useColors()
  const premium = usePremium()
  const { themeKey, setTheme } = useThemeStore()
  const { data: settings, update: updateSettings } = useSettings()
  const { invalidateData } = useRecordsStore()

  const [bioAvailable,  setBioAvailable]  = useState(false)
  const [bioEnabled,    setBioEnabled]    = useState(false)
  const [showCurrency,  setShowCurrency]  = useState(false)
  const [exportingCSV,  setExportingCSV]  = useState(false)
  const [exportingJSON, setExportingJSON] = useState(false)

  useEffect(() => {
    Promise.all([isBiometricAvailable(), isBiometricEnabled()])
      .then(([avail, enabled]) => { setBioAvailable(avail); setBioEnabled(enabled) })
  }, [])

  const handleCurrencySelect = useCallback(async (code: string, symbol: string) => {
    setShowCurrency(false)
    await updateSettings({ currency: code, currencySymbol: symbol })
    invalidateData()
    toastService.success(`Currency changed to ${code}`)
  }, [updateSettings, invalidateData])

  const handleBioToggle = useCallback(async (enabled: boolean) => {
    await setBiometricEnabled(enabled); setBioEnabled(enabled)
    toastService.success(enabled ? 'Biometric unlock enabled' : 'Biometric unlock disabled')
  }, [])

  const handleExportCSV = useCallback(async () => {
    setExportingCSV(true)
    try { await exportCSV(); toastService.success('Transactions exported as CSV') }
    catch (err: any) { toastService.error('Export failed', err?.message) }
    finally { setExportingCSV(false) }
  }, [])

  const handleExportJSON = useCallback(async () => {
    setExportingJSON(true)
    try { await exportJSON(); toastService.success('Full backup created as JSON') }
    catch (err: any) { toastService.error('Backup failed', err?.message) }
    finally { setExportingJSON(false) }
  }, [])

  const handleChangePIN = useCallback(() => router.push('/change-pin' as any), [])

  const handleResetPremium = useCallback(async () => {
    const ok = await dialogueService.confirm({ title: 'Reset premium?', message: 'Remove premium entitlement for testing.', icon: '🧪', confirmLabel: 'Reset', destructive: true })
    if (!ok) return
    await clearEntitlement(); usePremiumStore.getState().setEntitlement(false, null)
    toastService.info('Premium reset', 'App is now in free mode')
  }, [])

  const handleResetApp = useCallback(async () => {
    const ok = await dialogueService.confirm({ title: 'Reset app?', message: 'This will delete your PIN and all settings. You will go through setup again.', icon: '⚠️', confirmLabel: 'Reset', destructive: true })
    if (!ok) return
    await deletePin(); await clearSetup()
    toastService.success('App reset — restarting setup')
    setTimeout(() => router.replace('/(onboarding)/setup-pin' as any), 800)
  }, [])

  const currentCurrency = CURRENCIES.find(c => c.code === settings?.currency)

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <Stack flex={1}>
        <Stack paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
          <Text variant="display" fontSize={22} color={Colors.textPrimary} letterSpacing={-0.5}>Settings</Text>
        </Stack>

        <StyledScrollView contentContainerStyle={{ paddingBottom: 48 }}>

          {/* Premium banner */}
          <Stack marginHorizontal={16} marginTop={12} marginBottom={4}>
            {!premium.isPremium ? (
              <StyledPressable borderRadius={20} overflow="hidden" onPress={() => router.push('/premium' as any)}>
                <Stack paddingVertical={18} paddingHorizontal={20} borderRadius={20} backgroundColor={Colors.primary}
                  style={{ shadowColor: Colors.primary, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
                  <Stack horizontal alignItems="center" justifyContent="space-between">
                    <Stack gap={4}>
                      <Stack horizontal alignItems="center" gap={8}>
                        <Text fontSize={20}>⚡</Text>
                        <Text fontSize={17} fontWeight="800" color="#fff">Upgrade to Premium</Text>
                      </Stack>
                      <Text variant="bodySmall" color="rgba(255,255,255,0.75)">Unlimited everything · All themes · Export</Text>
                    </Stack>
                    <Stack paddingVertical={8} paddingHorizontal={16} borderRadius={20} backgroundColor="rgba(255,255,255,0.2)">
                      <Text variant="label" fontSize={13} color="#fff">View →</Text>
                    </Stack>
                  </Stack>
                </Stack>
              </StyledPressable>
            ) : (
              <Stack borderRadius={16} padding={16} backgroundColor={Colors.accent} flexDirection="row" alignItems="center" gap={12}>
                <Text fontSize={22}>⚡</Text>
                <Stack flex={1}>
                  <Text variant="label" fontSize={14} color={Colors.primary}>Claro Premium</Text>
                  <Text variant="subLabel" color={Colors.textMuted}>{premium.plan === 'lifetime' ? 'Lifetime access' : `${premium.plan} subscription`}</Text>
                </Stack>
                <Text fontSize={18} color={Colors.primary}>✓</Text>
              </Stack>
            )}
          </Stack>

          {/* Appearance */}
          <SectionHeader label="Appearance" />
          <Stack marginHorizontal={16} flexDirection="row" gap={10}>
            {(Object.keys(THEME_META) as ThemeKey[]).map(key => {
              const meta   = THEME_META[key]
              const theme  = THEMES[key]
              const active = themeKey === key
              return (
                <StyledPressable key={key} onPress={() => setTheme(key)}
                  flex={1} alignItems="center" gap={8} paddingVertical={14} paddingHorizontal={8} borderRadius={16}
                  borderWidth={2} borderColor={active ? theme.primary : Colors.border}
                  backgroundColor={active ? theme.accent : Colors.bgCard}>
                  <Stack horizontal gap={3}>
                    {meta.preview.map((c, i) => <Stack key={i} width={14} height={14} borderRadius={7} backgroundColor={c} />)}
                  </Stack>
                  <StyledText fontSize={10} fontWeight="700" letterSpacing={0.8} color={active ? theme.primary : Colors.textMuted}>
                    {meta.label.toUpperCase()}
                  </StyledText>
                  {active && (
                    <Stack width={16} height={16} borderRadius={8} backgroundColor={theme.primary} alignItems="center" justifyContent="center">
                      <CheckIcon size={9} color={Colors.white} strokeWidth={3} />
                    </Stack>
                  )}
                </StyledPressable>
              )
            })}
          </Stack>

          {/* General */}
          <SectionHeader label="General" />
          <SettingsGroup>
            <SettingsRow
              icon={<IconPill bg={Colors.accent} icon={<TrendUpIcon size={18} color={Colors.primary} strokeWidth={2} />} />}
              label="Currency" value={currentCurrency ? `${currentCurrency.symbol} ${currentCurrency.code}` : '—'}
              onPress={() => setShowCurrency(true)} />
          </SettingsGroup>

          {/* Manage */}
          <SectionHeader label="Manage" />
          <SettingsGroup>
            <SettingsRow icon={<IconPill bg={Colors.accent} icon={<AccountsTabIcon size={18} color={Colors.primary} strokeWidth={2} />} />}
              label="Accounts" onPress={() => router.push('/(tabs)/accounts' as any)} />
            <RowDivider />
            <SettingsRow icon={<IconPill bg={Colors.accent} icon={<CategoriesTabIcon size={18} color={Colors.primary} strokeWidth={2} />} />}
              label="Categories" onPress={() => router.push('/(tabs)/categories' as any)} />
          </SettingsGroup>

          {/* Security */}
          <SectionHeader label="Security" />
          <SettingsGroup>
            <SettingsRow icon={<IconPill bg={Colors.accent} icon={<LockIcon size={18} color={Colors.primary} strokeWidth={2} />} />}
              label="Change PIN" onPress={handleChangePIN} />
            {bioAvailable && (
              <>
                <RowDivider />
                <SwitchRow icon={<IconPill bg={Colors.accent} icon={<FingerprintIcon size={18} color={Colors.primary} strokeWidth={2} />} />}
                  label="Face ID / Touch ID" subtitle="Unlock with biometrics" value={bioEnabled} onChange={handleBioToggle} />
              </>
            )}
          </SettingsGroup>

          {/* Data */}
          <SectionHeader label="Data" />
          <SettingsGroup>
            <SettingsRow
              icon={<IconPill bg={Colors.accent} icon={<CalendarIcon size={18} color={premium.canExport() ? Colors.primary : Colors.textMuted} strokeWidth={2} />} />}
              label="Export transactions" subtitle={exportingCSV ? 'Exporting…' : undefined}
              value={premium.canExport() ? 'CSV' : '🔒 Premium'}
              onPress={() => premium.canExport() && !exportingCSV ? handleExportCSV() : !premium.canExport() ? router.push('/premium' as any) : undefined}
              loading={exportingCSV} />
            <RowDivider />
            <SettingsRow
              icon={<IconPill bg={Colors.accent} icon={<CopyIcon size={18} color={premium.canExport() ? Colors.primary : Colors.textMuted} strokeWidth={2} />} />}
              label="Backup all data" subtitle={exportingJSON ? 'Creating backup…' : undefined}
              value={premium.canExport() ? 'JSON' : '🔒 Premium'}
              onPress={() => premium.canExport() && !exportingJSON ? handleExportJSON() : !premium.canExport() ? router.push('/premium' as any) : undefined}
              loading={exportingJSON} />
          </SettingsGroup>

          {/* About */}
          <SectionHeader label="About" />
          <SettingsGroup>
            <Stack flexDirection="row" alignItems="center" gap={14} paddingHorizontal={16} paddingVertical={13} backgroundColor={Colors.bgCard}>
              <IconPill bg={Colors.bgMuted} icon={<SettingsTabIcon size={18} color={Colors.textMuted} strokeWidth={1.8} />} />
              <Text flex={1} fontSize={15} fontWeight="600" color={Colors.textPrimary}>Version</Text>
              <Text variant="subLabel" color={Colors.textMuted}>1.0.0</Text>
            </Stack>
            <RowDivider />
            <Stack flexDirection="row" alignItems="center" gap={14} paddingHorizontal={16} paddingVertical={13} backgroundColor={Colors.bgCard}>
              <IconPill bg={Colors.bgMuted} icon={<BellIcon size={18} color={Colors.textMuted} strokeWidth={1.8} />} />
              <Text flex={1} fontSize={15} fontWeight="600" color={Colors.textPrimary}>Built with</Text>
              <Text variant="subLabel" color={Colors.textMuted}>fluent-styles</Text>
            </Stack>
          </SettingsGroup>

          {/* Danger zone */}
          <SectionHeader label="Danger Zone" />
          <SettingsGroup>
            <SettingsRow icon={<IconPill bg={Colors.expenseLight} icon={<DeleteIcon size={18} color={Colors.expense} strokeWidth={2} />} />}
              label="Reset app" onPress={handleResetApp} danger />
            {__DEV__ && (
              <>
                <RowDivider />
                <SettingsRow icon={<IconPill bg={Colors.bgMuted} icon={<Text fontSize={16}>🧪</Text>} />}
                  label="Reset premium (dev)" onPress={handleResetPremium} danger />
              </>
            )}
          </SettingsGroup>

        </StyledScrollView>

        <Popup visible={showCurrency} onClose={() => setShowCurrency(false)}
          title="Select Currency" showClose position="bottom" round roundRadius={20}>
          <CurrencyPicker current={settings?.currency ?? 'USD'} onSelect={handleCurrencySelect} />
        </Popup>
      </Stack>
    </StyledPage>
  )
}
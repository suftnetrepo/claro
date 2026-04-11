import React, { useState, useEffect, useCallback } from 'react'
import { router } from 'expo-router'
import { FlatList } from 'react-native'
import {
  Stack, StyledText, StyledPressable, StyledScrollView,
  StyledCard, StyledDivider, Switch, Popup,
} from 'fluent-styles'
import { toastService, dialogueService } from 'fluent-styles'
import {
  ChevronRightIcon, CheckIcon, LockIcon, FingerprintIcon,
  AccountsTabIcon, CategoriesTabIcon, SettingsTabIcon,
  DeleteIcon, TrendUpIcon, CalendarIcon, CopyIcon, BellIcon,
} from '../../icons'
import { Colors, useColors, CURRENCIES } from '../../constants'
import { THEMES, THEME_META, type ThemeKey } from '../../constants/themes'
import { useThemeStore } from '../../stores'
import { exportCSV, exportJSON } from '../../services/exportService'
import { useSettings } from '../../hooks'
import { useRecordsStore } from '../../stores'
import {
  isBiometricAvailable, isBiometricEnabled, setBiometricEnabled,
  hasPin, deletePin, clearSetup,
} from '../../utils/security'

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <StyledText
    fontSize={11} fontWeight="700" color={Colors.textMuted}
    letterSpacing={1}
    paddingHorizontal={20} paddingTop={24} paddingBottom={8}
  >
    {label.toUpperCase()}
  </StyledText>
)

// ─── Row — navigates or shows chevron ────────────────────────────────────────
const SettingsRow: React.FC<{
  icon:     React.ReactNode
  label:    string
  value?:   string
  onPress:  () => void
  danger?:  boolean
}> = ({ icon, label, value, onPress, danger = false }) => (
  <StyledPressable
    flexDirection="row" alignItems="center" gap={14}
    paddingHorizontal={20} paddingVertical={14}
    backgroundColor={Colors.bgCard}
    onPress={onPress}
  >
    <Stack width={28} height={28} alignItems="center" justifyContent="center">
      {icon}
    </Stack>
    <StyledText flex={1} fontSize={15} fontWeight="600"
      color={danger ? Colors.expense : Colors.textPrimary}>
      {label}
    </StyledText>
    {value ? (
      <StyledText fontSize={14} color={Colors.textMuted} marginRight={6}>{value}</StyledText>
    ) : null}
    <ChevronRightIcon size={16} color={Colors.textMuted} strokeWidth={2} />
  </StyledPressable>
)

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
      <StyledText fontSize={15} fontWeight="600" color={Colors.textPrimary}>{label}</StyledText>
      {subtitle ? (
        <StyledText fontSize={12} color={Colors.textMuted}>{subtitle}</StyledText>
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
            <StyledText fontSize={16} fontWeight="700" color={Colors.primary}>
              {item.symbol}
            </StyledText>
          </Stack>
          <Stack flex={1} gap={2}>
            <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>{item.code}</StyledText>
            <StyledText fontSize={12} color={Colors.textMuted}>{item.name}</StyledText>
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
  const { themeKey, setTheme } = useThemeStore()
  const { data: settings, update: updateSettings } = useSettings()
  const { invalidateData } = useRecordsStore()

  const [bioAvailable,  setBioAvailable]  = useState(false)
  const [bioEnabled,    setBioEnabledState] = useState(false)
  const [showCurrency,  setShowCurrency]  = useState(false)
  const [exporting,     setExporting]     = useState(false)

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
    setExporting(true)
    try {
      await exportCSV()
    } catch (err: any) {
      toastService.error('Export failed', err?.message)
    } finally {
      setExporting(false)
    }
  }, [])

  const handleExportJSON = useCallback(async () => {
    setExporting(true)
    try {
      await exportJSON()
    } catch (err: any) {
      toastService.error('Backup failed', err?.message)
    } finally {
      setExporting(false)
    }
  }, [])

  // ─── Change PIN ────────────────────────────────────────────────────────────
  const handleChangePIN = useCallback(() => {
    router.push('/change-pin' as any)
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
    <Stack flex={1} backgroundColor={Colors.bg}>

      <Stack paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
        <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>
          Settings
        </StyledText>
      </Stack>

      <StyledScrollView contentContainerStyle={{ paddingBottom: 48 }}>

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
                <StyledText fontSize={11} fontWeight="700"
                  color={active ? theme.primary : Colors.textMuted}>
                  {meta.label}
                </StyledText>
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
            icon={<CalendarIcon size={20} color={Colors.primary} strokeWidth={2} />}
            label={exporting ? 'Exporting…' : 'Export transactions'}
            value="CSV"
            onPress={handleExportCSV}
          />
          <StyledDivider borderBottomColor={Colors.border} marginLeft={62} />
          <SettingsRow
            icon={<CopyIcon size={20} color={Colors.primary} strokeWidth={2} />}
            label={exporting ? 'Backing up…' : 'Backup all data'}
            value="JSON"
            onPress={handleExportJSON}
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
  )
}
import { create }          from 'zustand'
import { subMonths, addMonths } from 'date-fns'
import * as SecureStore     from 'expo-secure-store'
import type { Account, Category, Transaction, Budget, Settings } from '../db/schema'
import type { ThemeKey }    from '../constants/themes'

// ─── Auth store ───────────────────────────────────────────────────────────────

interface AuthState {
  isLocked:           boolean
  isSetupComplete:    boolean
  biometricAvailable: boolean
  biometricType:      'face' | 'fingerprint' | 'none'
  pinAttempts:        number
  lockedUntil:        Date | null

  setLocked:             (v: boolean) => void
  setSetupComplete:      (v: boolean) => void
  setBiometricAvailable: (v: boolean) => void
  setBiometricType:      (v: 'face' | 'fingerprint' | 'none') => void
  incrementPinAttempts:  () => void
  resetPinAttempts:      () => void
  setLockedUntil:        (d: Date | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLocked:           true,
  isSetupComplete:    false,
  biometricAvailable: false,
  biometricType:      'none',
  pinAttempts:        0,
  lockedUntil:        null,

  setLocked:             (v) => set({ isLocked: v }),
  setSetupComplete:      (v) => set({ isSetupComplete: v }),
  setBiometricAvailable: (v) => set({ biometricAvailable: v }),
  setBiometricType:      (v) => set({ biometricType: v }),
  incrementPinAttempts:  ()  => {
    const attempts   = get().pinAttempts + 1
    const lockedUntil = attempts >= 5 ? new Date(Date.now() + 30_000) : null
    set({ pinAttempts: attempts, lockedUntil })
  },
  resetPinAttempts:  () => set({ pinAttempts: 0, lockedUntil: null }),
  setLockedUntil:    (d) => set({ lockedUntil: d }),
}))

// ─── Settings store ───────────────────────────────────────────────────────────

interface SettingsState {
  settings:       Settings | null
  setSettings:    (s: Settings) => void
  updateSettings: (partial: Partial<Settings>) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings:       null,
  setSettings:    (s)       => set({ settings: s }),
  updateSettings: (partial) => set((state) => ({
    settings: state.settings ? { ...state.settings, ...partial } : null,
  })),
}))

// ─── Records store ────────────────────────────────────────────────────────────

interface RecordsState {
  selectedMonth: Date
  viewMode:      'daily' | 'weekly' | 'monthly' | '3months' | '6months' | 'yearly'
  dataVersion:   number

  prevMonth:      () => void
  nextMonth:      () => void
  setViewMode:    (mode: RecordsState['viewMode']) => void
  goToMonth:      (date: Date) => void
  invalidateData: () => void
}

export const useRecordsStore = create<RecordsState>((set) => ({
  selectedMonth: new Date(),
  viewMode:      'monthly',
  dataVersion:   0,

  prevMonth:      () => set((s) => ({ selectedMonth: subMonths(s.selectedMonth, 1) })),
  nextMonth:      () => set((s) => ({ selectedMonth: addMonths(s.selectedMonth, 1) })),
  setViewMode:    (mode) => set({ viewMode: mode }),
  goToMonth:      (date) => set({ selectedMonth: date }),
  invalidateData: ()     => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}))

// ─── UI store ─────────────────────────────────────────────────────────────────

interface UIState {
  isAddTransactionOpen: boolean
  activeTab:            string
  openAddTransaction:   () => void
  closeAddTransaction:  () => void
  setActiveTab:         (tab: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  isAddTransactionOpen: false,
  activeTab:            'records',
  openAddTransaction:  () => set({ isAddTransactionOpen: true }),
  closeAddTransaction: () => set({ isAddTransactionOpen: false }),
  setActiveTab:        (tab) => set({ activeTab: tab }),
}))

// ─── Theme store ──────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = 'claro_theme'

interface ThemeState {
  themeKey:  ThemeKey
  setTheme:  (key: ThemeKey) => void
  loadTheme: () => Promise<void>
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeKey: 'forest',
  setTheme: (key) => {
    set({ themeKey: key })
    SecureStore.setItemAsync(THEME_STORAGE_KEY, key).catch(() => {})
  },
  loadTheme: async () => {
    try {
      const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY)
      if (saved) set({ themeKey: saved as ThemeKey })
    } catch {}
  },
}))
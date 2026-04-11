import { palettes } from 'fluent-styles'
import { ForestTheme } from './themes'

export const APP_NAME = 'Claro'

// ─── Typography ───────────────────────────────────────────────────────────────
export const Fonts = {
  regular:    'PlusJakartaSans_400Regular',
  medium:     'PlusJakartaSans_500Medium',
  semiBold:   'PlusJakartaSans_600SemiBold',
  bold:       'PlusJakartaSans_700Bold',
  extraBold:  'PlusJakartaSans_800ExtraBold',
} as const


// ─── App colors — all from palettes ──────────────────────────────────────────
export { useColors } from './useColors'

// Static fallback — used in non-React contexts (tab bar, StyleSheet, etc.)
export const Colors = ForestTheme

// ─── Category colors — from palettes ─────────────────────────────────────────
export const CategoryColors = {
  food:           palettes.red[800],
  car:            palettes.purple[900],
  shopping:       palettes.blue[900],
  health:         palettes.red[800],
  home:           palettes.pink[900],
  bills:          palettes.coolGray[900],
  entertainment:  palettes.violet[900],
  education:      palettes.blue[800],
  transportation: palettes.indigo[900],
  telephone:      palettes.yellow[800],
  clothing:       palettes.orange[800],
  insurance:      palettes.orange[900],
  social:         palettes.green[800],
  sport:          palettes.lime[800],
  baby:           palettes.warmGray[700],
  tax:            palettes.orange[900],
  beauty:         palettes.pink[800],
  electronics:    palettes.teal[800],
  pet:            palettes.warmGray[800],
  travel:         palettes.blue[700],
  rent:           palettes.blueGray[700],
  utilities:      palettes.yellow[900],
  gym:            palettes.green[700],
  coffee:         palettes.warmGray[700],
  restaurant:     palettes.red[700],
  subscriptions:  palettes.teal[700],
  medicine:       palettes.red[700],
  grocery:        palettes.green[600],
  fuel:           palettes.violet[800],
  repair:         palettes.blueGray[600],
  charity:        palettes.pink[700],
  salary:         palettes.green[900],
  investment:     palettes.blue[900],
  gift:           palettes.pink[900],
  freelance:      palettes.teal[800],
  rental_income:  palettes.blueGray[700],
  business:       palettes.violet[900],
  bonus:          palettes.yellow[800],
  refund:         palettes.blue[700],
  dividend:       palettes.green[800],
  other:          palettes.blueGray[500],
} as const

export const AccountColors = {
  cash:           palettes.green[700],
  card:           palettes.blue[800],
  savings:        palettes.pink[800],
  bank:           palettes.blue[900],
  wallet:         palettes.orange[800],
  crypto:         palettes.yellow[800],
  investment_acc: palettes.green[900],
} as const

// ─── Currencies ───────────────────────────────────────────────────────────────

export const IconColorPalette = [
  palettes.red[800],     palettes.pink[800],    palettes.violet[800],  palettes.blue[800],
  palettes.blue[700],    palettes.teal[700],    palettes.green[700],   palettes.lime[700],
  palettes.yellow[800],  palettes.orange[800],  palettes.orange[900],  palettes.blueGray[600],
  palettes.coolGray[700],palettes.blueGray[700],palettes.purple[800],  palettes.indigo[700],
  palettes.cyan[700],    palettes.emerald[700], palettes.rose[700],    palettes.warmGray[700],
]

export const CURRENCIES = [
  { code: 'USD', symbol: '$',   name: 'US Dollar' },
  { code: 'EUR', symbol: '€',   name: 'Euro' },
  { code: 'GBP', symbol: '£',   name: 'British Pound' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$',  name: 'Canadian Dollar' },
  { code: 'CHF', symbol: '₣',   name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥',   name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$',   name: 'Mexican Peso' },
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: '₵',   name: 'Ghanaian Cedi' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SEK', symbol: 'kr',  name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr',  name: 'Norwegian Krone' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
] as const

export type CurrencyCode = typeof CURRENCIES[number]['code']

// ─── Storage keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  PIN_HASH:          'claro_pin_hash',
  BIOMETRIC_ENABLED: 'claro_biometric',
  SETUP_COMPLETE:    'claro_setup_complete',
  CURRENCY:          'claro_currency',
  LOCK_ON_BG:        'claro_lock_on_bg',
} as const

// ─── App config ───────────────────────────────────────────────────────────────
export const CONFIG = {
  PIN_LENGTH:          4,
  LOCK_AFTER_BG_SECS:  300,
  MAX_PIN_ATTEMPTS:    5,
  LOCKOUT_DURATION_MS: 30000,
} as const

export * from './themes'
// ─── Product identifiers (match RevenueCat setup) ──────────────────────────────
export const PREMIUM_PRODUCTS = {
  MONTHLY:   'claro_premium_monthly_v2',
  YEARLY:    'claro_premium_yearly_v2',
  LIFETIME:  'claro_premium_lifetime_v2',
} as const

// ─── Pricing display (update to match App Store prices) ───────────────────────
export const PREMIUM_PRICING = {
  MONTHLY:   { price: '£4.99', period: 'per month',  label: 'Monthly'  },
  YEARLY:    { price: '£29.99', period: 'per year',   label: 'Yearly', saving: 'Save 50%', trial: '7-day free trial' },
  ONE_TIME:  { price: '£59.99', period: 'one-time',   label: 'Lifetime' },
} as const

// ─── Free tier limits ──────────────────────────────────────────────────────────
export const FREE_LIMITS = {
  ACCOUNTS:            5,
  BUDGETS:             3,
  TRANSACTIONS_MONTH:  100,
  CATEGORIES:          20,
} as const

// ─── Feature list shown on paywall ────────────────────────────────────────────
export const PREMIUM_FEATURES = [
  { icon: '🧾', title: 'Scan Receipts Instantly', description: "Point your camera at any receipt — we'll fill in the amount, date, and category automatically." },
  { icon: '🔓', title: 'Unlimited Receipt Scans', description: 'Free users get 10 scans/month. Premium gives you unlimited.' },
  { icon: '💳', title: 'Unlimited accounts',     description: 'Add as many accounts as you need' },
  { icon: '🎯', title: 'Unlimited budgets',       description: 'Budget every category you spend on' },
  { icon: '♾️', title: 'Unlimited transactions',  description: 'No monthly cap on entries' },
  { icon: '🎨', title: 'All themes',              description: 'Ocean, Sunset and Midnight themes' },
  { icon: '📊', title: 'Backup & restore',        description: 'Full JSON backup and restore' },
  { icon: '📈', title: 'Advanced analysis',       description: 'Deeper spending trends and insights' },
  { icon: '🔄', title: 'Future features',         description: 'Recurring transactions, widgets & more' },
] as const

// ─── Locked theme keys ─────────────────────────────────────────────────────────
export const PREMIUM_THEMES = ['ocean', 'sunset', 'midnight'] as const

// ─── SecureStore key ──────────────────────────────────────────────────────────
export const PREMIUM_STORAGE_KEY = 'claro_premium_entitlement'

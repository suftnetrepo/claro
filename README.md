# Claro — Personal Finance App

> **Your finances, clarified.**
> A beautiful, offline-first personal finance app built with React Native and Expo.

[![Expo](https://img.shields.io/badge/Expo-52.0-black?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.76-blue?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://typescriptlang.org)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Premium / Monetisation](#premium--monetisation)
- [Themes](#themes)
- [Getting Started](#getting-started)
- [Going Live](#going-live)
- [What's Next](#whats-next)
- [Known Limitations](#known-limitations)

---

## Overview

Claro is a fully offline personal finance app. No accounts, no cloud sync, no data sharing. Everything lives in a local SQLite database on the user's device, secured behind a PIN and optional biometrics.

Built from scratch — ~7,200 lines of TypeScript across 50+ files.

---

## Features

### Core
- 🔐 **PIN protection** — SHA256-hashed PIN in SecureStore, biometric unlock (Face ID / Touch ID)
- 💰 **Transactions** — expense, income, transfer between accounts with calculator keypad
- 🏦 **Accounts** — multiple accounts with custom icons and colours, balance auto-updates
- 🏷️ **Categories** — 42 pre-seeded categories with custom SVG icons, fully customisable
- 📊 **Budgets** — per-category monthly budget with progress bars and alerts
- 📈 **Analysis** — spending by category, income/expense trends, 6-month bar chart
- 💱 **Multi-currency** — 150+ currencies, chosen during onboarding
- 🔄 **Transfers** — move money between accounts, both balances update atomically

### UI / UX
- 🎨 **4 themes** — Forest (green), Ocean (blue), Sunset (orange), Midnight (dark)
- 🔤 **Plus Jakarta Sans** — loaded via Expo Google Fonts
- ↕️ **Swipe to delete** — transactions and budgets
- 📱 **Home screen** — total balance card with month nav, expense/income summary, latest transactions
- 🔔 **Toast & dialogue system** — imperative services, work above modal screens

### Data
- 📤 **Export CSV** — all transactions as a spreadsheet (Excel / Numbers)
- 💾 **JSON backup** — full snapshot of all data
- 🔄 **Native share sheet** — AirDrop, Files, email, Drive

### Premium
- ⚡ **Freemium model** — free tier with generous limits, premium unlocks everything
- 💳 **Mock payment sheet** — simulates Apple dialog for pre-App Store testing
- 🔒 **Feature gates** — accounts, budgets, themes, export gated behind paywall
- 🔁 **RevenueCat-ready** — 4 stub functions to swap, nothing else changes

---

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | Expo | ~52.0 |
| Navigation | Expo Router | ~4.0 |
| UI components | fluent-styles | latest |
| Database | expo-sqlite + Drizzle ORM | ~15.0 / ^0.38 |
| State management | Zustand | ^5.0 |
| Auth | expo-secure-store + expo-local-authentication | ~14.0 / ~15.0 |
| Fonts | @expo-google-fonts/plus-jakarta-sans | ^0.4 |
| Date utilities | date-fns | ^3.6 |
| Gestures | react-native-gesture-handler | ~2.20 |
| SVG | react-native-svg | 15.8 |
| Animations | react-native-reanimated | ~3.16 |
| Export | expo-file-system + expo-sharing | ~18.0 / ~13.0 |
| Crypto | crypto-js | ^4.2 |

---

## Project Structure

```
claro/
├── app/                              ← Expo Router routes
│   ├── _layout.tsx                   ← Root layout, bootstrap, font loading
│   ├── (tabs)/                       ← Bottom tab screens
│   │   ├── records.tsx               ← Home tab
│   │   ├── analysis.tsx
│   │   ├── budgets.tsx
│   │   ├── settings.tsx
│   │   ├── accounts.tsx              ← href:null (via Settings)
│   │   └── categories.tsx            ← href:null (via Settings)
│   ├── (onboarding)/                 ← PIN setup + currency
│   ├── (lock)/                       ← Lock screen
│   ├── add-transaction.tsx           ← Modal
│   ├── edit-transaction.tsx          ← Modal
│   ├── add-account.tsx               ← Modal
│   ├── add-category.tsx              ← Modal
│   ├── set-budget.tsx                ← Modal
│   ├── change-pin.tsx                ← Modal
│   └── premium.tsx                   ← Paywall modal
│
├── src/
│   ├── constants/
│   │   ├── index.ts                  ← Colors, Fonts, STORAGE_KEYS, CONFIG
│   │   ├── themes.ts                 ← 4 theme objects + THEME_META
│   │   ├── useColors.ts              ← useColors() hook (separate file: avoids circular dep)
│   │   └── premium.ts                ← Limits, product IDs, pricing, feature list
│   │
│   ├── db/
│   │   ├── schema.ts                 ← Drizzle table definitions + TypeScript types
│   │   ├── migrations.ts             ← SQL migration strings array
│   │   ├── seed.ts                   ← 42 default categories + 3 starter accounts
│   │   └── index.ts                  ← openDatabaseSync + PRAGMA foreign_keys ON
│   │
│   ├── stores/
│   │   └── index.ts                  ← AuthStore, SettingsStore, RecordsStore,
│   │                                    UIStore, ThemeStore, PremiumStore
│   │
│   ├── hooks/
│   │   ├── useAsync.ts               ← Generic async state: { data, loading, error, refetch }
│   │   ├── useAccounts.ts
│   │   ├── useCategories.ts
│   │   ├── useTransactions.ts        ← Grouped by date, totals, filtered by month
│   │   ├── useBudgets.ts             ← With spent amounts per category
│   │   ├── useAnalysis.ts            ← Category breakdown + trend data
│   │   ├── useSettings.ts
│   │   └── usePremium.ts             ← isPremium, buy/restore, canAdd* guards
│   │
│   ├── services/
│   │   ├── accountService.ts         ← CRUD + balance recalculation
│   │   ├── categoryService.ts
│   │   ├── transactionService.ts     ← Creates tx + updates account balance atomically
│   │   ├── budgetService.ts          ← Budget CRUD + spent calculation
│   │   ├── settingsService.ts
│   │   ├── exportService.ts          ← CSV + JSON via expo-sharing
│   │   └── premiumService.ts         ← Entitlement read/write + RevenueCat stubs
│   │
│   ├── screens/
│   │   ├── transactions/             ← RecordsScreen, AddTransaction, EditTransaction,
│   │   │                                Calculator, AccountPicker, CategoryPicker
│   │   ├── accounts/                 ← AccountsScreen, AddAccountScreen
│   │   ├── categories/               ← CategoriesScreen, AddCategoryScreen
│   │   ├── budgets/                  ← BudgetsScreen, SetBudgetScreen
│   │   ├── analysis/                 ← AnalysisScreen (Spending / Income / Trends tabs)
│   │   ├── settings/                 ← SettingsScreen, ChangePINScreen
│   │   ├── onboarding/               ← SetupPINScreen, CurrencyScreen
│   │   ├── lock/                     ← LockScreen (PIN + biometric)
│   │   └── premium/                  ← PremiumScreen, PremiumGate, MockPaymentSheet
│   │
│   ├── components/
│   │   ├── ModalHeader.tsx           ← Reusable close + title + save header
│   │   ├── ColorPicker.tsx
│   │   ├── IconPicker.tsx
│   │   └── SwipeableRow.tsx          ← Swipe-to-delete via gesture handler
│   │
│   ├── icons/
│   │   ├── ui/                       ← 24 custom SVG UI icons (Add, Close, Check, etc.)
│   │   ├── navigation/               ← 6 tab bar icons
│   │   ├── categories/               ← 40+ category SVG icons
│   │   ├── accounts/                 ← Account type icons
│   │   └── map/                      ← IconCircle — renders any icon in a coloured circle
│   │
│   └── utils/
│       ├── index.ts                  ← formatCurrency, formatDate, formatShortDate, etc.
│       ├── security.ts               ← PIN hash/verify, biometric, setup flags, clearSetup
│       └── devReset.ts               ← DEV ONLY: wipe all SecureStore keys
│
├── assets/
│   ├── icon.png                      ← 1024×1024 app icon (green C + trend arrow)
│   ├── adaptive-icon.png             ← Android adaptive icon
│   └── splash.png                    ← 1242×2436 full-bleed splash
│
├── GOING_LIVE.md                     ← RevenueCat + App Store step-by-step guide
└── README.md                         ← This file
```

---

## Architecture

```
UI Screens
    │  call
    ▼
Hooks  (useAccounts, useTransactions, usePremium…)
    │  call
    ▼
Services  (accountService, transactionService…)
    │  query
    ▼
Database  (Drizzle ORM → expo-sqlite → claro.db)
```

### Key Design Decisions

**No SQL in screens** — screens call hooks only. Hooks call services. Services own all SQL.

**`dataVersion` refresh pattern** — `useRecordsStore` has a `dataVersion` counter. After any mutation, call `invalidateData()` to increment it. All hooks include `dataVersion` in their `useAsync` dependency array, triggering an automatic refetch.

**Imperative services for modals** — `toastService`, `dialogueService`, `loaderService` from fluent-styles use a global portal singleton. This means they work correctly inside modal screens which sit above the React tree's `PortalManager`.

**Circular dependency prevention** — `useColors()` lives in `constants/useColors.ts` (not `constants/index.ts`) because `index.ts` imports from `themes.ts`, and if `useColors` also imported from `stores`, it would create a cycle. The separate file breaks it.

**`__DEV__` guards** — dev-only UI (mock payment badge, reset premium row) is wrapped in `__DEV__` checks. These evaluate to `false` in production/release builds automatically via Metro bundler, with zero runtime cost.

---

## Database Schema

```
accounts          id, name, icon, color, balance, initialAmount, isDefault
categories        id, name, icon, color, type (expense|income), isDefault
transactions      id, type, amount, date, notes
                  accountId  →  accounts.id   (CASCADE DELETE)
                  categoryId →  categories.id  (SET NULL on delete)
                  toAccountId → accounts.id   (SET NULL on delete, transfers)
budgets           id, categoryId, month (YYYY-MM), limitAmount
                  UNIQUE(month, categoryId)
settings          singleton row: currency, currencySymbol, viewMode, carryOver
```

> **Important:** `PRAGMA foreign_keys = ON` is set every time the database opens (`db/index.ts`). SQLite disables foreign key enforcement by default — without this one line, `onDelete: 'cascade'` is silently ignored and deleting an account would leave orphaned transactions.

---

## Premium / Monetisation

### Free Tier Limits

| Feature | Free | Premium |
|---|---|---|
| Accounts | 3 | Unlimited |
| Budgets | 1 | Unlimited |
| Transactions | 50 / month | Unlimited |
| Categories | 20 | Unlimited |
| Themes | Forest only | All 4 |
| Export CSV | ✗ | ✓ |
| JSON Backup | ✗ | ✓ |

### Pricing

| Plan | Price | Notes |
|---|---|---|
| Monthly | £0.99 / month | Cancel anytime |
| Yearly | £5.99 / year | 7-day free trial · Save 50% |
| Lifetime | £3.99 one-time | **Best value** |

### Implementation Flow

```
User taps locked feature
    → PremiumGate / PremiumBanner shows upgrade prompt
    → router.push('/premium')
    → PremiumScreen (paywall) opens as modal
    → User selects plan → taps CTA
    → MockPaymentSheet slides up (dev) / RevenueCat sheet (prod)
    → On confirm → premiumService.grantEntitlement()
    → usePremiumStore.setEntitlement(true, plan)
    → All gates re-render → features unlock immediately
```

### Files Involved

| File | Role |
|---|---|
| `constants/premium.ts` | Limits, product IDs, pricing display, feature list |
| `services/premiumService.ts` | SecureStore entitlement R/W + 4 RevenueCat stubs |
| `hooks/usePremium.ts` | `isPremium`, `canAdd*()` guards, buy/restore actions |
| `stores/index.ts` → `usePremiumStore` | Reactive Zustand state, loaded on bootstrap |
| `screens/premium/PremiumScreen.tsx` | Paywall UI |
| `screens/premium/PremiumGate.tsx` | `<PremiumGate>` + `<PremiumBanner>` components |
| `screens/premium/MockPaymentSheet.tsx` | Dev-only fake Apple payment dialog |

---

## Themes

| Key | Name | Brand | Background | Status |
|---|---|---|---|---|
| `forest` | Forest 🌿 | `green[700]` | Warm gray | Free |
| `ocean` | Ocean 🌊 | `blue[700]` | Cool blue gray | Premium |
| `sunset` | Sunset 🌅 | `orange[700]` | Warm cream | Premium |
| `midnight` | Midnight 🌙 | `indigo[400]` | Dark surfaces | Premium |

Theme is persisted to SecureStore key `claro_theme` and loaded during app bootstrap before first render.

---

## Getting Started

### Prerequisites
- Node.js 18+
- Xcode (iOS Simulator) or Android Studio
- `npm install -g expo-cli eas-cli`

### Install & Run

```bash
git clone <your-repo>
cd claro
npm install
npx expo start --clear
```

Press `i` for iOS simulator, `a` for Android.

### First Run Flow
1. PIN setup screen (4-digit PIN)
2. Currency selection (150+ currencies)
3. Home screen — seed data runs automatically
   - 3 starter accounts: Cash, Card, Savings
   - 42 default categories (expense + income)

### Dev Utilities

```bash
# Reset everything (PIN, data, all settings)
Settings → Danger Zone → Reset app

# Reset premium only (test paywall repeatedly)
Settings → Danger Zone → 🧪 Reset premium (dev)

# Programmatic wipe
import { resetAll } from './src/utils/devReset'
await resetAll()
```

---

## Going Live

Full step-by-step in **`GOING_LIVE.md`**. High-level:

1. **App Store Connect** — create app (`com.claro.finance`), add 3 IAP products, submit for review
2. **RevenueCat** — create project, link IAP products, get SDK key
3. **Install**: `npm install react-native-purchases`
4. **Swap**: replace 4 `REVENUECAT_SWAP` stubs in `premiumService.ts` with RevenueCat calls
5. **Clean up**: delete `MockPaymentSheet.tsx`, remove dev-only rows
6. **Build**: `eas build --platform ios`
7. **Submit**: `eas submit --platform ios`

The `__DEV__` guards on mock UI mean steps 5 is optional for the first submission — the orange badge and reset button are invisible in production builds.

---

## What's Next

### v1.1 — Polish (2–4 weeks)
- [ ] **Search transactions** — full-text search by notes, category, account, amount
- [ ] **Transaction filters** — by account, category, type, date range
- [ ] **Edit transaction polish** — match Add Transaction UI fully (coloured header, calculator)
- [ ] **Haptic feedback** — PIN entry, swipe delete, save success
- [ ] **Better empty states** — illustrated per-screen empty views
- [ ] **Onboarding improvements** — skip currency, change later easily

### v1.2 — Power Features (1–2 months)
- [ ] **Recurring transactions** ⭐ Premium — weekly/monthly repeating entries
- [ ] **Budget carry-over** — roll unspent budget forward
- [ ] **Net worth view** — assets vs liabilities, over time
- [ ] **Receipt photos** — attach camera image to any transaction
- [ ] **Split transactions** — one payment split across multiple categories
- [ ] **Tags** — free-form labels across transactions

### v1.3 — Platform (2–3 months)
- [ ] **iCloud sync** ⭐ Premium — CloudKit backup so data survives device loss
- [ ] **Android release** — Play Store submission, Android-specific UI polish
- [ ] **Home screen widget** — today's spending, current balance
- [ ] **Siri Shortcuts** — "Add £5 expense to Coffee"
- [ ] **Lock screen widget** — glanceable balance

### v2.0 — Growth (3–6 months)
- [ ] **CSV import** — paste in bank statement, auto-categorise
- [ ] **Open Banking** (UK) — TrueLayer integration for auto-import (premium)
- [ ] **Savings goals** — set a target, track progress
- [ ] **Family sharing** — shared view across a household
- [ ] **Web companion** — read-only dashboard at claro.finance

### Technical Debt
- [ ] Unit tests for `transactionService` balance logic (most critical)
- [ ] Error boundaries around each screen
- [ ] Sentry or similar for production crash reporting
- [ ] E2E tests (Maestro) for: add transaction → verify balance, PIN lock flow
- [ ] Remove `devReset.ts` or ensure it's tree-shaken in production
- [ ] Audit `console.log` — replace with proper logger

---

## Known Limitations

| Limitation | Impact | Notes |
|---|---|---|
| Fully offline — no sync | Data lost if device wiped without backup | Intentional for v1; iCloud in v1.3 |
| PIN is not recoverable | Must reset app if PIN forgotten | SHA256 hash, by design |
| 50 transactions/month free limit | Power users hit limit quickly | Adjust in `constants/premium.ts` |
| Export requires manual action | No automatic backup | Export button in Settings |
| Analysis charts not screen-reader accessible | Accessibility gap | Fix in v1.2 |
| Theme doesn't affect status bar in all cases | Minor cosmetic | Known Expo limitation |
| `PRAGMA foreign_keys` needed each open | SQLite default | Already fixed in `db/index.ts` |

---

*Built with [fluent-styles](https://www.npmjs.com/package/fluent-styles), [Expo](https://expo.dev), [Drizzle ORM](https://orm.drizzle.team) and a lot of iteration.*
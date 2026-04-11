# Claro — Personal Finance App

Standalone offline money management app built with Expo + SQLite + fluent-styles.

---

## Run instructions

### Step 1 — Copy to your dev folder

```bash
cp -r /path/to/claro ~/dev/claro
cd ~/dev/claro
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Start the app

```bash
npx expo start
```

Then scan the QR code with **Expo Go** on your phone.

> **Note:** `react-native-mmkv` and `expo-local-authentication` work in Expo Go on a real device.
> On iOS simulator, Face ID won't work but PIN works fine.

---

## First launch flow

```
App opens → SetupPIN screen → Enter 4-digit PIN twice
         → Currency screen   → Pick your currency
         → Records screen    → Start tracking!
```

Every subsequent launch:
```
App opens → Lock screen → Enter PIN (or Face ID / Touch ID)
          → Records screen
```

---

## Project structure

```
claro/
├── app/                    Expo Router pages
│   ├── _layout.tsx         Bootstrap: migrations → seed → auth routing
│   ├── (onboarding)/       setup-pin + currency
│   ├── (lock)/             PIN + biometric lock screen
│   └── (tabs)/             5-tab main app
└── src/
    ├── constants/          Colors, currencies, storage keys
    ├── icons/              50+ SVG icons (no external icon deps)
    ├── db/                 SQLite schema, migrations, seed data
    ├── stores/             Zustand: auth, settings, records, UI
    ├── hooks/              Data hooks: transactions, accounts,
    │                       categories, budgets, analysis, settings
    ├── utils/              security (PIN/biometric), currency, dates
    └── screens/            All screen components
```

---

## What works in Phase 1

- ✅ PIN setup + biometric unlock
- ✅ Currency selection (20 currencies)
- ✅ SQLite database with migrations
- ✅ 42 default categories seeded
- ✅ 3 default accounts seeded (Cash, Card, Savings)
- ✅ Records screen — month navigation, grouped transactions, summary
- ✅ Analysis screen — spending by category with progress bars
- ✅ Budgets screen — budgeted categories with progress, unbudgeted list
- ✅ Accounts screen — balance list, delete with confirmation
- ✅ Categories screen — tabbed expense/income, icon + color

## Phase 2 will add

- Add / Edit transaction screen with custom calculator keypad
- Account + category modals (add/edit)
- Set budget modal
- Bar/pie charts in Analysis
- Display options sheet (view mode, carry over)
- Settings screen (change PIN, currency, biometric)

# Claro Production Architecture: Before & After

## Current State (Beta) vs. Target State (Production)

---

## SYSTEM 1: Typography Architecture

### CURRENT (Before Phase 1)

```
User sees text on screen
           ↓
Components use StyledText
           ↓
Raw props (fontSize, fontWeight, color)
           ↓
No semantic meaning
           ↓
Inconsistent across app (50+ different combinations)
           ↓
Hard to maintain (change heading size = find all PremiumScreen instances)
           ↓
Theme changes = lots of prop updates across files

Problems:
❌ Prop bloat: <StyledText fontSize={24} fontWeight="800" color={...}>
❌ Inconsistency: Some screens use 20px for title, others use 22px
❌ Maintenance: 50+ instances to update if design changes
❌ No semantic meaning: Impossible to audit "what's a heading vs body?"
```

### TARGET (After Phase 1)

```
User sees text on screen
           ↓
Components use Text component (Vela's)
           ↓
Semantic variants (hero, display, header, title, subtitle, body, etc.)
           ↓
Automatic font mapping + consistent sizing
           ↓
<Text variant="header">My Title</Text>
           ↓
Unified system across app
           ↓
Minor theme changes = 1 place to update
           ↓
Major theme changes = easy to preview & rollout

Benefits:
✅ Clean props: <Text variant="header" color={...}>
✅ Consistency: All headers = same 24/700 size
✅ Maintenance: 50+ instances → 1 definition
✅ Semantic clarity: Can audit "headings vs body vs labels"
✅ Extensibility: Add "metric_small" variant once, already available everywhere
✅ Brand polish: Matches Vela's professional typography system
```

### Variant Hierarchy

```
User Interface Hierarchy:

hero (56px/800)     ← Splash screens, major welcome text
    ↓
display (32px/800)  ← Very prominent display text
    ↓
header (24px/700)   ← Main section headings
    ↓
title (20px/700)    ← Card titles, modal headers
    ↓
subtitle (16px/600) ← Section subheadings
    ↓
label (14px/600)    ← Field labels, emphasized UI
    ↓
button (14px/700)   ← CTA button labels
    ↓
body (14px/400)     ← Default readable content
    ↓
subLabel (12px/500) ← Helper text, metadata
    ↓
bodySmall (12px/400)← Compact copy
    ↓
caption (11px/400)  ← Tiny support text
    ↓
overline (12px/700) ← Section markers (UPPERCASE)
    ↓
metric (18px/800)   ← Prominent numbers
```

### File Size Impact

```
Before: Scattered props across 50+ instances
After:  Centralized 170-line Text.tsx component

Benefit: Smaller bundle + DRY principle
```

---

## SYSTEM 2: Premium Architecture

### CURRENT (Before Phase 2)

```
User taps "Buy Premium"
          ↓
Opens MockPaymentSheet (fake UI)
          ↓
Simulates 1.5s delay
          ↓
Calls premiumService.purchaseMonthly()
          ↓
Mock: grantEntitlement('monthly')
          ↓
Writes mock data to SecureStore
          ↓
State updates → features unlock
          ↓
Close app → reopen → premium persists (mock cache)

Problems:
❌ MockPaymentSheet is confusing — users think real billing works
❌ grantEntitlement() is for DEV ONLY, no network validation
❌ App Store review would reject this (simulated payments)
❌ Restore purchases returns false (completely stubbed)
❌ restorePurchases() is fake — doesn't check real store
❌ No real entitlements from RevenueCat — just local mocks
❌ No way to revoke access if user refunds (store doesn't know)
❌ RevenueCat NOT initialized — unable to connect to real store

Diagram:
    PremiumScreen
         ↓ (taps Buy)
    MockPaymentSheet ← FAKE UI
         ↓ (confirms)
    premiumService.purchaseMonthly()
         ↓
    grantEntitlement() ← LOCAL MOCK
         ↓
    SecureStore.setItem() ← LOCAL CACHE
         ↓
    State update → unlock features

Result: Works in dev, breaks on real App Store
```

### TARGET (After Phase 2)

```
User taps "Buy Premium"
          ↓
Calls premiumService.purchaseMonthly()
          ↓
Passes to usePremium() hook
          ↓
RevenueCat: Purchases.purchasePackage(monthlyPackage)
          ↓
Opens native Apple/Google payment sheet
          ↓
Real charge via app store (secured by Apple/Google)
          ↓
RevenueCat validates + grants "premium" entitlement
          ↓
getEntitlement() checks RevenueCat first
          ↓
Caches in SecureStore (offline fallback)
          ↓
State updates → features unlock
          ↓
On app close/reopen:
  - getEntitlement() verifies with RevenueCat (network)
  - Falls back to cache if offline
  - Automatically expires on subscription renewal/cancellation

Benefits:
✅ Real payment via native app store
✅ No simulated UI — looks like real billing
✅ RevenueCat validates all transactions (fraud protection)
✅ Automatic subscription management (renewals, cancellations)
✅ App Store review approval (production legitimate)
✅ Restore purchases WORKS (fetches real store history)
✅ Refunds handled automatically (store → RevenueCat → app)
✅ Entitlements expire at right time
✅ Feature flags can change on server (RevenueCat console)

Diagram:
    PremiumScreen
         ↓ (taps Buy)
    usePremium() hook
         ↓
    premiumService.purchaseMonthly()
         ↓
    await Purchases.purchasePackage()
         ↓
    Apple/Google native payment sheet (REAL)
         ↓
    RevenueCat API (validates + grants entitlement)
         ↓
    getEntitlement() (checks RevenueCat)
         ↓
    SecureStore.setItem() (cache for offline)
         ↓
    State update → unlock features → PremiumGate knows

Result: Works on App Store with real payments
```

### Architecture Stack

```
CURRENT (Mock):
┌─────────────────────────────────┐
│ PremiumScreen                   │
├─────────────────────────────────┤
│ usePremium hook (local state)   │
├─────────────────────────────────┤
│ premiumService (mock functions) │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ SecureStore (local cache)       │
│ {isActive: true, plan: 'month'} │
└─────────────────────────────────┘
         ↓
    (No network connection)

Problems:
- All data is LOCAL
- No validation from server
- No way to revoke (except client-side)
- Won't pass App Store review


TARGET (RevenueCat):
┌─────────────────────────────────┐
│ PremiumScreen                   │
├─────────────────────────────────┤
│ usePremium hook (Zustand store) │
├─────────────────────────────────┤
│ premiumService (RevenueCat API) │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ RevenueCat Platform             │
│ - Entitlement validation        │
│ - Subscription management       │
│ - Refund handling               │
│ - Analytics & reporting         │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ Apple App Store / Google Play   │
│ - Real transaction              │
│ - Subscription lifecycle        │
│ - Secure payment processing     │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ SecureStore (offline cache)     │
│ {isActive: true, plan: 'month'} │
│ expiresAt: '2024-05-18'         │
└─────────────────────────────────┘

Benefits:
- Server validates all transactions
- Automatic subscription management
- Can revoke access server-side (if needed)
- Passes App Store review
- Works offline (with cache)
```

### Key Functions: Before → After

```
purchaseMonthly()
├─ Before: grantEntitlement('monthly') → true (mock)
└─ After:  await Purchases.purchasePackage(monthlyPkg) → RevenueCat validates

purchaseYearly()
├─ Before: grantEntitlement('yearly') → true (mock)
└─ After:  await Purchases.purchasePackage(yearlyPkg) → RevenueCat validates

purchaseLifetime()
├─ Before: grantEntitlement('lifetime') → true (mock)
└─ After:  await Purchases.purchasePackage(lifetimePkg) → RevenueCat validates

restorePurchases()
├─ Before: return false (STUBBED — always fails)
└─ After:  await Purchases.restorePurchases() → RevenueCat returns real entitlements

getEntitlement()
├─ Before: Check SecureStore only (local data)
└─ After:  Check RevenueCat first → fallback to SecureStore (cache) → online validation

initializeRevenueCat()
├─ Before: (doesn't exist)
└─ After:  Called on app boot → connects to RevenueCat API
```

### Premium Flow Timeline

```
BEFORE (Mock):                    AFTER (RevenueCat):

User launch      ✓               User launch         ✓
    ↓                                ↓
Load premium?   ✓                Load premium?      ✓
    ↓                                ↓
Check SecureStore                 initializeRevenueCat() ← NEW
    ↓ (mock data)                    ↓
isActive: true                    Check RevenueCat API
(no validation)                   (real data)
    ↓ WRONG!                         ↓
Features unlock                   Store in SecureStore
    ↓                                  ↓
✅ App works                      Features unlock
❌ Not real                           ↓
                                  ✅ App works
                                  ✅ Real + validated
```

---

## SYSTEM 3: App Lifecycle

### CURRENT (Before Phase 2)

```
app._layout.tsx (bootstrap)
├─ loadTheme()
├─ getEntitlement() ← reads mock SecureStore
├─ runMigrations()
├─ seedDatabase()
├─ isSetupComplete?
├─ isBiometricAvailable?
└─ Navigate to initial route

Problems:
❌ RevenueCat never initialized
❌ Premium state = local mock (not validated)
❌ App has no network connection to store
```

### TARGET (After Phase 2)

```
app._layout.tsx (bootstrap)
├─ loadTheme()
├─ initializeRevenueCat() ← NEW: connects to API
├─ getEntitlement() ← reads RevenueCat (+ cache fallback)
├─ runMigrations()
├─ seedDatabase()
├─ isSetupComplete?
├─ isBiometricAvailable?
└─ Navigate to initial route

Benefits:
✅ RevenueCat initialized early (ready for network calls)
✅ Premium state = real (validated against app store)
✅ App can check for refunds/cancellations on startup
✅ Restore purchases ready if user taps button
```

---

## SYSTEM 4: Release Readiness

### CURRENT (Before Phase 4)

```
Production Readiness Checklist:

❌ EAS project ID: "YOUR_EAS_PROJECT_ID" (placeholder)
❌ App Store account: Not created
❌ Play Store account: Not created
❌ Subscription products: Not set up
❌ RevenueCat config: Not configured
❌ Build: Would fail (invalid EAS ID)
❌ TestFlight: Can't submit
❌ Play Store: Can't submit

Status: BLOCKED 🔴
```

### TARGET (After Phase 4)

```
Production Readiness Checklist:

✅ EAS project ID: "12345678-..." (real ID set)
✅ App Store account: "Claro" created + subscriptions set up
✅ Play Store account: "com.claro.finance" created + products set up
✅ Subscription products: 3 products (monthly, yearly, lifetime) configured
✅ RevenueCat config: Both iOS & Android linked
✅ Build: eas build --platform ios/android succeeds
✅ TestFlight: Ready to submit build
✅ Play Store: Ready for internal testing → beta → production

Status: READY 🟢
```

---

## SYSTEM 5: Code Cleanup

### CURRENT (Before Phase 5)

```
Project structure:

src/
├─ screens/premium/
│  ├─ MockPaymentSheet.tsx ← UNUSED AFTER PHASE 2 (dead code)
│  ├─ PremiumScreen.tsx
│  └─ PremiumGate.tsx
│
└─ services/
   └─ premiumService.ts
      ⚠️ Has old REVENUECAT_SWAP comments (outdated)

app/vela/vela/ ← ENTIRE VELA CODEBASE (shipped in build)
├─ src/
├─ app/
├─ package.json
├─ ... (full app, ~200+ MB source)
└─ (lives in production build)

Issues:
❌ MockPaymentSheet.tsx shipped even though unused
❌ REVENUECAT_SWAP markers clutter code
❌ Entire Vela app ships with Claro (doubled code size)
❌ Dev-only buttons visible in Settings
```

### TARGET (After Phase 5)

```
Project structure:

src/
├─ screens/premium/
│  ├─ PremiumScreen.tsx (MockPaymentSheet removed)
│  └─ PremiumGate.tsx
│
└─ services/
   └─ premiumService.ts (clean RevenueCat code, no mock comments)

docs/reference/
└─ vela-architecture/ (archived, not shipped)
   └─ (kept for reference ONLY, .gitignore prevents shipping)

.gitignore
├─ app/vela/ ← Prevents shipping reference code

Benefits:
✅ MockPaymentSheet.tsx deleted (no dead code)
✅ premiumService.ts is clean (no confusion)
✅ Vela code NOT shipped (removed from bundle)
✅ Dev buttons hidden (__DEV__ flags)
✅ Smaller APK/IPA size
✅ No confusion for future devs
```

---

## Summary: Impact by Phase

| Phase | System | Change | Impact |
|-------|--------|--------|--------|
| 1 | Typography | StyledText → Text variants | Consistency + maintainability |
| 2 | Premium | Mock → RevenueCat | Real billing + validation |
| 3 | Quality | Manual audit | Design system compliance |
| 4 | Release | Config + stores | TestFlight/Play Store ready |
| 5 | Cleanup | Delete dead code | Production-clean codebase |

---

## Visual: App State Evolution

```
Week 0 (Today):
┌─────────────────────────────────────┐
│ Claro Beta                          │
│                                     │
│ ✅ Core functionality works         │
│ ❌ Inconsistent typography          │
│ ❌ Mock billing (not real)          │
│ ❌ No app store setup               │
│ ❌ Dev code in production           │
└─────────────────────────────────────┘
        Status: NOT PRODUCTION READY

Week 1 (Phase 1–2):
┌─────────────────────────────────────┐
│ Claro Production-Ready              │
│                                     │
│ ✅ Core functionality works         │
│ ✅ Consistent typography (Phase 1)  │
│ ✅ Real RevenueCat billing (Phase 2)│
│ ❌ No app store setup (Phase 4 TBD) │
│ ❌ Dev code still present (Phase 5) │
└─────────────────────────────────────┘
        Status: READY FOR QA

Week 2 (Phase 3–5):
┌─────────────────────────────────────┐
│ Claro Production (SHIPPED)          │
│                                     │
│ ✅ Core functionality works         │
│ ✅ Consistent typography            │
│ ✅ Real RevenueCat billing          │
│ ✅ App store setup complete         │
│ ✅ Clean, production code           │
└─────────────────────────────────────┘
        Status: READY TO SHIP 🚀
```

---

## Next: Implementation Starts Monday
See `DETAILED_IMPLEMENTATION_GUIDE.md` for step-by-step guide with exact code changes.

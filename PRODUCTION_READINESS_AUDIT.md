# Claro Production Readiness Audit & Rollout Plan

**Status:** Strong Beta → Production-Ready  
**Target:** Move Claro to production by adopting Vela's architectural patterns  
**Date:** 18 April 2026

---

## Executive Summary

Claro has solid core functionality and good UX foundations. To ship production-ready, we need to:

1. **Adopt Vela's Typography System** (Phase 1 — Quick Win)
   - Replace 50+ instances of raw `StyledText` with semantic `Text` variants
   - Improves consistency, reduces prop bloat, easier theme support

2. **Replace Mock Premium with Real RevenueCat** (Phase 2 — Critical Blocker)
   - Vela has proven, tested RevenueCat implementation
   - Claro has clear `REVENUECAT_SWAP` markers for easy migration
   - Estimated: 1.5–2 hours, minimal API changes

3. **Run Theme/Token Consistency Audit** (Phase 3 — Quality Pass)
   - Audit all major screens for visual consistency
   - Apply typography standards post-adoption

4. **Complete Release Config** (Phase 4 — Production Setup)
   - Fix `app.json` EAS project ID
   - Create production credentials in App Store Connect / Play Console
   - Set up RevenueCat for live store

5. **Production Cleanup** (Phase 5 — Final Polish)
   - Remove `MockPaymentSheet.tsx`
   - Remove dev-only premium reset in Settings
   - Archive `/app/vela/vela` directory (keep for reference, don't ship)

---

## PHASE 1: Typography System Adoption

### Overview
Adopt Vela's centralized `Text` component with 13 semantic variants into Claro.

**Impact:**
- Consistency: All heading/body/label text follows semantic rules
- Maintainability: Changing heading size = 1 place, not 50
- Brand polish: Matches Vela's refined typography discipline

### Files to Create

| File | Purpose | LOC |
|------|---------|-----|
| `src/components/Text.tsx` | Central semantic typography component | 170 |

#### `src/components/Text.tsx`
Copy Vela's Text component directly. It's production-tested and handles:
- 13 semantic variants (hero, display, header, title, subtitle, body, bodySmall, label, subLabel, button, metric, caption, overline)
- Automatic Plus Jakarta Sans font mapping based on weight
- Explicit overrides when needed
- Line-height consistency

### Files to Update

Audit these by variant type. Replace `StyledText` + raw props with `<Text variant="...">`:

#### Heading Hierarchy (Priority: Major visual change)

| Screen | Component | Current | Goal |
|--------|-----------|---------|------|
| PremiumScreen.tsx | Hero title | `StyledText fontSize={24} fontWeight="800"` | `<Text variant="header">` |
| PremiumScreen.tsx | Feature titles | `StyledText fontSize={14} fontWeight="700"` | `<Text variant="label">` |
| SetBudgetScreen.tsx | Screen title | `StyledText fontSize={16} fontWeight="800"` | `<Text variant="subtitle">` |
| PremiumGate.tsx | Lock title | `StyledText fontSize={16} fontWeight="800"` | `<Text variant="subtitle">` |
| ModalHeader.tsx | Modal titles | `StyledText fontSize={17} fontWeight="800"` | `<Text variant="header">` |
| SetupPINScreen.tsx | PIN title | `StyledText fontSize={24} fontWeight="800"` | `<Text variant="header">` |

#### Body Text (Priority: Secondary, but widely used)

| Screen | Current | Goal |
|--------|---------|------|
| PremiumScreen.tsx | `StyledText fontSize={14}` (many) | `<Text variant="body">` |
| PremiumScreen.tsx | `StyledText fontSize={12}` (helper) | `<Text variant="bodySmall">` |
| PremiumScreen.tsx | `StyledText fontSize={15}` (button) | `<Text variant="button">` |
| PremiumGate.tsx | Helper text `fontSize={12}` | `<Text variant="subLabel">` |
| SwipeableRow.tsx | Action labels `fontSize={11}` | `<Text variant="caption">` |

#### Button & Label Text

| Component | Current | Goal |
|-----------|---------|------|
| PremiumScreen.tsx buttons | `StyledText fontSize={15} fontWeight="700"` | `<Text variant="button">` |
| ModalHeader.tsx | `StyledText fontSize={17} fontWeight="800"` | `<Text variant="title">` |
| IconPicker.tsx | `StyledText fontSize={13}` (label) | `<Text variant="label">` |
| ColorPicker.tsx | `StyledText fontSize={13}` (label) | `<Text variant="label">` |

### Implementation Steps

1. ✅ Create `src/components/Text.tsx` (copy from Vela)
2. ✅ Update `src/components/index.ts` to export `Text`
3. ✅ Replace in high-visibility screens first:
   - PremiumScreen.tsx (10–15 instances)
   - PremiumGate.tsx (8–10 instances)
   - ModalHeader.tsx (2–3 instances)
4. ✅ Replace in secondary screens:
   - All others (estimate 30–40 instances)
5. ✅ Update `useColors.ts` to define semantic color tokens if not already done
6. ✅ Test on iOS + Android simulator

### Rollout File List

**Create:**
- `src/components/Text.tsx`

**Update:**
- `src/components/index.ts`
- `app/_layout.tsx` (if importing Text in any layout)

**Bulk Replace:**
- `src/screens/premium/PremiumScreen.tsx`
- `src/screens/premium/PremiumGate.tsx`
- `src/components/ModalHeader.tsx`
- `src/components/IconPicker.tsx`
- `src/components/ColorPicker.tsx`
- `src/screens/transactions/AccountPicker.tsx`
- `src/screens/budgets/SetBudgetScreen.tsx`
- `src/screens/onboarding/SetupPINScreen.tsx`
- `src/components/SwipeableRow.tsx`

---

## PHASE 2: Replace Mock Premium with Real RevenueCat

### Overview
Claro's premium system uses local mock entitlements. Vela has production-ready RevenueCat integration.

**Current State:**
- `src/services/premiumService.ts` has mock purchase functions
- `REVENUECAT_SWAP` comments mark exact swap points
- `src/screens/premium/MockPaymentSheet.tsx` simulates Apple Pay
- `src/screens/premium/PremiumScreen.tsx` uses MockPaymentSheet
- `restorePurchases()` returns `false` (stubbed)
- `usePremium()` hook relies on mock data

### Production Blockers

| Blocker | Impact | Resolution |
|---------|--------|-----------|
| `premiumService.ts` calls `grantEntitlement()` (mock) | No real billing | Replace with Purchases.purchasePackage() |
| `MockPaymentSheet.tsx` shows fake payment UI | Confusing for users, fails App Store review | Remove entirely, use RevenueCat's native sheet |
| `restorePurchases()` returns false | Users can't recover purchases | Implement via Purchases.restorePurchases() |
| No RevenueCat initialization | Can't communicate with RevenueCat API | Add `initializeRevenueCat()` to app bootstrap |

### Files to Create

| File | Purpose | LOC |
|------|---------|-----|
| (none — use Vela's code structure) | | |

### Files to Update

#### 1. `package.json`
Add `react-native-purchases` dependency:
```json
{
  "dependencies": {
    "react-native-purchases": "^8.0.0"
  }
}
```

#### 2. `src/services/premiumService.ts`
Replace mock functions with RevenueCat calls (see changes below).

**Key Changes:**
- Add `initializeRevenueCat()` function (copy from Vela)
- Add RevenueCat config constants (test store IDs for dev, real IDs for production)
- Replace `purchaseMonthly()`, `purchaseYearly()`, `purchaseLifetime()` with Purchases.purchasePackage() calls
- Implement `restorePurchases()` to call Purchases.restorePurchases()
- Add license check during app bootstrap

#### 3. `app/_layout.tsx`
Add RevenueCat initialization on app boot:
```typescript
import { initializeRevenueCat } from '../src/services/premiumService'

useEffect(() => {
  const bootstrap = async () => {
    // ... existing code ...
    await initializeRevenueCat()  // Add this line
    // ... rest of bootstrap ...
  }
  bootstrap()
}, [])
```

#### 4. `src/hooks/usePremium.ts`
No changes required — API stays the same. The hook abstracts purchase logic.

#### 5. `src/screens/premium/PremiumScreen.tsx`
- Remove `MockPaymentSheet` import
- Remove `showPayment` state + modal
- Remove `handlePaymentConfirm` logic
- Simplify to direct purchase calls (Purchases.purchasePackage handles UI)

Actually, check current PremiumScreen code — it may already use the hook correctly. The purchase trigger should just call `premium.buyMonthly()` etc., which now calls the real RevenueCat.

### RevenueCat Setup Checklist

#### Development (Test Store)

- ✅ API Key: `test_CUwZEYKAHnjpWzNGwwjrKCEILNM` (from Vela's setup)
- ✅ Entitlement: `premium` (display: "Claro Premium")
- ✅ Offering: `default`
- ✅ Test Products:
  - `claro_premium_monthly`
  - `claro_premium_yearly`
  - `claro_premium_lifetime`
- ✅ Update `premiumService.ts` to use `IS_TEST_STORE = true` initially

#### Production (Real Store)

Before shipping:

1. Create Apple App Store Connect subscription group "Claro Premium"
   - Monthly: `com.claro.finance.premium.monthly`
   - Yearly: `com.claro.finance.premium.yearly`
   - Lifetime: `com.claro.finance.premium.lifetime`

2. Create Google Play Store subscriptions with same IDs

3. In RevenueCat dashboard:
   - Create production API keys for iOS and Android
   - Link App Store and Play Store products
   - Set up Claro's entitlements in RevenueCat dashboard

4. Update `premiumService.ts`:
   - Set `IS_TEST_STORE = false`
   - Replace API key with production key from RevenueCat

### Key Differences: Vela's vs Claro's

| Aspect | Vela | Claro | Action |
|--------|------|-------|--------|
| Test Product IDs | `vela_premium_*` | `claro_premium_*` | Keep Claro naming |
| Entitlement name | `premium` | `premium` | Same ✅ |
| Storage key | `vela_premium_entitlement` | (Claro uses same) | Keep existing ✅ |
| Purchase flow | Purchases.purchasePackage() | Mock grantEntitlement() | Adopt Vela's ✅ |
| Initialize | On app boot | Not currently | Add to app/_layout.tsx ✅ |

### Implementation Steps

1. ✅ Install `react-native-purchases` 
2. ✅ Copy RevenueCat setup from Vela's `premiumService.ts`
3. ✅ Update `src/services/premiumService.ts` with Vela's functions
4. ✅ Add `initializeRevenueCat()` call to `app/_layout.tsx`
5. ✅ Update `src/constants/premium.ts` with Claro product IDs
6. ✅ Remove `MockPaymentSheet.tsx`
7. ✅ Simplify `PremiumScreen.tsx` (remove mock modal)
8. ✅ Test on iOS + Android
9. ✅ Submit to Apple/Google for review with real products

### Rollout File List

**Install:**
- `react-native-purchases`

**Create:**
- (None — reuse Vela's RevenueCat logic)

**Update:**
- `package.json` (add dependency)
- `src/services/premiumService.ts` (full rewrite with Vela's structure)
- `app/_layout.tsx` (add initializeRevenueCat call)
- `src/constants/premium.ts` (update product IDs to claro_premium_*)

**Delete:**
- `src/screens/premium/MockPaymentSheet.tsx`

**Refactor:**
- `src/screens/premium/PremiumScreen.tsx` (simplify, remove mock modal)

---

## PHASE 3: Theme & Token Consistency Audit

### Overview
Audit all major screens for visual consistency after typography adoption.

**Scope:** 8–10 high-visibility screens

### Audit Checklist

- [ ] **Accounts Screen**: Heading styles, list item typography, empty state messaging
- [ ] **Budgets Screen**: Title hierarchy, progress bar labels, category labels
- [ ] **Categories Screen**: List item titles, add/edit modal typography
- [ ] **Records Screen**: Transaction list typography, date headers, amount display
- [ ] **Analysis Screen**: Chart labels, legend text, insight headers
- [ ] **Settings Screen**: Section headers, toggle labels, info text
- [ ] **Premium Screen**: Feature titles, pricing tier typography (done after Phase 1)
- [ ] **Onboarding**: Welcome text, instruction copy, button labels
- [ ] **Lock Screen**: PIN entry UI, error messages
- [ ] **Transaction Modal**: Field labels, input hints, footer text

### Pass Criteria

After adoption:
- All headings use `variant="header"`, `variant="title"`, or `variant="subtitle"` (no raw fontSize/fontWeight)
- All body text uses `variant="body"` or `variant="bodySmall"` (consistent sizing)
- All button labels use `variant="button"`
- All helper text uses `variant="subLabel"` or `variant="caption"`
- Color usage is intentional (primary, secondary, tertiary, muted — no arbitrary hex)
- No hardcoded font families in screens (all use `Text` component)

### Deliverable

Create `TYPOGRAPHY_AUDIT_RESULTS.md`:
- Screenshot comparisons (before/after Typography Phase 1)
- List of screens audited
- Any deviations found + reasoning
- Recommendations for polish (e.g., "Consider using overline on section headers")

---

## PHASE 4: Complete Release Config

### Overview
Final production setup — credentials, identifiers, EAS config.

### Checklist

#### `app.json`

- [ ] Update `bundleIdentifier` (iOS): `com.claro.finance` ✅ (already set)
- [ ] Update `package` (Android): `com.claro.finance` ✅ (already set)
- [ ] Update `slug`: `claro` ✅ (already set)
- [ ] **Fix EAS projectId**: Replace `YOUR_EAS_PROJECT_ID` with real ID from `eas.json` or EAS dashboard
- [ ] Set `buildNumber` to `1` (iOS) ✅
- [ ] Set `versionCode` to `1` (Android) ✅
- [ ] Add privacy policy URL (required by App Store)
- [ ] Add support email

#### App Store Connect (iOS)

- [ ] Create app record for "Claro"
- [ ] Set bundle ID: `com.claro.finance`
- [ ] Add app icon, screenshots, description
- [ ] Create subscription group "Claro Premium" with 3 products:
  - `com.claro.finance.premium.monthly` (£2.99/mo)
  - `com.claro.finance.premium.yearly` (£19.99/yr, 7-day trial)
  - `com.claro.finance.premium.lifetime` (£34.99)
- [ ] Set up In-App Purchase shared secret in App Store Connect
- [ ] Configure RevenueCat to use App Store key

#### Google Play Console (Android)

- [ ] Create app record for "Claro"
- [ ] Set package name: `com.claro.finance`
- [ ] Add app icon, screenshots, description
- [ ] Create subscription product category with 3 subscriptions:
  - `claro_premium_monthly` (£2.99/mo)
  - `claro_premium_yearly` (£19.99/yr, 7-day trial)
  - `claro_premium_lifetime` (£34.99)
- [ ] Configure RevenueCat to use Play Store API credentials

#### RevenueCat Dashboard

- [ ] Create iOS app configuration:
  - iOS App ID: `com.claro.finance`
  - App Store Shared Secret: [from App Store Connect]
  - Entitlement: `premium`
  - Offering: `default` with 3 packages (monthly, yearly, lifetime)

- [ ] Create Android app configuration:
  - Package name: `com.claro.finance`
  - Service Account JSON: [from Google Play]
  - Entitlement: `premium`
  - Offering: `default` with 3 packages

- [ ] Set up attribution (optional): Firebase, Mixpanel, etc.

#### EAS & Credentials

- [ ] Run `eas build --platform ios` to generate provisioning profile
- [ ] Run `eas build --platform android` to configure Play store access
- [ ] Store credentials securely (1Password, GitHub Secrets, etc.)

### Deliverable

Create `RELEASE_CONFIG_CHECKLIST.md` with status of each step.

---

## PHASE 5: Production Cleanup

### Overview
Remove dev-only code, archive reference materials, prepare for shipping.

### Cleanup Tasks

1. ✅ **Delete dev-only premium reset**
   - Remove "Reset premium (dev)" option from Settings screen
   - Remove any other dev-only toggles (e.g., "Clear secure store", "Reset DB")

2. ✅ **Delete `MockPaymentSheet.tsx`** (done in Phase 2)

3. ✅ **Archive Vela reference code**
   - Move `/app/vela/vela` → `/docs/reference/vela-architecture` (or similar)
   - Add `.gitignore` entry: `app/vela/` — don't ship reference code
   - Document key learnings in `VELA_LEARNINGS.md`

4. ✅ **Clean up comments**
   - Remove `REVENUECAT_SWAP` markers in premiumService.ts (now live)
   - Remove mock purchase comments

5. ✅ **Verify no console logs**
   - Grep for `console.log()` and remove or convert to debug-only
   - Keep `console.error()` for production debugging

6. ✅ **Verify no __DEV__ only features**
   - Confirm all `if (__DEV__)` blocks are dev-only (e.g., reset buttons)
   - Remove from production builds with:
     ```typescript
     if (__DEV__) {
       // Dev-only UI
     }
     ```

7. ✅ **Verify no hardcoded test credentials**
   - Grep for any API keys, tokens, etc.
   - Ensure all secrets come from env or RevenueCat config

### Files to Delete

| File | Reason |
|------|--------|
| `src/screens/premium/MockPaymentSheet.tsx` | Replaced by RevenueCat native UI |
| `/app/vela/vela/` | Archive (reference only, don't ship) |

### Files to Update (Cleanup)

| File | Change |
|------|--------|
| `.gitignore` | Add `app/vela/` entry |
| `src/screens/settings/SettingsScreen.tsx` | Remove "Reset premium (dev)" row |
| `src/services/premiumService.ts` | Remove REVENUECAT_SWAP comments |
| Various screens | Remove console.log() calls |

---

## Summary: Issues & Recommendations

### 🔴 CRITICAL BLOCKERS (Must Fix Before Ship)

| Issue | Current State | Action | Est. Effort |
|-------|---------------|--------|-------------|
| No real billing | Mock grantEntitlement() | Replace with RevenueCat | 2 hours |
| EAS project ID missing | `YOUR_EAS_PROJECT_ID` | Set real ID from EAS | 15 min |
| No App Store/Play products | N/A | Create subscriptions in stores | 1 hour |
| Restore purchases stubbed | Returns false | Implement via Purchases.restorePurchases() | 30 min |

### 🟡 HIGH PRIORITY (Should Fix Before Ship)

| Issue | Current State | Action | Est. Effort |
|-------|---------------|--------|-------------|
| No centralized Typography | Raw StyledText + props | Adopt Vela's Text component | 3–4 hours |
| MockPaymentSheet in code | Still present | Delete after RevenueCat integration | 30 min |
| Dev-only reset buttons visible | In Settings | Hide behind __DEV__ flag | 30 min |
| Theme/token consistency | Varies by screen | Post-Typography audit | 2–3 hours |

### 🟢 MEDIUM PRIORITY (Nice to Have, Deferred to v1.1)

| Issue | Current State | Action | Est. Effort |
|-------|---------------|--------|-------------|
| No analytics integration | Not tracked | Add Firebase/Mixpanel (optional) | 2–3 hours |
| No crash reporting | Not integrated | Add Sentry or similar (optional) | 1–2 hours |
| No A/B testing setup | N/A | Set up experiment framework (optional) | 2 hours |
| Premium onboarding first-run | Basic paywall | Add conversion-optimized paywall (optional) | 4–5 hours |

---

## Recommended Implementation Order

### Week 1: Foundation (Monday–Wednesday)

1. **Monday**: Phase 1 — Typography system
   - Create `src/components/Text.tsx`
   - Replace in high-visibility screens (PM/PG done = 2 hours visual improvement)
   - Bulk replace in secondary screens (4–5 screens)

2. **Tuesday**: Phase 2 — RevenueCat integration (Part 1)
   - Install `react-native-purchases`
   - Rewrite `premiumService.ts` with Vela's code
   - Add `initializeRevenueCat()` to bootstrap

3. **Wednesday**: Phase 2 — RevenueCat integration (Part 2)
   - Simplify `PremiumScreen.tsx` (remove mock modal)
   - Delete `MockPaymentSheet.tsx`
   - Test on iOS + Android simulator (_not_ TestFlight yet)

### Week 1: Polish (Thursday–Friday)

4. **Thursday**: Phase 3 — Typography audit + Phase 5 — Cleanup
   - Run consistency audit on major screens
   - Remove dev-only reset buttons
   - Archive `/app/vela/vela`

5. **Friday**: Phase 4 — Release config + Final QA
   - Complete app.json setup
   - Create App Store / Play Store records (basic)
   - Create RevenueCat app config (dev testing)
   - Full device testing (iOS + Android)

### Week 2: Production Setup (Monday–Tuesday)

6. **Monday**: Create App Store / Play Store products
   - App Store: Create subscriptions + configure shared secret
   - Play Store: Create subscriptions + configure API
   - Link in RevenueCat (production API keys)

7. **Tuesday**: Final QA + Documentation
   - Full end-to-end payment flow on TestFlight (iOS) + internal testing (Android)
   - Document known issues, edge cases
   - Prepare release notes

---

## Vela Adoption Summary

### What We're Adopting ✅

| Component | From Vela | Impact |
|-----------|-----------|--------|
| **Text component** | `src/components/text/index.ts` | Centralized typography system (13 variants) |
| **Typography system** | 14px body, 20px title, 24px header, etc. | Consistent 3:2 scale, better hierarchy |
| **RevenueCat structure** | premiumService.ts, usePremium hook | Production-ready purchase flow |
| **Feature gating pattern** | `canUseTheme()`, `canUseAdvancedInsights()` | Extensible premium model |
| **Premium constants** | PREMIUM_PRODUCTS, PREMIUM_PRICING, PREMIUM_FEATURES | Centralized product config |
| **Secure storage pattern** | SecureStore + JSON serialization | Reliable entitlement caching |

### What We're **NOT** Adopting ❌

| Component | Reason |
|-----------|--------|
| Cycle tracking logic | Claro is finance, not health |
| Vela-specific screens | Different product domain |
| Cycle prediction algorithm | Not applicable |
| Health integration hooks | Not part of finance app |
| Pregnancy mode | Finance-specific premium tier |
| Vela's premium features | We have our own (export, themes, budgets) |
| Vela's data model | Different DB schema (drizzle vs whatever Vela uses) |

---

## Testing Checklist

### Phase 1: Typography ✅

- [ ] All screens render without crash
- [ ] Text is visually consistent across screens
- [ ] iOS simulator looks correct
- [ ] Android simulator looks correct
- [ ] Dark/light theme still works
- [ ] No hardcoded colors in Text component (uses Color tokens via `useColors()`)

### Phase 2: RevenueCat ✅

- [ ] RevenueCat initializes on app boot (check logs)
- [ ] Test store products load (debug: print offerings)
- [ ] Purchase flow works (buy monthly → mock charge in test store)
- [ ] Entitlement is cached in SecureStore
- [ ] Restore purchases returns correct plan
- [ ] Premium features are gated correctly
- [ ] Entitlement expires correctly (for subscriptions)
- [ ] No crashes on network error

### Phase 3: Theme Audit ✅

- [ ] All major screens look cohesive
- [ ] Color palette matches design system
- [ ] Typography hierarchy is clear
- [ ] Spacing is consistent

### Phase 4: Release Config ✅

- [ ] app.json is valid JSON
- [ ] EAS projectId is correct
- [ ] `eas build --platform ios` succeeds
- [ ] `eas build --platform android` succeeds
- [ ] App Store / Play Store submissions accepted

### Phase 5: Cleanup ✅

- [ ] No MockPaymentSheet references remain
- [ ] No console.log() in production code
- [ ] No __DEV__ features exposed in production builds
- [ ] /app/vela is git-ignored
- [ ] Dev-only settings buttons are hidden

---

## Rollout File Summary

### Phase 1: Typography

**Create:** (1 file)
- `src/components/Text.tsx`

**Update:** (10+ files)
- `src/components/index.ts`
- `src/screens/premium/PremiumScreen.tsx`
- `src/screens/premium/PremiumGate.tsx`
- `src/components/ModalHeader.tsx`
- `src/components/IconPicker.tsx`
- `src/components/ColorPicker.tsx`
- `src/screens/transactions/AccountPicker.tsx`
- `src/screens/budgets/SetBudgetScreen.tsx`
- `src/screens/onboarding/SetupPINScreen.tsx`
- `src/components/SwipeableRow.tsx`

### Phase 2: RevenueCat

**Delete:** (1 file)
- `src/screens/premium/MockPaymentSheet.tsx`

**Update:** (4 files)
- `package.json`
- `src/services/premiumService.ts`
- `app/_layout.tsx`
- `src/constants/premium.ts` (product IDs)

**Refactor:** (1 file)
- `src/screens/premium/PremiumScreen.tsx`

### Phase 3: Audit

**Create:** (1 file)
- `TYPOGRAPHY_AUDIT_RESULTS.md`

### Phase 4: Release Config

**Create:** (1 file)
- `RELEASE_CONFIG_CHECKLIST.md`

**Update:** (1 file)
- `app.json`

### Phase 5: Cleanup

**Delete:** (2)
- `src/screens/premium/MockPaymentSheet.tsx` (already done Phase 2)
- `/app/vela/vela/` (archive)

**Update:** (2)
- `.gitignore`
- `src/screens/settings/SettingsScreen.tsx` (remove dev buttons)

---

## Next Steps

→ **Start Phase 1 immediately.** The Typography system is a quick, high-impact win that improves the entire app's polish and prepares for Phase 2.

→ **Phase 2 is critical** — no way around it for real billing. Estimated 2 hours of implementation once RevenueCat API credentials are obtained from Vela's setup documentation.

→ **Phases 3–5 can run in parallel** with Phase 2 testing.

→ **Target ship date:** 2–3 weeks (end of April 2026) assuming App Store review cycles cooperate.

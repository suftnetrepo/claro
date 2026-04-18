# Claro Production Rollout: Detailed Implementation Guide

## Phase 1: Typography System Adoption

### Step 1.1: Create `src/components/Text.tsx`

**File:** `src/components/Text.tsx`
**Source:** Copy from `/app/vela/vela/src/components/text/index.ts`
**Purpose:** Centralized semantic typography with 13 variants

This is a copy-and-paste from Vela. No modifications needed. The implementation:
- Maps fontWeight to Plus Jakarta Sans variants automatically
- Provides 13 semantic variants (hero, display, header, title, subtitle, body, bodySmall, label, subLabel, button, metric, caption, overline)
- Maintains consistent line-height relationships
- Supports explicit overrides when needed

### Step 1.2: Update Component Exports

**File:** `src/components/index.ts`
**Change:** Add Text export

```typescript
// Before
export { ColorPicker } from './ColorPicker'
export { IconPicker } from './IconPicker'
export { ModalHeader } from './ModalHeader'
export { SwipeableRow } from './SwipeableRow'

// After
export { Text } from './Text'
export { ColorPicker } from './ColorPicker'
export { IconPicker } from './IconPicker'
export { ModalHeader } from './ModalHeader'
export { SwipeableRow } from './SwipeableRow'
```

### Step 1.3: Replace Typography in High-Priority Screens

Start with these 3 screens for maximum visual impact:

#### Screen 1: `src/screens/premium/PremiumScreen.tsx`

**Changes:**
1. Add import at top:
   ```typescript
   import { Text } from '../../components'
   ```

2. Replace hero section (line ~84–90):
   ```typescript
   // Before
   <StyledText fontSize={24} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>
     Claro Premium
   </StyledText>

   // After
   <Text variant="header" color={Colors.textPrimary}>
     Claro Premium
   </Text>
   ```

3. Replace feature list titles (line ~138–142):
   ```typescript
   // Before
   <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>
     {f.title}
   </StyledText>

   // After
   <Text variant="label" color={Colors.textPrimary}>
     {f.title}
   </Text>
   ```

4. Replace feature descriptions (line ~143–146):
   ```typescript
   // Before
   <StyledText fontSize={12} color={Colors.textMuted}>
     {f.description}
   </StyledText>

   // After
   <Text variant="subLabel" color={Colors.textMuted}>
     {f.description}
   </Text>
   ```

5. Replace plan selector label (line ~164–166):
   ```typescript
   // Before
   <StyledText fontSize={12} fontWeight="700" color={Colors.textMuted}
     letterSpacing={0.8} marginBottom={2}>
     CHOOSE YOUR PLAN

   // After
   <Text variant="overline" color={Colors.textMuted} marginBottom={2}>
     CHOOSE YOUR PLAN
   </Text>
   ```

6. Replace plan options (line ~179–184):
   ```typescript
   // Before
   <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
     {p.label}
   </StyledText>

   // After
   <Text variant="button" color={Colors.textPrimary}>
     {p.label}
   </Text>
   ```

7. Replace price display (line ~185–186):
   ```typescript
   // Before
   <StyledText fontSize={16} fontWeight="700" color={planColor}>
     {p.price}

   // After
   <Text variant="metric" color={planColor}>
     {p.price}
   </Text>
   ```

8. Replace "You're on Premium" screen (line ~59–63):
   ```typescript
   // Before
   <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} textAlign="center">
     You're on Premium
   </StyledText>

   // After
   <Text variant="header" color={Colors.textPrimary} textAlign="center">
     You're on Premium
   </Text>
   ```

9. Replace button text (line ~65–66, ~75–76):
   ```typescript
   // Before
   <StyledText fontSize={15} fontWeight="700" color="#fff">Back to Claro</StyledText>

   // After
   <Text variant="button" color="#fff">
     Back to Claro
   </Text>
   ```

**Total replacements:** ~12 instances

#### Screen 2: `src/screens/premium/PremiumGate.tsx`

**Changes:**
1. Add import at top:
   ```typescript
   import { Text } from '../../components'
   ```

2. Replace inline alert title (line ~46–48):
   ```typescript
   // Before
   <StyledText fontSize={13} fontWeight="700" color={Colors.textPrimary}>
     {message}

   // After
   <Text variant="label" color={Colors.textPrimary}>
     {message}
   </Text>
   ```

3. Replace inline alert subtext (line ~50):
   ```typescript
   // Before
   <StyledText fontSize={12} color={Colors.textMuted}>{description}</StyledText>

   // After
   <Text variant="subLabel" color={Colors.textMuted}>
     {description}
   </Text>
   ```

4. Replace inline button text (line ~58):
   ```typescript
   // Before
   <StyledText fontSize={12} fontWeight="700" color="#fff">Upgrade</StyledText>

   // After
   <Text variant="button" color="#fff">
     Upgrade
   </Text>
   ```

5. Replace fullscreen alert title (line ~81–83):
   ```typescript
   // Before
   <StyledText fontSize={16} fontWeight="800" color={Colors.textPrimary}>
     {message}

   // After
   <Text variant="subtitle" color={Colors.textPrimary}>
     {message}
   </Text>
   ```

6. Replace fullscreen alert body (line ~85–87):
   ```typescript
   // Before
   <StyledText fontSize={13} color={Colors.textMuted} textAlign="center">
     {description}

   // After
   <Text variant="body" color={Colors.textMuted} textAlign="center">
     {description}
   </Text>
   ```

7. Replace fullscreen button text (line ~102–104):
   ```typescript
   // Before
   <StyledText fontSize={14} fontWeight="700" color="#fff">
     {message}

   // After
   <Text variant="button" color="#fff">
     {message}
   </Text>
   ```

8. Replace "Premium unlocked" message (line ~135):
   ```typescript
   // Before
   <StyledText fontSize={13} fontWeight="700" color="#6366F1">{message}</StyledText>

   // After
   <Text variant="label" color="#6366F1">
     {message}
   </Text>
   ```

9. Replace arrow text (line ~138):
   ```typescript
   // Before
   <StyledText fontSize={13} fontWeight="700" color="#6366F1">→</StyledText>

   // After
   <Text variant="label" color="#6366F1">
     →
   </Text>
   ```

**Total replacements:** ~9 instances

#### Screen 3: `src/components/ModalHeader.tsx`

**Changes:**
1. Add import at top:
   ```typescript
   import { Text } from './index'
   ```

2. Replace modal title (line ~31–33):
   ```typescript
   // Before
   <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary}>
     {title}
   </StyledText>

   // After
   <Text variant="title" color={Colors.textPrimary}>
     {title}
   </Text>
   ```

**Total replacements:** 1 instance

### Step 1.4: Bulk Replace in Secondary Screens

After validating the 3 screens above, apply the same pattern to:

**File:** `src/components/IconPicker.tsx` (~2 instances)
- Label text: `fontSize={13}` → `variant="label"`

**File:** `src/components/ColorPicker.tsx` (~2 instances)
- Label text: `fontSize={13}` → `variant="label"`

**File:** `src/components/SwipeableRow.tsx` (~2 instances)
- Action text: `fontSize={11}` → `variant="caption"`

**File:** `src/screens/transactions/AccountPicker.tsx` (~3 instances)
- List item text: `fontSize={15}` → `variant="body"` or `variant="label"`

**File:** `src/screens/budgets/SetBudgetScreen.tsx` (~3 instances)
- Screen title: `fontSize={16} fontWeight="800"` → `variant="subtitle"`
- Section labels: `fontSize={13}` → `variant="label"`

**File:** `src/screens/onboarding/SetupPINScreen.tsx` (~4 instances)
- PIN title: `fontSize={24} fontWeight="800"` → `variant="header"`
- PIN subtitle: `fontSize={14}` → `variant="body"`
- PIN error: `fontSize={13}` → `variant="body"` (with color={Colors.expense})
- PIN key: `fontSize={24} fontWeight="600"` → `variant="metric"` or custom

---

## Phase 2: RevenueCat Integration

### Step 2.1: Install Dependency

```bash
yarn add react-native-purchases
```

### Step 2.2: Update `package.json`

Add to dependencies:
```json
"react-native-purchases": "^8.0.0"
```

### Step 2.3: Rewrite `src/services/premiumService.ts`

**Full replacement.** Copy the entire file from `/app/vela/vela/src/services/premium.service.ts` and update:

1. Change API key from Vela's test key to Claro's (or keep for now, request real key later)
2. Change product IDs from `vela_premium_*` to `claro_premium_*`
3. Update storage key or keep `premium_entitlement` (compatible)

**Key sections:**
- `initializeRevenueCat()` — called on app boot
- `purchaseMonthly/Yearly/Lifetime()` — actual RevenueCat calls (no more mock)
- `restorePurchases()` — implements real restore (no more returning false)
- `getEntitlement()` — checks RevenueCat + SecureStore cache

### Step 2.4: Update `app/_layout.tsx`

**Add RevenueCat initialization to bootstrap:**

Located around line 40–60 (the big `useEffect` bootstrap block):

```typescript
// Add import at top
import { initializeRevenueCat } from '../src/services/premiumService'

// In the bootstrap useEffect, add:
useEffect(() => {
  const bootstrap = async () => {
    try {
      await loadTheme()
      await initializeRevenueCat()  // ← ADD THIS LINE
      const entitlement = await getEntitlement()
      // ... rest of bootstrap ...
    } catch (e) {
      console.error('[Bootstrap]', e)
      // ... error handling ...
    } finally {
      setAppReady(true)
    }
  }
  bootstrap()
}, [])
```

### Step 2.5: Update `src/constants/premium.ts`

**Change product identifiers** from Claro's original mock IDs to match RevenueCat:

```typescript
// Before (if needed — check current file)
export const PREMIUM_PRODUCTS = {
  MONTHLY:  'com.claro.finance.premium.monthly',
  YEARLY:   'com.claro.finance.premium.yearly',
  LIFETIME: 'com.claro.finance.premium.lifetime',
} as const

// Confirmed these match app.json bundleIdentifier ✅
// Just verify in the file, no change typically needed
```

### Step 2.6: Simplify `src/screens/premium/PremiumScreen.tsx`

**Remove MockPaymentSheet:**

1. Remove import:
   ```typescript
   // DELETE THIS LINE
   import { MockPaymentSheet } from './MockPaymentSheet'
   ```

2. Remove state:
   ```typescript
   // DELETE THESE
   const [showPayment, setShowPayment] = useState(false)
   ```

3. Remove handlers:
   ```typescript
   // DELETE THESE
   const handlePurchasePress = () => setShowPayment(true)
   const handlePaymentConfirm = async () => {
     setShowPayment(false)
     let success = false
     if (selected === 'MONTHLY')  success = await premium.buyMonthly()
     if (selected === 'YEARLY')   success = await premium.buyYearly()
     if (selected === 'ONE_TIME') success = await premium.buyLifetime()
     if (success) router.back()
   }
   ```

4. Update button to call purchase directly:
   ```typescript
   // Before: onPress={() => setShowPayment(true)}
   // After:
   <StyledPressable
     onPress={async () => {
       let success = false
       if (selected === 'MONTHLY')  success = await premium.buyMonthly()
       if (selected === 'YEARLY')   success = await premium.buyYearly()
       if (selected === 'ONE_TIME') success = await premium.buyLifetime()
       if (success) router.back()
     }}
     // ... rest of props
   >
   ```

5. Remove modal:
   ```typescript
   // DELETE THIS ENTIRE SECTION (after the plan selector)
   <MockPaymentSheet
     visible={showPayment}
     plan={selected}
     onConfirm={handlePaymentConfirm}
     onCancel={() => setShowPayment(false)}
   />
   ```

### Step 2.7: Delete `src/screens/premium/MockPaymentSheet.tsx`

**Delete the entire file.** It's replaced by RevenueCat's native payment UI.

### Step 2.8: Test on Simulator

iOS:
```bash
eas build --platform ios --local
expo run:ios
```

Android:
```bash
eas build --platform android --local
expo run:android
```

**Test steps:**
1. App starts → no crashes
2. Check console for `[RevenueCat] Initialized successfully`
3. Navigate to Premium screen
4. Tap a plan → RevenueCat's native sheet appears (not mock)
5. Cancel → sheet closes
6. In test store, tap Confirm → simulated purchase (no charge)
7. Premium gate should unlock features
8. Close app + reopen → premium state persists (SecureStore cache)
9. Tap "Restore Purchases" → should work (dev: no old purchases)

---

## Phase 3: Theme Consistency Audit

After Phase 1 (Typography) is complete, audit these screens for visual consistency:

### Audit Script

For each screen, check:
1. ✅ All headings use semantic variants (header, title, subtitle)
2. ✅ All body text uses body or bodySmall (no raw fontSize)
3. ✅ Button labels use button variant
4. ✅ Helper text uses caption or subLabel
5. ✅ Colors come from `useColors()`, not hardcoded hex
6. ✅ No `StyledText` with raw fontSize/fontWeight (should all be Text component)

**Screens to audit:**
1. Accounts screen
2. Budgets screen
3. Categories screen
4. Records screen
5. Analysis screen
6. Settings screen
7. Premium screen (already updated)
8. Onboarding screens
9. Lock screen
10. Transaction modal

### Deliverable

Create `TYPOGRAPHY_AUDIT_RESULTS.md` with:
- Date completed
- Screens audited (list)
- Issues found (if any)
- Screenshots comparison (before/after)
- Recommendations

---

## Phase 4: Release Configuration

### Step 4.1: Fix `app.json`

**File:** `app.json`

**Change:** Replace placeholder EAS project ID

```json
{
  "expo": {
    // ...
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"  // ← Replace with real ID
      }
    }
  }
}
```

**Where to find the real ID:**
1. Run `eas init` (if not already done) — generates projectId
2. Or check `eas.json` in root directory
3. Or check EAS dashboard at https://expo.dev/projects

**Example:**
```json
"projectId": "12345678-1234-1234-1234-123456789012"
```

### Step 4.2: App Store Connect (iOS)

**Prerequisites:** Apple Developer account, certificate

1. Go to https://appstoreconnect.apple.com
2. Create "Claro" app record
   - Bundle ID: `com.claro.finance`
   - App type: iOS App
   - Name: Claro
3. In Pricing & Availability:
   - Price: Free (yes, but In-App Purchases)
   - Add Privacy Policy URL
   - Add Support Email
4. In Features:
   - Enable In-App Purchases
5. Create subscription group "Claro Premium":
   - Monthly: `com.claro.finance.premium.monthly` — £2.99/month, no trial
   - Yearly: `com.claro.finance.premium.yearly` — £19.99/year, 7-day trial
   - Lifetime: `com.claro.finance.premium.lifetime` — £34.99 one-time
6. Get App Store Shared Secret:
   - Account → Users & Access → App Store Connect API
   - Create API key (or use shared secret from Certificates section)
   - Save this for RevenueCat

### Step 4.3: Google Play Console (Android)

**Prerequisites:** Google Play Developer account, certificate

1. Go to https://play.google.com/console
2. Create "Claro" app record
   - Package name: `com.claro.finance`
   - App name: Claro
3. In Monetization → Products → Subscriptions:
   - Monthly: `claro_premium_monthly` — £2.99/month, no trial
   - Yearly: `claro_premium_yearly` — £19.99/year, 7-day trial
   - Lifetime: `claro_premium_lifetime` — £34.99 one-time (note: subscriptions only on Play, so use "In-App Products" for lifetime)
4. Get API credentials:
   - Go to Project Settings → API & Credentials
   - Create Service Account → download JSON
   - Save this for RevenueCat

### Step 4.4: RevenueCat Dashboard Configuration

1. Go to https://dashboard.revenuecat.com
2. Create "Claro" project (or add app)
3. For iOS:
   - Add App Store Secret (from step 4.2)
   - Entitlement: `premium`
   - Offering: `default`
   - Products: link to App Store products
4. For Android:
   - Add Service Account JSON (from step 4.3)
   - Entitlement: `premium`
   - Offering: `default`
   - Products: link to Play Store products

### Step 4.5: Create Release Config Checklist

**File:** `RELEASE_CONFIG_CHECKLIST.md`

```markdown
# Release Configuration Checklist

## EAS & App Identifiers
- [ ] app.json EAS projectId set
- [ ] iOS bundle ID: com.claro.finance ✅
- [ ] Android package: com.claro.finance ✅
- [ ] Version 1.0.0 set ✅

## App Store Connect (iOS)
- [ ] Claro app created
- [ ] Bundle ID linked: com.claro.finance
- [ ] Privacy Policy URL added
- [ ] Support email added
- [ ] In-App Purchases enabled
- [ ] Subscription group "Claro Premium" created
- [ ] Monthly product created & priced
- [ ] Yearly product created & priced (with 7-day trial)
- [ ] Lifetime product created & priced
- [ ] App Store Shared Secret exported

## Google Play Console (Android)
- [ ] Claro app created
- [ ] Package name linked: com.claro.finance
- [ ] Privacy Policy URL added
- [ ] Support email added
- [ ] Monthly subscription created & priced
- [ ] Yearly subscription created & priced (with 7-day trial)
- [ ] Lifetime in-app product created & priced
- [ ] Service Account JSON exported

## RevenueCat Configuration
- [ ] iOS app added with Store Secret
- [ ] Android app added with Service Account JSON
- [ ] Entitlement "premium" created
- [ ] Offering "default" created
- [ ] Monthly package added
- [ ] Yearly package added (with trial_period: 7)
- [ ] Lifetime package added
- [ ] All products linked to store products

## Before TestFlight / Submission
- [ ] All blockers fixed (Phase 1, 2)
- [ ] Dev buttons hidden (__DEV__ flag)
- [ ] MockPaymentSheet deleted
- [ ] No console.log except errors
- [ ] All screenshots taken
- [ ] Release notes written
```

---

## Phase 5: Production Cleanup

### Step 5.1: Remove Dev-Only Premium Reset

**File:** `src/screens/settings/SettingsScreen.tsx` (or wherever dev buttons are)

**Find and remove:**
```typescript
// DELETE THIS SECTION
{__DEV__ && (
  <StyledPressable onPress={() => clearEntitlement()}>
    <StyledText>Reset premium (dev)</StyledText>
  </StyledPressable>
)}
```

### Step 5.2: Update `.gitignore`

**File:** `.gitignore`

**Add line:**
```
app/vela/
```

This prevents shipping the Vela reference architecture in production builds.

### Step 5.3: Archive Vela Reference Material

**Instructions:**
1. Create `/docs/reference/` directory
2. Move `/app/vela/vela/` → `/docs/reference/vela-architecture/` (or similar)
3. Create `/docs/VELA_LEARNINGS.md` with:
   - Key architectural patterns adopted
   - What worked, what didn't
   - Links to key files in Vela codebase

### Step 5.4: Clean Up Comments & Markers

**File:** `src/services/premiumService.ts`

**Remove all `REVENUECAT_SWAP` comments** (no longer needed with real RevenueCat):

```typescript
// DELETE THESE COMMENTS
// REVENUECAT_SWAP ↓
// const offerings = await Purchases.getOfferings()
// ...
```

### Step 5.5: Verify No Console Logs or Test Code

**Search for:**
```bash
grep -r "console.log" src/ --include="*.ts" --include="*.tsx"
grep -r "__DEV__" src/ --exclude-dir=node_modules
grep -r "TODO\|FIXME\|XXX" src/ --include="*.ts" --include="*.tsx"
grep -r "test" src/ --include="*.ts" --include="*.tsx" -i
```

**Keep:**
- `console.error()` messages (for crash reporting)
- `__DEV__` blocks that hide dev-only UI (correct usage)
- TODO comments that document known issues (not bugs)

**Remove:**
- `console.log()` calls
- `__DEV__` blocks that expose unfinished features
- Test/mock code (`// testing:`, `// mock:`)

---

## File Summary: Changes Across All Phases

### Files to Create (Phase 1)
1. `src/components/Text.tsx` — Copy from Vela

### Files to Create (Documentation)
1. `PRODUCTION_READINESS_AUDIT.md` — This doc
2. `DETAILED_IMPLEMENTATION_GUIDE.md` — This doc
3. `TYPOGRAPHY_AUDIT_RESULTS.md` — After Phase 3
4. `RELEASE_CONFIG_CHECKLIST.md` — After Phase 4
5. `VELA_LEARNINGS.md` — After Phase 5 (optional reference doc)

### Files to Delete
1. `src/screens/premium/MockPaymentSheet.tsx` — Phase 2
2. `/app/vela/vela/` → archive as `/docs/reference/vela-architecture/` — Phase 5

### Files to Update (10+ screens)
**Phase 1 — Typography:**
- `src/components/index.ts` (export Text)
- `src/screens/premium/PremiumScreen.tsx` (12 replacements)
- `src/screens/premium/PremiumGate.tsx` (9 replacements)
- `src/components/ModalHeader.tsx` (1 replacement)
- `src/components/IconPicker.tsx` (2 replacements)
- `src/components/ColorPicker.tsx` (2 replacements)
- `src/components/SwipeableRow.tsx` (2 replacements)
- `src/screens/transactions/AccountPicker.tsx` (3 replacements)
- `src/screens/budgets/SetBudgetScreen.tsx` (3 replacements)
- `src/screens/onboarding/SetupPINScreen.tsx` (4 replacements)

**Phase 2 — RevenueCat:**
- `package.json` (add dependency)
- `src/services/premiumService.ts` (full rewrite from Vela)
- `app/_layout.tsx` (add initializeRevenueCat)
- `src/constants/premium.ts` (verify product IDs)
- `src/screens/premium/PremiumScreen.tsx` (remove mock modal — done with Phase 1)

**Phase 4 — Release Config:**
- `app.json` (set EAS projectId)

**Phase 5 — Cleanup:**
- `.gitignore` (add `app/vela/`)
- `src/screens/settings/SettingsScreen.tsx` (remove dev buttons)

---

## Estimated Effort

| Phase | Task | Est. Time |
|-------|------|-----------|
| 1 | Create Text.tsx & export | 10 min |
| 1 | Replace in 3 priority screens | 1.5 hours |
| 1 | Replace in secondary screens | 1 hour |
| 1 | Test + iterate | 30 min |
| **Phase 1 Total** | | **3–3.5 hours** |
| 2 | Install & rewrite premiumService | 1 hour |
| 2 | Add RevenueCat init to bootstrap | 15 min |
| 2 | Update constants & simplify PremiumScreen | 30 min |
| 2 | Delete MockPaymentSheet | 5 min |
| 2 | Test on iOS + Android | 1 hour |
| **Phase 2 Total** | | **2.5–3 hours** |
| 3 | Audit major screens | 1–1.5 hours |
| 3 | Document results | 30 min |
| **Phase 3 Total** | | **1.5–2 hours** |
| 4 | App.json EAS fix | 10 min |
| 4 | App Store / Play setup | 2–3 hours |
| 4 | RevenueCat config | 30 min |
| **Phase 4 Total** | | **3–3.5 hours (mainly manual)** |
| 5 | Remove dev buttons + MockPaymentSheet ref | 15 min |
| 5 | Archive Vela code | 20 min |
| 5 | Cleanup comments | 30 min |
| 5 | Final QA test | 1 hour |
| **Phase 5 Total** | | **2 hours** |

**Grand Total:** ~12–14 hours engineering (mostly implementation, not review)

---

## Next Steps

1. **Today:** Create Text.tsx and test it
2. **By tomorrow:** Complete Phase 1 (all screens updated)
3. **Day 3:** Install react-native-purchases and migrate premiumService
4. **Day 4:** Test both phases on real devices
5. **Day 5:** Audit + cleanup
6. **Day 6:** Create app store records (lots of waiting for Apple approval)
7. **Day 7+:** Final QA and ship!

# Claro Production Rollout: Quick Reference Card

**Print this or keep nearby during implementation.**

---

## Phase 1: Typography (Monday)

**Task:** Replace `StyledText` with `Text` variants

### Create
```bash
# Copy from Vela
cp /Users/appdev/dev/claro/app/vela/vela/src/components/text/index.ts \
   /Users/appdev/dev/claro/src/components/Text.tsx
```

### Update Component Exports
**File:** `src/components/index.ts`
```typescript
export { Text } from './Text'
```

### High Priority (Do First)

| File | Replacements | Pattern |
|------|---|---|
| `src/screens/premium/PremiumScreen.tsx` | 12 | fontSize={24} fontWeight="800" → variant="header" |
| `src/screens/premium/PremiumGate.tsx` | 9 | fontSize={16} fontWeight="800" → variant="subtitle" |
| `src/components/ModalHeader.tsx` | 1 | fontSize={17} fontWeight="800" → variant="title" |

### Variant Reference

```typescript
<Text variant="hero">56/800</Text>           // Splash screens
<Text variant="display">32/800</Text>        // Very prominent
<Text variant="header">24/700</Text>         // Main headings
<Text variant="title">20/700</Text>          // Card titles
<Text variant="subtitle">16/600</Text>       // Subheadings
<Text variant="body">14/400</Text>           // Default (body)
<Text variant="bodySmall">12/400</Text>      // Compact
<Text variant="label">14/600</Text>          // Labels
<Text variant="subLabel">12/500</Text>       // Helper
<Text variant="button">14/700</Text>         // Buttons
<Text variant="metric">18/800</Text>         // Numbers
<Text variant="caption">11/400</Text>        // Tiny text
<Text variant="overline">12/700</Text>       // UPPERCASE
```

### Import Pattern
```typescript
import { Text } from '../../components'

// Use
<Text variant="header" color={Colors.textPrimary}>Title</Text>
```

---

## Phase 2: RevenueCat (Tuesday–Wednesday)

### Install Dependency
```bash
yarn add react-native-purchases
```

### Files to Update

| File | Action | Key Change |
|------|--------|-----------|
| `src/services/premiumService.ts` | Full rewrite | Replace with Vela's code, update product IDs |
| `app/_layout.tsx` | Add 1 line | `await initializeRevenueCat()` |
| `src/constants/premium.ts` | Verify | Product IDs: `claro_premium_*` |
| `src/screens/premium/PremiumScreen.tsx` | Simplify | Remove mock modal + state |

### Product IDs (Claro)
```typescript
MONTHLY:  'claro_premium_monthly'
YEARLY:   'claro_premium_yearly'
LIFETIME: 'claro_premium_lifetime'
```

### Add RevenueCat Bootstrap
**File:** `app/_layout.tsx` (in the main `useEffect`)
```typescript
import { initializeRevenueCat } from '../src/services/premiumService'

// In bootstrap useEffect:
await initializeRevenueCat()  // Add this line after loadTheme()
```

### Delete
```bash
rm src/screens/premium/MockPaymentSheet.tsx
```

### Test
```bash
expo run:ios
# or
expo run:android

# Check logs for: "[RevenueCat] Initialized successfully"
```

---

## Phase 3: Audit (Thursday)

**File:** Create `TYPOGRAPHY_AUDIT_RESULTS.md`

### Checklist
- [ ] Accounts screen
- [ ] Budgets screen
- [ ] Categories screen
- [ ] Records screen
- [ ] Analysis screen
- [ ] Settings screen
- [ ] Premium screen
- [ ] Onboarding screens
- [ ] Lock screen
- [ ] Transaction modal

### Pass Criteria per Screen
- [ ] No raw `fontSize` + `fontWeight` (all using `Text` component)
- [ ] Colors from `useColors()`, not hardcoded hex
- [ ] Hierarchy clear (headings > subtitles > body)
- [ ] No `StyledText` with typography props (should be `Text`)

---

## Phase 4: Release Config (Friday)

### Fix app.json
**File:** `app.json`

**Find:**
```json
"projectId": "YOUR_EAS_PROJECT_ID"
```

**Replace with real ID from:**
```bash
# Option 1: Check existing eas.json
cat eas.json | grep projectId

# Option 2: Run init
eas init

# Option 3: EAS dashboard
https://expo.dev/projects
```

### Create Release Checklist
**File:** `RELEASE_CONFIG_CHECKLIST.md`

Quick version:
- [ ] iOS bundle ID: `com.claro.finance` ✅
- [ ] Android package: `com.claro.finance` ✅
- [ ] App.json EAS projectId: SET ✅
- [ ] App Store: Create app + 3 subscription products
- [ ] Play Store: Create app + 3 product subscriptions
- [ ] RevenueCat: Link both platforms

---

## Phase 5: Cleanup (Friday)

### Remove Dev Buttons
**File:** `src/screens/settings/SettingsScreen.tsx`

Delete:
```typescript
{__DEV__ && (
  <StyledPressable onPress={() => clearEntitlement()}>
    <StyledText>Reset premium (dev)</StyledText>
  </StyledPressable>
)}
```

### Hide Vela Code
**File:** `.gitignore`

Add line:
```
app/vela/
```

### Clean Up Comments
**File:** `src/services/premiumService.ts`

Delete all `REVENUECAT_SWAP` comments (now live RevenueCat, no longer mock)

---

## Testing Quick Commands

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android

# Check for console errors
yarn start --clear

# Build for EAS
eas build --platform ios --local
eas build --platform android --local
```

---

## Vela Reference Files

**All at:** `/Users/appdev/dev/claro/app/vela/vela/`

```
Vela/
├─ src/components/text/index.ts        ← Copy Text.tsx from here
├─ src/services/premium.service.ts     ← Reference RevenueCat code
├─ src/hooks/usePremium.ts             ← Reference premium hook
├─ src/constants/premium.ts            ← Reference config structure
├─ TYPOGRAPHY_VARIANTS.md              ← Typography reference
└─ VELA_PREMIUM_SYSTEM.md              ← Premium system docs
```

### Quick Copy Commands

```bash
# Copy Text component
cp app/vela/vela/src/components/text/index.ts src/components/Text.tsx

# View premiumService
cat app/vela/vela/src/services/premium.service.ts

# View typography
cat app/vela/vela/src/components/text/index.ts
```

---

## Timeline At-a-Glance

```
Mon:  Phase 1 (Typography)
      ├─ Create Text.tsx
      ├─ Replace in 3 priority screens
      └─ Quick test ✓

Tue:  Phase 2 (RevenueCat) — Part 1
      ├─ Install react-native-purchases
      ├─ Rewrite premiumService.ts
      └─ Add bootstrap init

Wed:  Phase 2 (RevenueCat) — Part 2
      ├─ Simplify PremiumScreen
      ├─ Delete MockPaymentSheet
      ├─ Full payment flow test ✓

Thu:  Phase 3 + 5 (Audit + Cleanup)
      ├─ Audit all major screens
      ├─ Remove dev buttons
      └─ Archive Vela code

Fri:  Phase 4 (Release Config)
      ├─ Fix app.json
      ├─ Create store products (manual)
      └─ Full device QA ✓
```

---

## Error Troubleshooting

### "Cannot find module 'Text'"
**Fix:** Make sure `src/components/index.ts` exports it:
```typescript
export { Text } from './Text'
```

### RevenueCat logs show "Not initialized"
**Fix:** Check that `initializeRevenueCat()` was added to `app/_layout.tsx` bootstrap

### MockPaymentSheet still referenced
**Find all:**
```bash
grep -r "MockPaymentSheet" src/
```
**Delete all imports and usage**

### EAS projectId error on build
**Fix:** Update `app.json`:
```bash
eas init  # Generates projectId
```

### Premium not persisting after app close
**Check:** SecureStore permissions in `app.json` plugins

---

## Success Signals

✅ **Phase 1 Done**
- Text component appears in all imports
- No console errors on app start
- Text renders with correct sizing/weight

✅ **Phase 2 Done**
- RevenueCat initializes (logs show "Initialized successfully")
- Purchase button triggers real payment sheet (not mock)
- Premium state persists after close/reopen

✅ **Phase 3 Done**
- All major screens audited
- Typography hierarchy is clear
- No visual inconsistencies

✅ **Phase 4 Done**
- `eas build` succeeds
- app.json has real projectId
- App Store/Play Store records created

✅ **Phase 5 Done**
- MockPaymentSheet.tsx deleted
- No dev buttons visible
- `/app/vela/` .gitignored
- Ready to submit!

---

## Critical Paths

If time is tight, do these in order:

1. **Phase 1** (3–3.5 hrs) — Typography (visual impact)
2. **Phase 2a** (1 hr) — RevenueCat setup + test purchase
3. **Phase 2b** (1.5 hrs) — Simplify PremiumScreen + remove mock
4. **Phase 5** (1 hr) — Cleanup + remove dev code
5. **Phase 4** (2–3 hrs) — Store config (can do in parallel with QA)
6. **Phase 3** (1–2 hrs) — Consistency audit (optional if time tight, can be v1.1)

---

## Remember

- 🟢 All changes come from Vela (production-tested)
- 🟢 Copy-paste straightforward: text variants + RevenueCat code
- 🟢 No logic changes to core Claro functionality
- 🟢 Low risk: Isolated changes, mechanical refactoring

---

**Questions? See full docs:**
- `PRODUCTION_READINESS_AUDIT.md` — Full strategy
- `DETAILED_IMPLEMENTATION_GUIDE.md` — Step-by-step
- `ARCHITECTURE_TRANSFORMATION.md` — Visual guide

**Ready? Start Phase 1 Monday.** 🚀

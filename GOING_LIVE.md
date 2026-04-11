# Going Live with In-App Purchases

## Step 1 — App Store Connect Setup

1. Go to https://appstoreconnect.apple.com
2. Create your app: **My Apps → + → New App**
   - Name: Claro
   - Bundle ID: `com.claro.finance`
   - SKU: `claro-finance`

3. Create subscription group: **Features → In-App Purchases → Subscriptions**
   - Group name: "Claro Premium"
   - Add 3 products:

| Product ID                            | Type                    | Price  |
|---------------------------------------|-------------------------|--------|
| `com.claro.finance.premium.monthly`   | Auto-Renewable          | £0.99  |
| `com.claro.finance.premium.yearly`    | Auto-Renewable          | £5.99  |
| `com.claro.finance.premium.lifetime`  | Non-Consumable          | £3.99  |

4. For the yearly plan: add a **7-day free trial**
5. Add **subscription promotional text** (shown on the paywall)
6. Submit for review (Apple reviews IAP products separately)

---

## Step 2 — RevenueCat Setup

1. Create account at https://app.revenuecat.com
2. Create a new project → Add iOS app → enter bundle ID `com.claro.finance`
3. In **Products**, add the 3 product IDs above
4. Create an **Entitlement** called `premium`, attach all 3 products
5. Create an **Offering** called `default`, add 3 packages:
   - Monthly → `com.claro.finance.premium.monthly`
   - Annual  → `com.claro.finance.premium.yearly`
   - Lifetime → `com.claro.finance.premium.lifetime`
6. Copy your **RevenueCat Public SDK Key** (starts with `appl_...`)

---

## Step 3 — Install RevenueCat

```bash
npm install react-native-purchases
npx expo prebuild
```

Add to `app.json` plugins:
```json
["react-native-purchases", { "apiKey": "appl_YOUR_KEY_HERE" }]
```

---

## Step 4 — Swap the Purchase Functions

In `src/services/premiumService.ts`:

1. Add at the top:
```ts
import Purchases from 'react-native-purchases'

// Initialise once at app startup (call from _layout.tsx bootstrap)
export const initRevenueCat = () => {
  Purchases.configure({ apiKey: 'appl_YOUR_KEY_HERE' })
}
```

2. Replace each function marked `REVENUECAT_SWAP` with the commented
   RevenueCat code directly above each stub.

3. In `app/_layout.tsx` bootstrap, add:
```ts
import { initRevenueCat } from '../src/services/premiumService'
// Inside bootstrap():
initRevenueCat()
```

---

## Step 5 — Remove Mock / Dev Code

1. Delete `src/screens/premium/MockPaymentSheet.tsx`
2. In `PremiumScreen.tsx`:
   - Remove `import { MockPaymentSheet }`
   - Remove `const [showPayment, setShowPayment] = useState(false)`
   - Change `handlePurchasePress` → call buy functions directly
   - Remove `<MockPaymentSheet ... />`
3. In `SettingsScreen.tsx`:
   - Remove the `handleResetPremium` callback
   - Remove the `clearEntitlement` import
   - The `__DEV__` guard already hides the row in prod, but clean it up

---

## Step 6 — Privacy Policy

Apple **requires** a privacy policy URL for any app with IAP.

Create a simple one at https://app.termly.io (free) or write your own.
Add the URL to App Store Connect → App Privacy.

---

## Step 7 — Build & Submit

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

---

## Checklist Before Submission

- [ ] Privacy policy URL added to App Store Connect
- [ ] All 3 IAP products approved by Apple
- [ ] `ITSAppUsesNonExemptEncryption: false` in app.json (already set)
- [ ] Screenshots uploaded (6.5" iPhone required)
- [ ] App description written
- [ ] Age rating completed
- [ ] `__DEV__` mock code confirmed hidden in production
- [ ] Restore purchases button present on paywall (already there ✓)
- [ ] Subscription terms visible on paywall (already there ✓)

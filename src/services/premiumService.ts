/**
 * premiumService.ts
 *
 * RevenueCat-powered premium entitlement management.
 *
 * Configuration:
 * - API Key: Provided on app initialization (app/_layout.tsx)
 * - Entitlement ID: "premium"
 * - Offering ID: "default"
 * - Product IDs: claro_premium_{monthly|yearly|lifetime}
 */

import Purchases, {
  CustomerInfo,
  PurchasesError,
} from 'react-native-purchases'

export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime' | null

export interface EntitlementInfo {
  isActive:    boolean
  plan:        PremiumPlan
  expiresAt:   string | null
  purchasedAt: string | null
}

const ENTITLEMENT_ID = 'premium'
const OFFERING_ID = 'default'

// Map product IDs to plan types
const getPlanFromProductId = (productId: string): PremiumPlan => {
  if (productId.includes('lifetime')) return 'lifetime'
  if (productId.includes('yearly') || productId.includes('annual')) return 'yearly'
  return 'monthly'
}

// ─── Read entitlement from RevenueCat ─────────────────────────────────────────

export const getEntitlement = async (): Promise<EntitlementInfo> => {
  try {
    const info = await Purchases.getCustomerInfo()
    const entitlement = info.entitlements.active[ENTITLEMENT_ID]

    if (!entitlement) {
      return { isActive: false, plan: null, expiresAt: null, purchasedAt: null }
    }

    // EntitlementInfo is active
    const plan = getPlanFromProductId(entitlement.productIdentifier)
    return {
      isActive: true,
      plan,
      expiresAt: entitlement.expirationDate,
      purchasedAt: new Date().toISOString(),
    }
  } catch (err: any) {
    console.error('[getEntitlement]', err?.message)
    return { isActive: false, plan: null, expiresAt: null, purchasedAt: null }
  }
}

export const isPremiumActive = async (): Promise<boolean> => {
  const info = await getEntitlement()
  return info.isActive
}

// ─── Purchase functions ───────────────────────────────────────────────────────

export const purchaseMonthly = async (): Promise<boolean> => {
  try {
    const offerings = await Purchases.getOfferings()
    if (!offerings.current) {
      throw new Error('No offerings available')
    }
    const pkg = offerings.current.monthly

    if (!pkg) {
      throw new Error('Monthly package not found in offerings')
    }

    await Purchases.purchasePackage(pkg)
    const info = await Purchases.getCustomerInfo()
    return !!info.entitlements.active[ENTITLEMENT_ID]
  } catch (err: any) {
    if (err?.code === 'PurchaseCancelledError') {
      console.info('[purchaseMonthly] User cancelled purchase')
      return false
    }
    console.error('[purchaseMonthly]', err?.message)
    throw err
  }
}

export const purchaseYearly = async (): Promise<boolean> => {
  try {
    const offerings = await Purchases.getOfferings()
    if (!offerings.current) {
      throw new Error('No offerings available')
    }
    const pkg = offerings.current.annual

    if (!pkg) {
      throw new Error('Annual package not found in offerings')
    }

    await Purchases.purchasePackage(pkg)
    const info = await Purchases.getCustomerInfo()
    return !!info.entitlements.active[ENTITLEMENT_ID]
  } catch (err: any) {
    if (err?.code === 'PurchaseCancelledError') {
      console.info('[purchaseYearly] User cancelled purchase')
      return false
    }
    console.error('[purchaseYearly]', err?.message)
    throw err
  }
}

export const purchaseLifetime = async (): Promise<boolean> => {
  try {
    const offerings = await Purchases.getOfferings()
    if (!offerings.current) {
      throw new Error('No offerings available')
    }
    const pkg = offerings.current.lifetime

    if (!pkg) {
      throw new Error('Lifetime package not found in offerings')
    }

    await Purchases.purchasePackage(pkg)
    const info = await Purchases.getCustomerInfo()
    return !!info.entitlements.active[ENTITLEMENT_ID]
  } catch (err: any) {
    if (err?.code === 'PurchaseCancelledError') {
      console.info('[purchaseLifetime] User cancelled purchase')
      return false
    }
    console.error('[purchaseLifetime]', err?.message)
    throw err
  }
}

export const restorePurchases = async (): Promise<boolean> => {
  try {
    const info = await Purchases.restorePurchases()
    return !!info.entitlements.active[ENTITLEMENT_ID]
  } catch (err: any) {
    console.error('[restorePurchases]', err?.message)
    return false
  }
}

// ─── Manual clear (dev only) ──────────────────────────────────────────────────

export const clearEntitlement = async (): Promise<void> => {
  // Dev-only: logs out current user so they can test paywall again
  // RevenueCat will treat them as a new user
  try {
    await Purchases.logOut()
  } catch (err: any) {
    console.error('[clearEntitlement]', err?.message)
  }
}


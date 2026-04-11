import { useCallback } from 'react'
import { usePremiumStore } from '../stores'
import {
  purchaseMonthly, purchaseYearly, purchaseLifetime,
  restorePurchases, getEntitlement,
} from '../services/premiumService'
import { toastService, loaderService } from 'fluent-styles'
import { FREE_LIMITS } from '../constants/premium'

export function usePremium() {
  const { isPremium, plan, setEntitlement, setLoading } = usePremiumStore()

  const refresh = useCallback(async () => {
    const info = await getEntitlement()
    setEntitlement(info.isActive, info.plan)
  }, [setEntitlement])

  const buyMonthly = useCallback(async () => {
    const id = loaderService.show({ label: 'Processing…', variant: 'spinner' })
    try {
      await purchaseMonthly()
      await refresh()
      toastService.success('Welcome to Claro Premium! 🎉')
      return true
    } catch (err: any) {
      toastService.error('Purchase failed', err?.message)
      return false
    } finally {
      loaderService.hide(id)
    }
  }, [refresh])

  const buyYearly = useCallback(async () => {
    const id = loaderService.show({ label: 'Processing…', variant: 'spinner' })
    try {
      await purchaseYearly()
      await refresh()
      toastService.success('Welcome to Claro Premium! 🎉')
      return true
    } catch (err: any) {
      toastService.error('Purchase failed', err?.message)
      return false
    } finally {
      loaderService.hide(id)
    }
  }, [refresh])

  const buyLifetime = useCallback(async () => {
    const id = loaderService.show({ label: 'Processing…', variant: 'spinner' })
    try {
      await purchaseLifetime()
      await refresh()
      toastService.success('Welcome to Claro Premium! 🎉')
      return true
    } catch (err: any) {
      toastService.error('Purchase failed', err?.message)
      return false
    } finally {
      loaderService.hide(id)
    }
  }, [refresh])

  const restore = useCallback(async () => {
    const id = loaderService.show({ label: 'Restoring…', variant: 'spinner' })
    try {
      const restored = await restorePurchases()
      if (restored) {
        await refresh()
        toastService.success('Purchases restored!')
      } else {
        toastService.info('No purchases found', 'No active subscription found for this account')
      }
      return restored
    } catch (err: any) {
      toastService.error('Restore failed', err?.message)
      return false
    } finally {
      loaderService.hide(id)
    }
  }, [refresh])

  return {
    isPremium,
    plan,
    refresh,
    buyMonthly,
    buyYearly,
    buyLifetime,
    restore,
    limits: FREE_LIMITS,
    canAddAccount:     (count: number) => isPremium || count < FREE_LIMITS.ACCOUNTS,
    canAddBudget:      (count: number) => isPremium || count < FREE_LIMITS.BUDGETS,
    canAddTransaction: (count: number) => isPremium || count < FREE_LIMITS.TRANSACTIONS_MONTH,
    canAddCategory:    (count: number) => isPremium || count < FREE_LIMITS.CATEGORIES,
    canUseTheme:       (key: string)   => isPremium || key === 'forest',
    canExport:         ()              => isPremium,
  }
}

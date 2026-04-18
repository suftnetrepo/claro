import React, { useEffect, useState } from 'react'
import { Slot, router } from 'expo-router'
import { GlobalPortalProvider, PortalManager } from 'fluent-styles'
import * as SplashScreen from 'expo-splash-screen'
import Purchases from 'react-native-purchases'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { runMigrations }   from '../src/db'
import { seedDatabase }    from '../src/db/seed'
import { isSetupComplete, isBiometricAvailable } from '../src/utils/security'
import { getEntitlement } from '../src/services/premiumService'
import { useAuthStore, useThemeStore, usePremiumStore } from '../src/stores'
import { Colors }          from '../src/constants'

// Keep splash visible while bootstrapping
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [appReady,     setAppReady]     = useState(false)
  const [initialRoute, setInitialRoute] = useState<string | null>(null)

  const { setSetupComplete, setBiometricAvailable, setLocked } = useAuthStore()
  const { loadTheme } = useThemeStore()
  const { setEntitlement } = usePremiumStore()

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  })

  // Bootstrap: DB + auth state
  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Initialize RevenueCat for premium entitlements
        try {
          await Purchases.configure({
            apiKey: 'test_BPTAkjhaoloCncWLmXdahGGqQfo',
            appUserID: undefined, // Anonymous user; RevenueCat generates an ID
          })
        } catch (rcErr: any) {
          // RevenueCat might throw if already configured; this is safe to ignore
          if (!rcErr?.message?.includes('already')) {
            console.warn('[RevenueCat init]', rcErr?.message)
          }
        }

        await loadTheme()
        const entitlement = await getEntitlement()
        setEntitlement(entitlement.isActive, entitlement.plan)
        await runMigrations()
        await seedDatabase()
        const setupDone    = await isSetupComplete()
        const bioAvailable = await isBiometricAvailable()
        setSetupComplete(setupDone)
        setBiometricAvailable(bioAvailable)
        setInitialRoute(!setupDone ? '/(onboarding)/setup-pin' : '/(lock)')
        if (setupDone) setLocked(true)
      } catch (e) {
        console.error('[Bootstrap]', e)
        setInitialRoute('/(onboarding)/setup-pin')
      } finally {
        setAppReady(true)
      }
    }
    bootstrap()
  }, [])

  // Hide splash only when BOTH fonts and app data are ready
  const isReady = appReady && (fontsLoaded || !!fontError)

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync()
    }
  }, [isReady])

  // Navigate to initial route once ready
  useEffect(() => {
    if (isReady && initialRoute) {
      router.replace(initialRoute as any)
    }
  }, [isReady, initialRoute])

  // Don't render until fonts loaded — prevents FOUT
  if (!isReady) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobalPortalProvider>
        <PortalManager>
          <Slot />
        </PortalManager>
      </GlobalPortalProvider>
    </GestureHandlerRootView>
  )
}

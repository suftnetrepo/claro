import React, { useEffect, useState, useCallback } from 'react'
import { Stack, router } from 'expo-router'
import { GlobalPortalProvider, PortalManager, StyledPage } from 'fluent-styles'
import * as SplashScreen from 'expo-splash-screen'
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
  const [navReady,     setNavReady]     = useState(false)
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

  // Navigate once layout is mounted + everything ready
  const onLayout = useCallback(() => setNavReady(true), [])

  useEffect(() => {
    if (isReady && navReady && initialRoute) {
      router.replace(initialRoute as any)
    }
  }, [isReady, navReady, initialRoute])

  // Don't render until fonts loaded — prevents FOUT
  if (!isReady) return null

  return (
    <GlobalPortalProvider>
      <PortalManager>
        <StyledPage
          flex={1}
          backgroundColor={Colors.bg}
          onLayout={onLayout}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(lock)" />
            <Stack.Screen name="add-transaction"  options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="edit-transaction" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="add-account"      options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="add-category"     options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="set-budget"       options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="change-pin"       options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="premium"            options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </StyledPage>
      </PortalManager>
    </GlobalPortalProvider>
  )
}

import { Stack } from 'expo-router'
import { Colors } from '../../src/constants'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
      <Stack.Screen name="setup-pin" />
      <Stack.Screen name="currency"  />
    </Stack>
  )
}

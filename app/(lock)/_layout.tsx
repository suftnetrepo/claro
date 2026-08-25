import { Stack } from 'expo-router'
import { Colors } from '../../src/constants'

export default function LockLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
      <Stack.Screen name="index" />
    </Stack>
  )
}

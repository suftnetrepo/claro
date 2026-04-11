import { Stack } from 'expo-router'
import { Colors } from '../../src/constants'
import LockScreen from '../../src/screens/lock/LockScreen'

export default function LockRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LockScreen />
    </>
  )
}

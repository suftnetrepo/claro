import { Stack } from 'expo-router'
import ChangePINScreen from '../src/screens/settings/ChangePINScreen'

export default function ChangePINRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <ChangePINScreen />
    </>
  )
}

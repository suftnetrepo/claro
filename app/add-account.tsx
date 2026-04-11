import { Stack } from 'expo-router'
import AddAccountScreen from '../src/screens/accounts/AddAccountScreen'
export default function AddAccountRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <AddAccountScreen />
    </>
  )
}

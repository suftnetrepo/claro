import { Stack } from 'expo-router'
import AddTransactionScreen from '../src/screens/transactions/AddTransactionScreen'

export default function AddTransactionRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <AddTransactionScreen />
    </>
  )
}

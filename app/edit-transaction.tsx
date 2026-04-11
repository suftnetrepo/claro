import { Stack } from 'expo-router'
import EditTransactionScreen from '../src/screens/transactions/EditTransactionScreen'
export default function EditTransactionRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <EditTransactionScreen />
    </>
  )
}

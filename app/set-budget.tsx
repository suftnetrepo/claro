import { Stack } from 'expo-router'
import SetBudgetScreen from '../src/screens/budgets/SetBudgetScreen'
export default function SetBudgetRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'card' }} />
      <SetBudgetScreen />
    </>
  )
}
import { Stack } from 'expo-router'
import AddCategoryScreen from '../src/screens/categories/AddCategoryScreen'
export default function AddCategoryRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <AddCategoryScreen />
    </>
  )
}

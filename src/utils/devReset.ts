/**
 * Emergency reset — clears PIN, setup flag, and biometric setting.
 * Import and call resetAll() from any screen during development.
 * 
 * Usage in any component:
 *   import { resetAll } from '../../utils/devReset'
 *   <Button onPress={resetAll} title="DEV RESET" />
 */
import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from '../constants'

export const resetAll = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.PIN_HASH),
    SecureStore.deleteItemAsync(STORAGE_KEYS.SETUP_COMPLETE),
    SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED),
  ])
  console.log('[devReset] All secure storage cleared — restart the app')
}

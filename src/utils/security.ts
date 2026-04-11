import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'
import CryptoJS from 'crypto-js'
import { STORAGE_KEYS, CONFIG } from '../constants'

// ─── PIN helpers ──────────────────────────────────────────────────────────────

const hashPIN = (pin: string): string =>
  CryptoJS.SHA256(pin + 'claro_salt_v1').toString()

export const savePin = async (pin: string): Promise<void> => {
  await SecureStore.setItemAsync(STORAGE_KEYS.PIN_HASH, hashPIN(pin))
}

export const verifyPin = async (pin: string): Promise<boolean> => {
  const stored = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH)
  if (!stored) return false
  return stored === hashPIN(pin)
}

export const hasPin = async (): Promise<boolean> => {
  const stored = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH)
  return !!stored
}

export const deletePin = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.PIN_HASH)
}

// ─── Biometric helpers ────────────────────────────────────────────────────────

export const isBiometricAvailable = async (): Promise<boolean> => {
  const compatible = await LocalAuthentication.hasHardwareAsync()
  if (!compatible) return false
  const enrolled = await LocalAuthentication.isEnrolledAsync()
  return enrolled
}

export const getBiometricType = async (): Promise<'face' | 'fingerprint' | 'none'> => {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'face'
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint'
  return 'none'
}

export const authenticateWithBiometric = async (): Promise<boolean> => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage:          'Unlock Claro',
    cancelLabel:            'Use PIN',
    disableDeviceFallback:  true,
    fallbackLabel:          '',
  })
  return result.success
}

// ─── Setup complete ───────────────────────────────────────────────────────────

export const markSetupComplete = async (): Promise<void> => {
  await SecureStore.setItemAsync(STORAGE_KEYS.SETUP_COMPLETE, 'true')
}

export const isSetupComplete = async (): Promise<boolean> => {
  const val = await SecureStore.getItemAsync(STORAGE_KEYS.SETUP_COMPLETE)
  return val === 'true'
}

// ─── Biometric preference ─────────────────────────────────────────────────────

export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false')
}

export const isBiometricEnabled = async (): Promise<boolean> => {
  const val = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED)
  return val === 'true'
}

export const clearSetup = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.SETUP_COMPLETE),
    SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED),
  ])
}
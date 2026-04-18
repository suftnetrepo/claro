import React, { useState, useCallback, useEffect } from 'react'
import { Vibration } from 'react-native'
import { router } from 'expo-router'
import { Stack, StyledText, StyledPressable, StyleShape, StyledPage } from 'fluent-styles'
import { LockIcon, BackspaceIcon, FingerprintIcon } from '../../icons'
import { Colors, useColors, CONFIG, Fonts } from '../../constants'
import { verifyPin, authenticateWithBiometric, isBiometricEnabled, isBiometricAvailable } from '../../utils/security'
import { useAuthStore } from '../../stores'

const PIN_PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function LockScreen() {
  const Colors = useColors()
  const [pin,     setPin]     = useState('')
  const [error,   setError]   = useState('')
  const [showBio, setShowBio] = useState(false)
  const { pinAttempts, lockedUntil, incrementPinAttempts, resetPinAttempts, setLocked } = useAuthStore()

  useEffect(() => {
    Promise.all([isBiometricAvailable(), isBiometricEnabled()])
      .then(([avail, enabled]) => setShowBio(avail && enabled))
  }, [])

  useEffect(() => { if (showBio) handleBiometric() }, [showBio])

  const isLockedOut = !!(lockedUntil && lockedUntil > new Date())

  const unlock = useCallback(() => {
    resetPinAttempts(); setLocked(false); router.replace('/(tabs)/records')
  }, [resetPinAttempts, setLocked])

  const handleBiometric = async () => {
    try { if (await authenticateWithBiometric()) unlock() } catch {}
  }

  const handleKey = useCallback(async (key: string) => {
    if (key === '' || isLockedOut) return
    setError('')
    if (key === '⌫') { setPin(p => p.slice(0, -1)); return }
    const next = pin + key
    if (next.length > CONFIG.PIN_LENGTH) return
    setPin(next)
    if (next.length === CONFIG.PIN_LENGTH) {
      if (await verifyPin(next)) { unlock() }
      else {
        Vibration.vibrate(300)
        incrementPinAttempts()
        setPin('')
        const attempts = pinAttempts + 1
        setError(attempts >= CONFIG.MAX_PIN_ATTEMPTS
          ? 'Too many attempts. Try again in 30 seconds.'
          : `Incorrect PIN. ${CONFIG.MAX_PIN_ATTEMPTS - attempts} attempts left.`)
      }
    }
  }, [pin, isLockedOut, pinAttempts, incrementPinAttempts, unlock])

  const [countdown, setCountdown] = useState(0)
  useEffect(() => {
    if (!isLockedOut) { setCountdown(0); return }
    const interval = setInterval(() => {
      const secs = Math.ceil((lockedUntil!.getTime() - Date.now()) / 1000)
      if (secs <= 0) { setCountdown(0); setError(''); clearInterval(interval) }
      else setCountdown(secs)
    }, 1000)
    return () => clearInterval(interval)
  }, [isLockedOut, lockedUntil])

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <Stack flex={1} alignItems="center" justifyContent="center" paddingHorizontal={32}>
      <StyleShape cycle size={68} backgroundColor={Colors.accent} alignItems="center" justifyContent="center" marginBottom={20}>
        <LockIcon size={28} color={Colors.primary} />
      </StyleShape>

      <StyledText fontSize={28} fontWeight="800" color={Colors.textPrimary} textAlign="center" letterSpacing={-0.5} marginBottom={8}>Claro</StyledText>
      <StyledText fontSize={14} color={Colors.textMuted} textAlign="center" marginBottom={48}>Enter your PIN to continue</StyledText>

      <Stack horizontal gap={16} justifyContent="center" marginBottom={16}>
        {Array.from({ length: CONFIG.PIN_LENGTH }, (_, i) => (
          <Stack key={i} width={14} height={14} borderRadius={7}
            backgroundColor={i < pin.length ? (error ? Colors.pinError : Colors.pinFilled) : Colors.pinEmpty} />
        ))}
      </Stack>

      {(!!error || isLockedOut) && (
        <StyledText fontSize={13} color={Colors.expense} textAlign="center" marginBottom={8}>
          {isLockedOut ? `Locked. Try again in ${countdown}s` : error}
        </StyledText>
      )}

      <Stack flexDirection="row" flexWrap="wrap" gap={12} marginTop={32} width={264}>
        {PIN_PAD.map((key, i) => {
          const isBioKey = key === '' && i === 9 && showBio
          return (
            <StyledPressable
              key={i}
              width={80} height={80} borderRadius={40}
              backgroundColor={key === '' && !isBioKey ? 'transparent' : Colors.bgCard}
              borderWidth={key === '' && !isBioKey ? 0 : 1}
              borderColor={key === '' && !isBioKey ? 'transparent' : Colors.border}
              alignItems="center" justifyContent="center"
              onPress={() => isBioKey ? handleBiometric() : handleKey(key)}
              disabled={(key === '' && !isBioKey) || isLockedOut}
              opacity={isLockedOut ? 0.4 : 1}
            >
              {key === '⌫'
                ? <BackspaceIcon size={22} color={Colors.textPrimary} />
                : isBioKey
                ? <FingerprintIcon size={24} color={Colors.primary} />
                : <StyledText fontSize={24} fontWeight="600" color={isLockedOut ? Colors.textMuted : Colors.textPrimary}>{key}</StyledText>
              }
            </StyledPressable>
          )
        })}
      </Stack>
      </Stack>
    </StyledPage>
  )
}

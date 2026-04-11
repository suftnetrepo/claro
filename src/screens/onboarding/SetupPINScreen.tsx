import React, { useState, useCallback } from 'react'
import { Vibration, Alert } from 'react-native'
import { router } from 'expo-router'
import { Stack, StyledText, StyledPressable, StyleShape } from 'fluent-styles'
import { LockIcon, BackspaceIcon } from '../../icons'
import { Colors, useColors, Fonts, CONFIG } from '../../constants'
import { savePin, markSetupComplete } from '../../utils/security'
import { useAuthStore } from '../../stores'

const PIN_PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function SetupPINScreen() {
  const Colors = useColors()
  const [step,     setStep]     = useState<'create' | 'confirm'>('create')
  const [pin,      setPin]      = useState('')
  const [firstPin, setFirstPin] = useState('')
  const [error,    setError]    = useState('')
  const { setSetupComplete } = useAuthStore()

  const handleKey = useCallback((key: string) => {
    if (key === '') return
    setError('')
    if (key === '⌫') { setPin(p => p.slice(0, -1)); return }
    const next = pin + key
    if (next.length > CONFIG.PIN_LENGTH) return
    setPin(next)
    if (next.length === CONFIG.PIN_LENGTH) {
      if (step === 'create') { setFirstPin(next); setPin(''); setStep('confirm') }
      else {
        if (next === firstPin) { handleConfirmed(next) }
        else {
          Vibration.vibrate(200)
          setError('PINs do not match. Try again.')
          setPin(''); setFirstPin(''); setStep('create')
        }
      }
    }
  }, [pin, step, firstPin])

  const handleConfirmed = async (confirmedPin: string) => {
    try {
      await savePin(confirmedPin)
      await markSetupComplete()
      setSetupComplete(true)
      router.replace('/(onboarding)/currency')
    } catch {
      Alert.alert('Error', 'Failed to save PIN. Please try again.')
      setPin(''); setFirstPin(''); setStep('create')
    }
  }

  return (
    <Stack flex={1} backgroundColor={Colors.bg} alignItems="center" justifyContent="center" paddingHorizontal={32}>
      <StyleShape cycle size={64} backgroundColor={Colors.accent} alignItems="center" justifyContent="center" marginBottom={28}>
        <LockIcon size={28} color={Colors.primary} />
      </StyleShape>

      <StyledText fontSize={24} fontWeight="800" fontFamily={Fonts.extraBold} color={Colors.textPrimary} textAlign="center" marginBottom={8} letterSpacing={-0.5}>
        {step === 'create' ? 'Create your PIN' : 'Confirm your PIN'}
      </StyledText>
      <StyledText fontSize={14} color={Colors.textMuted} textAlign="center" marginBottom={48}>
        {step === 'create' ? 'Set a 4-digit PIN to protect your finances' : 'Enter the same PIN again to confirm'}
      </StyledText>

      <Stack horizontal gap={16} justifyContent="center" marginBottom={16}>
        {Array.from({ length: CONFIG.PIN_LENGTH }, (_, i) => (
          <Stack key={i} width={14} height={14} borderRadius={7}
            backgroundColor={i < pin.length ? (error ? Colors.pinError : Colors.pinFilled) : Colors.pinEmpty} />
        ))}
      </Stack>

      {!!error && <StyledText fontSize={13} color={Colors.expense} textAlign="center" marginBottom={16}>{error}</StyledText>}

      <Stack flexDirection="row" flexWrap="wrap" gap={12} marginTop={32} width={264}>
        {PIN_PAD.map((key, i) => (
          <StyledPressable
            key={i}
            width={80} height={80} borderRadius={40}
            backgroundColor={key === '' ? 'transparent' : Colors.bgCard}
            borderWidth={key === '' ? 0 : 1}
            borderColor={key === '' ? 'transparent' : Colors.border}
            alignItems="center" justifyContent="center"
            onPress={() => handleKey(key)}
            disabled={key === ''}
          >
            {key === '⌫'
              ? <BackspaceIcon size={22} color={Colors.textPrimary} />
              : <StyledText fontSize={24} fontWeight="600" color={Colors.textPrimary}>{key}</StyledText>
            }
          </StyledPressable>
        ))}
      </Stack>
    </Stack>
  )
}

import React, { useState, useCallback } from 'react'
import { Vibration } from 'react-native'
import { router } from 'expo-router'
import { Stack, StyledText, StyledPressable, StyleShape, StyledPage } from 'fluent-styles'
import { toastService } from 'fluent-styles'
import { LockIcon, BackspaceIcon } from '../../icons'
import { Colors, useColors, CONFIG } from '../../constants'
import { verifyPin, savePin } from '../../utils/security'

type Step = 'verify' | 'new' | 'confirm'

const STEP_TITLES: Record<Step, string> = {
  verify:  'Enter current PIN',
  new:     'Enter new PIN',
  confirm: 'Confirm new PIN',
}
const STEP_SUBTITLES: Record<Step, string> = {
  verify:  'Enter your existing PIN to continue',
  new:     'Choose a new 4-digit PIN',
  confirm: 'Enter your new PIN again to confirm',
}

const PIN_PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function ChangePINScreen() {
  const Colors = useColors()
  const [step,    setStep]    = useState<Step>('verify')
  const [pin,     setPin]     = useState('')
  const [newPin,  setNewPin]  = useState('')
  const [error,   setError]   = useState('')

  const handleKey = useCallback(async (key: string) => {
    if (key === '') return
    setError('')

    if (key === '⌫') {
      setPin(p => p.slice(0, -1))
      return
    }

    const next = pin + key
    if (next.length > CONFIG.PIN_LENGTH) return
    setPin(next)

    if (next.length === CONFIG.PIN_LENGTH) {
      if (step === 'verify') {
        const ok = await verifyPin(next)
        if (ok) {
          setPin('')
          setStep('new')
        } else {
          Vibration.vibrate(300)
          setPin('')
          setError('Incorrect PIN. Please try again.')
        }
      } else if (step === 'new') {
        setNewPin(next)
        setPin('')
        setStep('confirm')
      } else {
        // confirm
        if (next === newPin) {
          await savePin(next)
          toastService.success('PIN changed successfully')
          router.back()
        } else {
          Vibration.vibrate(300)
          setPin('')
          setNewPin('')
          setStep('new')
          setError('PINs did not match. Start again.')
        }
      }
    }
  }, [pin, step, newPin])

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <Stack flex={1} alignItems="center" justifyContent="center" paddingHorizontal={32}>

      <StyleShape
        cycle size={64} backgroundColor={Colors.accent}
        alignItems="center" justifyContent="center" marginBottom={28}
      >
        <LockIcon size={28} color={Colors.primary} />
      </StyleShape>

      <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} textAlign="center" marginBottom={8} letterSpacing={-0.5}>
        {STEP_TITLES[step]}
      </StyledText>
      <StyledText fontSize={14} color={Colors.textMuted} textAlign="center" marginBottom={48}>
        {STEP_SUBTITLES[step]}
      </StyledText>

      {/* PIN dots */}
      <Stack horizontal gap={16} justifyContent="center" marginBottom={16}>
        {Array.from({ length: CONFIG.PIN_LENGTH }, (_, i) => (
          <Stack
            key={i} width={14} height={14} borderRadius={7}
            backgroundColor={i < pin.length
              ? (error ? Colors.pinError : Colors.pinFilled)
              : Colors.pinEmpty}
          />
        ))}
      </Stack>

      {!!error && (
        <StyledText fontSize={13} color={Colors.expense} textAlign="center" marginBottom={8}>
          {error}
        </StyledText>
      )}

      {/* Keypad */}
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

      {/* Cancel */}
      <StyledPressable marginTop={32} onPress={() => router.back()}>
        <StyledText fontSize={15} fontWeight="600" color={Colors.textMuted}>Cancel</StyledText>
      </StyledPressable>

      </Stack>
    </StyledPage>
  )
}

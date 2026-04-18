import React, { useState, useCallback } from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { BackspaceIcon } from '../../icons'
import { useColors } from '../../constants'

interface CalculatorProps {
  value:     string
  onChange:  (val: string) => void
  symbol:    string
}

const KEYS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['.', '0', '⌫'],
]

export const Calculator: React.FC<CalculatorProps> = ({ value, onChange, symbol }) => {
  const handleKey = useCallback((key: string) => {
    if (key === '⌫') {
      onChange(value.length <= 1 ? '0' : value.slice(0, -1))
      return
    }

    // Prevent multiple decimals
    if (key === '.' && value.includes('.')) return

    // Start fresh if currently showing 0
    if (value === '0' && key !== '.') {
      onChange(key)
      return
    }

    // Max 2 decimal places
    const dotIndex = value.indexOf('.')
    if (dotIndex !== -1 && value.length - dotIndex > 2) return

    // Max 10 digits total
    if (value.replace('.', '').length >= 10) return

    onChange(value + key)
  }, [value, onChange])

  const Colors = useColors()
  const displayValue = value === '' ? '0' : value

  return (
    <Stack>
      {/* Amount display */}
      <Stack alignItems="center" justifyContent="center" paddingVertical={32} paddingHorizontal={24}>
        <Stack horizontal alignItems="baseline" gap={2}>
          <StyledText fontSize={22} fontWeight="700" color={Colors.textMuted}>
            {symbol}
          </StyledText>
          <StyledText
            fontSize={displayValue.length > 8 ? 40 : 56}
            fontWeight="800"
            color={Colors.textPrimary}
            letterSpacing={-1.5}
            lineHeight={displayValue.length > 8 ? 48 : 62}
          >
            {displayValue}
          </StyledText>
        </Stack>
      </Stack>

      {/* Keypad grid — softer borders and visual weight */}
      <Stack paddingHorizontal={20} paddingBottom={8} gap={6}>
        {KEYS.map((row, ri) => (
          <Stack key={ri} horizontal gap={6}>
            {row.map((key) => (
              <StyledPressable
                key={key}
                flex={1}
                height={68}
                borderRadius={16}
                backgroundColor={key === '⌫' ? Colors.expenseLight + '40' : Colors.bgCard}
                borderWidth={0.5}
                borderColor={key === '⌫' ? Colors.expense + '30' : Colors.border + '50'}
                alignItems="center"
                justifyContent="center"
                onPress={() => handleKey(key)}
              >
                {key === '⌫' ? (
                  <BackspaceIcon size={20} color={Colors.expense + 'CC'} />
                ) : (
                  <StyledText fontSize={22} fontWeight="600" color={Colors.textPrimary}>
                    {key}
                  </StyledText>
                )}
              </StyledPressable>
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

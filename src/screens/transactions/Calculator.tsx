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
      <Stack alignItems="center" justifyContent="center" paddingVertical={8} paddingHorizontal={24}>
        <Stack horizontal alignItems="flex-end" gap={4}>
          <StyledText fontSize={20} fontWeight="700" color={Colors.textMuted} marginBottom={8}>
            {symbol}
          </StyledText>
          <StyledText
            fontSize={displayValue.length > 8 ? 38 : 52}
            fontWeight="800"
            color={Colors.textPrimary}
            letterSpacing={-2}
          >
            {displayValue}
          </StyledText>
        </Stack>
      </Stack>

      {/* Keypad grid — full width, roomy keys like mockup */}
      <Stack paddingHorizontal={20} paddingBottom={8} gap={8}>
        {KEYS.map((row, ri) => (
          <Stack key={ri} horizontal gap={8}>
            {row.map((key) => (
              <StyledPressable
                key={key}
                flex={1}
                height={72}
                borderRadius={18}
                backgroundColor={key === '⌫' ? Colors.expenseLight : Colors.bgCard}
                borderWidth={1}
                borderColor={key === '⌫' ? Colors.expenseLight : Colors.border}
                alignItems="center"
                justifyContent="center"
                onPress={() => handleKey(key)}
              >
                {key === '⌫' ? (
                  <BackspaceIcon size={22} color={Colors.expense} />
                ) : (
                  <StyledText fontSize={24} fontWeight="600" color={Colors.textPrimary}>
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
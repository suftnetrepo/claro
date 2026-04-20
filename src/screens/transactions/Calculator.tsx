import React, { useCallback, useMemo } from 'react'
import { Stack, StyledPressable } from 'fluent-styles'
import { BackspaceIcon } from '../../icons'
import { useColors } from '../../constants'
import { Text } from '@/components'

interface CalculatorProps {
  value:    string
  onChange: (val: string) => void
  symbol:   string
  accentColor?: string
}

const KEYS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['.', '0', '⌫'],
]

export const Calculator: React.FC<CalculatorProps> = ({ value, onChange, symbol, accentColor }) => {
  const Colors = useColors()
  const accent  = accentColor ?? Colors.primary

  // Format display value with thousands separator while keeping raw value for input
  const displayValue = useMemo(() => {
    const num = parseFloat(value) || 0
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return formatted
  }, [value])

  const handleKey = useCallback((key: string) => {
    if (key === '⌫') { onChange(value.length <= 1 ? '0' : value.slice(0, -1)); return }
    if (key === '.' && value.includes('.')) return
    if (value === '0' && key !== '.') { onChange(key); return }
    const dotIndex = value.indexOf('.')
    if (dotIndex !== -1 && value.length - dotIndex > 2) return
    if (value.replace('.', '').length >= 10) return
    onChange(value + key)
  }, [value, onChange])

  return (
    <Stack>
      {/* Amount display */}
      <Stack alignItems="center" justifyContent="center" paddingBottom={16} paddingHorizontal={24}>
        <Stack horizontal alignItems="baseline" gap={4}>
          <Text variant="amountSmall" color={Colors.textMuted}>{symbol}</Text>
          <Text
            variant={displayValue.length > 10 ? 'amountSmall' : 'amount'}
            color={Colors.textPrimary}
            letterSpacing={-2}
          >
            {displayValue}
          </Text>
        </Stack>
      </Stack>

      {/* Keypad — clean card-style keys matching Settings */}
      <Stack paddingHorizontal={20} paddingBottom={8} gap={8}>
        {KEYS.map((row, ri) => (
          <Stack key={ri} horizontal gap={8}>
            {row.map((key) => {
              const isBackspace = key === '⌫'
              return (
                <StyledPressable
                  key={key}
                  onPress={() => handleKey(key)}
                  flex={1}
                  height={66}
                  borderRadius={16}
                  backgroundColor={isBackspace ? `${accent}18` : Colors.bgCard}
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 }, elevation: 1,
                  }}>
                  {isBackspace ? (
                    <BackspaceIcon size={22} color={accent} strokeWidth={2} />
                  ) : (
                    <Text variant="amountSmall" color={Colors.textPrimary}>{key}</Text>
                  )}
                </StyledPressable>
              )
            })}
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
import React, { useCallback } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { StyledText } from 'fluent-styles'
import { BackspaceIcon } from '../../icons'
import { useColors } from '../../constants'

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

  const handleKey = useCallback((key: string) => {
    if (key === '⌫') { onChange(value.length <= 1 ? '0' : value.slice(0, -1)); return }
    if (key === '.' && value.includes('.')) return
    if (value === '0' && key !== '.') { onChange(key); return }
    const dotIndex = value.indexOf('.')
    if (dotIndex !== -1 && value.length - dotIndex > 2) return
    if (value.replace('.', '').length >= 10) return
    onChange(value + key)
  }, [value, onChange])

  const displayValue = value === '' ? '0' : value

  return (
    <View>
      {/* Amount display */}
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 28, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <StyledText fontSize={22} fontWeight="700" color={Colors.textMuted}>{symbol}</StyledText>
          <StyledText
            fontSize={displayValue.length > 8 ? 42 : 58}
            fontWeight="800"
            color={Colors.textPrimary}
            letterSpacing={-2}
          >
            {displayValue}
          </StyledText>
        </View>
      </View>

      {/* Keypad — clean card-style keys matching Settings */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 8, gap: 8 }}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: 8 }}>
            {row.map((key) => {
              const isBackspace = key === '⌫'
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.65}
                  onPress={() => handleKey(key)}
                  style={{
                    flex: 1, height: 66, borderRadius: 16,
                    backgroundColor: isBackspace ? `${accent}18` : Colors.bgCard,
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 }, elevation: 1,
                  }}>
                  {isBackspace ? (
                    <BackspaceIcon size={22} color={accent} strokeWidth={2} />
                  ) : (
                    <StyledText fontSize={22} fontWeight="600" color={Colors.textPrimary}>{key}</StyledText>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}
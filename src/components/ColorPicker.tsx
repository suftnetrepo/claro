import React from 'react'
import { Stack, StyledText, StyledPressable, StyleShape } from 'fluent-styles'
import { CheckIcon } from '../icons'
import { IconColorPalette, Colors } from '../constants'

interface ColorPickerProps {
  selected: string
  onSelect: (color: string) => void
  label?:   string
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selected, onSelect, label = 'Color',
}) => {
  return (
    <Stack gap={10}>
      <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={0.5}>
        {label.toUpperCase()}
      </StyledText>
      <Stack flexDirection="row" flexWrap="wrap" gap={10}>
        {IconColorPalette.map((color) => {
          const isSelected = color === selected
          return (
            <StyledPressable
              key={color}
              onPress={() => onSelect(color)}
              width={36} height={36} borderRadius={18}
              alignItems="center" justifyContent="center"
              borderWidth={isSelected ? 3 : 0}
              borderColor={Colors.white}
              style={isSelected ? {
                shadowColor: color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 4,
              } : undefined}
            >
              <StyleShape
                cycle size={isSelected ? 28 : 36}
                backgroundColor={color}
                alignItems="center" justifyContent="center"
              >
                {isSelected && (
                  <CheckIcon size={14} color={Colors.white} strokeWidth={2.5} />
                )}
              </StyleShape>
            </StyledPressable>
          )
        })}
      </Stack>
    </Stack>
  )
}

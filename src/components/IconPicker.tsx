import React from 'react'
import { FlatList } from 'react-native'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { IconCircle } from '../icons/map'
import { useColors } from '../constants'

interface IconPickerProps {
  keys:      string[]
  selected:  string
  color:     string
  onSelect:  (key: string) => void
  label?:    string
  type?:     'category' | 'account'
}

export const IconPicker: React.FC<IconPickerProps> = ({
  keys, selected, color, onSelect, label = 'Icon', type = 'category',
}) => {
  const Colors = useColors()
  return (
    <Stack gap={10}>
      {label.trim().length > 0 && (
        <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={0.5}>
          {label.toUpperCase()}
        </StyledText>
      )}
      <FlatList
        data={keys}
        keyExtractor={k => k}
        numColumns={6}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isSelected = item === selected
          return (
            <StyledPressable
              flex={1}
              alignItems="center"
              paddingVertical={8}
              borderRadius={12}
              backgroundColor="transparent"
              onPress={() => onSelect(item)}
            >
              <IconCircle
                iconKey={item}
                bg={isSelected ? color : Colors.bgMuted}
                size={44}
                type={type}
              />
            </StyledPressable>
          )
        }}
      />
    </Stack>
  )
}
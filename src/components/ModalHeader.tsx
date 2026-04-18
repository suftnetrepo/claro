import React from 'react'
import { Stack, StyledPressable } from 'fluent-styles'
import { CloseIcon, CheckIcon, DeleteIcon } from '../icons'
import { Colors } from '../constants'
import { Text } from './Text'

interface ModalHeaderProps {
  title:       string
  onClose:     () => void
  onSave:      () => void
  onDelete?:   () => void
  saveColor?:  string
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title, onClose, onSave, onDelete, saveColor = Colors.primary,
}) => {
  return (
    <Stack
      horizontal alignItems="center" justifyContent="space-between"
      paddingHorizontal={20} 
       marginBottom={8}
   
    >
      <StyledPressable
        width={48} height={48} borderRadius={999}
        backgroundColor={Colors.bgMuted}
        alignItems="center" justifyContent="center"
        onPress={onClose}
      >
        <CloseIcon size={24} color={Colors.textPrimary} />
      </StyledPressable>

      <Text variant="title" color={Colors.textMuted}>
        {title}
      </Text>

      <Stack horizontal gap={8}>
        {onDelete && (
          <StyledPressable
            width={48} height={48} borderRadius={999}
            backgroundColor={Colors.expenseLight}
            alignItems="center" justifyContent="center"
            onPress={onDelete}
          >
            <DeleteIcon size={24} color={Colors.expense} />
          </StyledPressable>
        )}
        <StyledPressable
          width={48} height={48} borderRadius={999}
          backgroundColor={saveColor}
          alignItems="center" justifyContent="center"
          onPress={onSave}
        >
          <CheckIcon size={24} color={Colors.white} strokeWidth={2.5} />
        </StyledPressable>
      </Stack>
    </Stack>
  )
}

import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { CloseIcon, CheckIcon, DeleteIcon } from '../icons'
import { Colors } from '../constants'

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
      paddingHorizontal={20} paddingTop={16} paddingBottom={12}
    >
      <StyledPressable
        width={36} height={36} borderRadius={18}
        backgroundColor={Colors.bgMuted}
        alignItems="center" justifyContent="center"
        onPress={onClose}
      >
        <CloseIcon size={18} color={Colors.textPrimary} />
      </StyledPressable>

      <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary}>
        {title}
      </StyledText>

      <Stack horizontal gap={8}>
        {onDelete && (
          <StyledPressable
            width={36} height={36} borderRadius={18}
            backgroundColor={Colors.expenseLight}
            alignItems="center" justifyContent="center"
            onPress={onDelete}
          >
            <DeleteIcon size={16} color={Colors.expense} />
          </StyledPressable>
        )}
        <StyledPressable
          width={36} height={36} borderRadius={18}
          backgroundColor={saveColor}
          alignItems="center" justifyContent="center"
          onPress={onSave}
        >
          <CheckIcon size={18} color={Colors.white} strokeWidth={2.5} />
        </StyledPressable>
      </Stack>
    </Stack>
  )
}

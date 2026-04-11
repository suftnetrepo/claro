import React from 'react'
import {
  Stack, StyledText, StyledPressable, StyledDivider, Popup
} from 'fluent-styles'
import { IconCircle } from '../../icons/map'
import { CheckIcon } from '../../icons'
import { Colors, useColors } from '../../constants'
import type { Account } from '../../db/schema'

interface AccountPickerProps {
  visible:    boolean
  accounts:   Account[]
  selected:   string | null
  onSelect:   (account: Account) => void
  onClose:    () => void
}

export const AccountPicker: React.FC<AccountPickerProps> = ({
  visible, accounts, selected, onSelect, onClose,
}) => {
  return (
    <Popup
      visible={visible}
      onClose={onClose}
      title="Select account"
      showClose
      position="bottom"
      round
    >
      <Stack paddingBottom={24}>
        {accounts.map((acc, i) => (
          <Stack key={acc.id}>
            <StyledPressable
              flexDirection="row" alignItems="center" gap={14}
              paddingHorizontal={20} paddingVertical={14}
              onPress={() => { onSelect(acc); onClose() }}
            >
              <IconCircle iconKey={acc.icon} bg={acc.color} size={44} type="account" />
              <Stack flex={1} gap={2}>
                <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
                  {acc.name}
                </StyledText>
              </Stack>
              {selected === acc.id && (
                <CheckIcon size={20} color={Colors.primary} strokeWidth={2.5} />
              )}
            </StyledPressable>
            {i < accounts.length - 1 && (
              <StyledDivider borderBottomColor={Colors.border} marginLeft={78} />
            )}
          </Stack>
        ))}
      </Stack>
    </Popup>
  )
}

import React, { useState } from 'react'
import { FlatList, ScrollView } from 'react-native'
import {
  Stack, StyledText, StyledPressable, Popup, TabBar
} from 'fluent-styles'
import { IconCircle } from '../../icons/map'
import { Colors, useColors } from '../../constants'
import type { Category } from '../../db/schema'

interface CategoryPickerProps {
  visible:            boolean
  expenseCategories:  Category[]
  incomeCategories:   Category[]
  selected:           string | null
  transactionType:    'expense' | 'income' | 'transfer'
  onSelect:           (category: Category) => void
  onClose:            () => void
}

type CatType = 'expense' | 'income'
const TABS = [
  { value: 'expense' as CatType, label: 'Expense' },
  { value: 'income'  as CatType, label: 'Income'  },
]

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  visible, expenseCategories, incomeCategories,
  selected, transactionType, onSelect, onClose,
}) => {
  const defaultTab = (transactionType === 'transfer' ? 'expense' : transactionType) as CatType
  const [tab, setTab] = useState<CatType>(defaultTab)

  // Sync tab when transactionType changes from outside
  React.useEffect(() => {
    setTab(defaultTab)
  }, [transactionType])

  const cats = tab === 'expense' ? expenseCategories : incomeCategories

  return (
    <Popup
      visible={visible}
      onClose={onClose}
      title="Select category"
      showClose
      position="bottom"
      round
      roundRadius={24}
    >
      <Stack paddingBottom={24}>
        <TabBar
          options={TABS}
          value={tab}
          onChange={setTab}
          indicator="line"
          showBorder
          colors={{
            activeText: Colors.primary,
            indicator:  Colors.primary,
            text:       Colors.textMuted,
            border:     Colors.border,
          }}
        />

        <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
          <Stack flexDirection="row" flexWrap="wrap" padding={12}>
            {cats.map(item => {
              const isSelected = item.id === selected
              return (
                <StyledPressable
                  key={item.id}
                  width="25%"
                  alignItems="center"
                  gap={6}
                  paddingVertical={12}
                  borderRadius={12}
                  backgroundColor={isSelected ? Colors.accent : 'transparent'}
                  onPress={() => { onSelect(item); onClose() }}
                >
                  <IconCircle
                    iconKey={item.icon}
                    bg={item.color}
                    size={48}
                  />
                  <StyledText
                    fontSize={10}
                    fontWeight="600"
                    color={isSelected ? Colors.primary : Colors.textMuted}
                    textAlign="center"
                    numberOfLines={2}
                  >
                    {item.name}
                  </StyledText>
                </StyledPressable>
              )
            })}
          </Stack>
        </ScrollView>
      </Stack>
    </Popup>
  )
}

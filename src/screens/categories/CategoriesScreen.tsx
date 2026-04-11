import React, { useState } from 'react'
import { FlatList } from 'react-native'
import { router } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledDivider,
  StyledEmptyState, StyledSkeleton, TabBar,
} from 'fluent-styles'
import { dialogueService, toastService } from 'fluent-styles'
import { IconCircle } from '../../icons/map'
import { AddIcon, ChevronLeftIcon } from '../../icons'
import { Colors, useColors } from '../../constants'
import { useCategories } from '../../hooks'
import type { Category } from '../../db/schema'

type CatType = 'expense' | 'income'
const TABS = [
  { value: 'expense' as CatType, label: 'Expense' },
  { value: 'income'  as CatType, label: 'Income'  },
]

export default function CategoriesScreen() {
  const Colors = useColors()
  const [type, setType] = useState<CatType>('expense')
  const { data: cats, loading, remove } = useCategories(type)

  const handleDelete = async (id: string, name: string) => {
    const ok = await dialogueService.confirm({
      title:        `Delete "${name}"?`,
      message:      'Transactions using this category will become uncategorized.',
      icon:         '🗑️',
      confirmLabel: 'Delete',
      destructive:  true,
    })
    if (ok) {
      await remove(id)
      toastService.success('Category deleted')
    }
  }

  return (
    <Stack flex={1} backgroundColor={Colors.bg}>
      <Stack paddingHorizontal={20} paddingTop={8} paddingBottom={8}>
        <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} letterSpacing={-0.5}>Categories</StyledText>
      </Stack>

      <TabBar
        options={TABS} value={type} onChange={setType}
        indicator="line" showBorder
        colors={{ activeText: Colors.primary, indicator: Colors.primary, text: Colors.textMuted, border: Colors.border }}
      />

      {loading ? (
        <Stack padding={16}><StyledSkeleton template="list-item" repeat={8} animation="shimmer" /></Stack>
      ) : (
        <FlatList
          data={cats}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item, index }) => (
            <Stack>
              <StyledPressable
                flexDirection="row" alignItems="center"
                paddingHorizontal={20} paddingVertical={12}
                backgroundColor={Colors.bgCard}
                onPress={() => router.push({
                  pathname: '/add-category' as any,
                  params: { id: item.id, name: item.name, icon: item.icon, color: item.color, type: item.type },
                })}
              >
                <IconCircle iconKey={item.icon} bg={item.color} size={44} />
                <StyledText flex={1} fontSize={14} fontWeight="700" color={Colors.textPrimary} marginLeft={14}>
                  {item.name}
                </StyledText>
                {/* Delete button directly on row — no nested dialogue */}
                <StyledPressable
                  width={36} height={36} borderRadius={18}
                  backgroundColor={Colors.expenseLight}
                  alignItems="center" justifyContent="center"
                  onPress={() => handleDelete(item.id, item.name)}
                >
                  <StyledText fontSize={14}>🗑️</StyledText>
                </StyledPressable>
              </StyledPressable>
              {index < cats.length - 1 && <StyledDivider borderBottomColor={Colors.border} marginLeft={78} />}
            </Stack>
          )}
          ListEmptyComponent={
            <StyledEmptyState variant="minimal" illustration="🏷️" title="No categories" animated />
          }
          ListFooterComponent={
            <StyledPressable
              flexDirection="row" alignItems="center" justifyContent="center" gap={10}
              marginHorizontal={20} marginTop={16} paddingVertical={16}
              borderRadius={12} borderWidth={1} borderColor={Colors.primary}
              onPress={() => router.push({ pathname: '/add-category' as any, params: { type } })}
            >
              <AddIcon size={18} color={Colors.primary} strokeWidth={2.5} />
              <StyledText fontSize={14} fontWeight="700" color={Colors.primary}>ADD NEW CATEGORY</StyledText>
            </StyledPressable>
          }
        />
      )}
    </Stack>
  )
}

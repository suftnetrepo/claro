import React, { useState, useCallback } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import {
  Stack, StyledText, StyledPressable, StyledTextInput,
  StyledScrollView, TabBar,
} from 'fluent-styles'
import { Colors, useColors, CategoryColors } from '../../constants'
import { ALL_CATEGORY_ICON_KEYS } from '../../icons/map'
import { ModalHeader, ColorPicker, IconPicker } from '../../components'
import { useCategories } from '../../hooks'
import { useRecordsStore } from '../../stores'
import { IconCircle } from '../../icons/map'

type CatType = 'expense' | 'income'
const TYPE_TABS = [
  { value: 'expense' as CatType, label: 'Expense' },
  { value: 'income'  as CatType, label: 'Income'  },
]

export default function AddCategoryScreen() {
  const Colors = useColors()
  const params  = useLocalSearchParams<{
    id?: string; name?: string; icon?: string; color?: string; type?: string
  }>()
  const isEdit  = !!params.id



  const { create, update, remove } = useCategories()
  const { invalidateData }         = useRecordsStore()

  const [name,    setName]    = useState(params.name  ?? '')
  const [icon,    setIcon]    = useState(params.icon  ?? 'other')
  const [color,   setColor]   = useState(params.color ?? CategoryColors.other)
  const [catType, setCatType] = useState<CatType>((params.type as CatType) ?? 'expense')

  const handleSave = useCallback(async () => {
    if (!name.trim()) { toastService.error('Name required', 'Please enter a category name'); return }
    const loadId = loaderService.show({ label: isEdit ? 'Saving…' : 'Creating…', variant: 'spinner' })
    try {
      if (isEdit) {
        await update(params.id!, { name: name.trim(), icon, color, type: catType })
      } else {
        await create({
          name:      name.trim(),
          icon,
          color,
          type:      catType,
          isDefault: false,
          sortOrder: 99,
        })
      }
      invalidateData()
      toastService.success(isEdit ? 'Category updated' : 'Category created')
      router.back()
    } catch (err: any) {
      toastService.error('Failed', err?.message)
    } finally {
      loaderService.hide(loadId)
    }
  }, [name, icon, color, catType, isEdit, params.id, create, update, invalidateData])


  return (
    <Stack flex={1} backgroundColor={Colors.bg}>

      <ModalHeader
        title={isEdit ? 'Edit Category' : 'New Category'}
        onClose={() => router.back()}
        onSave={handleSave}
      />

      {/* Preview */}
      <Stack alignItems="center" paddingVertical={20} backgroundColor={Colors.bgCard} borderBottomWidth={1} borderBottomColor={Colors.border}>
        <IconCircle iconKey={icon} bg={color} size={64} />
        <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary} marginTop={10}>
          {name || 'Category name'}
        </StyledText>
        <StyledText fontSize={12} color={Colors.textMuted} marginTop={2}>
          {catType === 'expense' ? 'Expense' : 'Income'} category
        </StyledText>
      </Stack>

      <StyledScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>

        {/* Type */}
        {!isEdit && (
          <Stack gap={8}>
            <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={0.5}>TYPE</StyledText>
            <TabBar
              options={TYPE_TABS}
              value={catType}
              onChange={setCatType}
              indicator="pill"
              colors={{
                background:  Colors.bgMuted,
                activeText:  Colors.primary,
                indicator:   Colors.bgCard,
                text:        Colors.textMuted,
              }}
            />
          </Stack>
        )}

        {/* Name */}
        <Stack gap={8}>
          <StyledText fontSize={13} fontWeight="700" color={Colors.textMuted} letterSpacing={0.5}>NAME</StyledText>
          <StyledTextInput
            variant="filled"
            placeholder="e.g. Groceries"
            value={name}
            onChangeText={setName}
            fontSize={15}
            autoFocus={!isEdit}
          />
        </Stack>

        {/* Icon */}
        <IconPicker
          keys={ALL_CATEGORY_ICON_KEYS}
          selected={icon}
          color={color}
          onSelect={setIcon}
        />

        {/* Color */}
        <ColorPicker selected={color} onSelect={setColor} />

      </StyledScrollView>

    </Stack>
  )
}

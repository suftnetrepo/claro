import React, { useState } from 'react'
import { FlatList } from 'react-native'
import { router } from 'expo-router'
import { Stack, StyledText, StyledPressable, StyledSearchBar, StyledDivider, StyleShape } from 'fluent-styles'
import { CheckIcon } from '../../icons'
import { Colors, useColors, Fonts, CURRENCIES } from '../../constants'
import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from '../../constants'
import { settingsService } from '../../services/settingsService'

export default function CurrencyScreen() {
  const Colors = useColors()
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState('USD')
  const [loading,  setLoading]  = useState(false)

  const filtered = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDone = async () => {
    setLoading(true)
    try {
      const currency = CURRENCIES.find(c => c.code === selected)!
      await SecureStore.setItemAsync(STORAGE_KEYS.CURRENCY, selected)
      await settingsService.update({ currency: currency.code, currencySymbol: currency.symbol })
      router.replace('/(tabs)/records')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack flex={1} backgroundColor={Colors.bg}>

      <Stack padding={24} paddingTop={64} paddingBottom={8}>
        <StyledText fontSize={26} fontWeight="800" fontFamily={Fonts.extraBold} color={Colors.textPrimary} letterSpacing={-0.5}>
          Choose currency
        </StyledText>
        <StyledText fontSize={14} color={Colors.textMuted} marginTop={6}>
          You can change this later in settings
        </StyledText>
      </Stack>

      <Stack paddingHorizontal={16} paddingBottom={8}>
        <StyledSearchBar
          variant="filled"
          placeholder="Search currency..."
          value={search}
          onChangeText={setSearch}
        />
      </Stack>

      <FlatList
        data={filtered}
        keyExtractor={item => item.code}
        style={{ flex: 1 }}
        renderItem={({ item, index }) => {
          const isSelected = item.code === selected
          return (
            <StyledPressable
              flexDirection="row" alignItems="center" gap={14}
              paddingHorizontal={20} paddingVertical={14}
              backgroundColor={isSelected ? Colors.accent + '33' : Colors.bgCard}
              onPress={() => setSelected(item.code)}
            >
              <StyleShape
                cycle size={40}
                backgroundColor={Colors.accent}
                alignItems="center" justifyContent="center"
              >
                <StyledText fontSize={16} fontWeight="700" color={Colors.primary}>
                  {item.symbol}
                </StyledText>
              </StyleShape>

              <Stack flex={1} gap={2}>
                <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>{item.code}</StyledText>
                <StyledText fontSize={13} color={Colors.textMuted}>{item.name}</StyledText>
              </Stack>

              {isSelected && <CheckIcon size={20} color={Colors.primary} strokeWidth={2.5} />}
            </StyledPressable>
          )
        }}
        ItemSeparatorComponent={() => (
          <StyledDivider borderBottomColor={Colors.border} marginLeft={74} />
        )}
      />

      <Stack padding={20} paddingBottom={40}>
        <StyledPressable
          paddingVertical={16} borderRadius={14}
          backgroundColor={loading ? Colors.primaryLight : Colors.primary}
          alignItems="center" justifyContent="center"
          onPress={handleDone}
          disabled={loading}
        >
          <StyledText fontSize={16} fontWeight="700" color="#fff">
            {loading ? 'Saving...' : 'Get started'}
          </StyledText>
        </StyledPressable>
      </Stack>

    </Stack>
  )
}

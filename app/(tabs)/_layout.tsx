import React from 'react'
import { Tabs } from 'expo-router'
import {
  RecordsTabIcon, AnalysisTabIcon, BudgetsTabIcon, SettingsTabIcon,
} from '../../src/icons'
import { Colors, useColors } from '../../src/constants'

interface TabIconProps { color: string; focused: boolean }

export default function TabsLayout() {
  const Colors = useColors()
  return (
    <Tabs
      screenOptions={{
        headerShown:             false,
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopColor:  Colors.border,
          borderTopWidth:  1,
          height:          80,
          paddingBottom:   16,
          paddingTop:      8,
        },
        tabBarLabelStyle: {
          fontSize:   10,
          fontWeight: '600',
          fontFamily: 'PlusJakartaSans_600SemiBold',
        },
      }}
    >
      <Tabs.Screen
        name="records"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }: TabIconProps) => (
            <RecordsTabIcon size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ color, focused }: TabIconProps) => (
            <AnalysisTabIcon size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, focused }: TabIconProps) => (
            <BudgetsTabIcon size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }: TabIconProps) => (
            <SettingsTabIcon size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
          ),
        }}
      />
      {/* Hidden from tab bar — accessed via Settings */}
      <Tabs.Screen name="accounts"   options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
    </Tabs>
  )
}
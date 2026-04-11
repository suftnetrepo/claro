import React from 'react'
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg'
import { createIcon } from '../createIcon'

// ─── Records tab — ReceiptText ────────────────────────────────────────────────
export const RecordsTabIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="8"  y1="8"  x2="16" y2="8"  stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="8"  y1="12" x2="16" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="8"  y1="16" x2="12" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
RecordsTabIcon.displayName = 'RecordsTabIcon'

// ─── Analysis tab — PieChart ──────────────────────────────────────────────────
export const AnalysisTabIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21.21 15.89A10 10 0 118 2.83" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 12A10 10 0 0012 2v10z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
AnalysisTabIcon.displayName = 'AnalysisTabIcon'

// ─── Budgets tab — Calculator ─────────────────────────────────────────────────
export const BudgetsTabIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Line x1="8"  y1="6"  x2="16" y2="6"  stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="8"  y1="10" x2="8"  y2="10" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="12" y1="10" x2="12" y2="10" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="16" y1="10" x2="16" y2="10" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="8"  y1="14" x2="8"  y2="14" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="12" y1="14" x2="12" y2="14" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="16" y1="14" x2="16" y2="14" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="8"  y1="18" x2="8"  y2="18" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="12" y1="18" x2="12" y2="18" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="16" y1="18" x2="16" y2="18" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
  </Svg>
))
BudgetsTabIcon.displayName = 'BudgetsTabIcon'

// ─── Accounts tab — Wallet ────────────────────────────────────────────────────
export const AccountsTabIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M4 6v12a2 2 0 002 2h14v-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M18 12a2 2 0 000 4h4v-4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
AccountsTabIcon.displayName = 'AccountsTabIcon'

// ─── Categories tab — Tag ─────────────────────────────────────────────────────
export const CategoriesTabIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="7" y1="7" x2="7.01" y2="7" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
  </Svg>
))
CategoriesTabIcon.displayName = 'CategoriesTabIcon'

// ─── Settings tab — Settings/Gear ────────────────────────────────────────────
export const SettingsTabIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={strokeWidth}/>
  </Svg>
))
SettingsTabIcon.displayName = 'SettingsTabIcon'

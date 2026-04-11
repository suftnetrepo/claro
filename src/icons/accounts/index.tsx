import React from 'react'
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg'
import { createIcon } from '../createIcon'

// ─── Cash — Banknote ──────────────────────────────────
export const CashAccountIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M6 12h.01M18 12h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
CashAccountIcon.displayName = 'CashAccountIcon'

// ─── Card — CreditCard ────────────────────────────────
export const CardAccountIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Line x1="2"  y1="10" x2="22" y2="10" stroke={color} strokeWidth={strokeWidth}/>
    <Line x1="7"  y1="15" x2="7.01" y2="15" stroke={color} strokeWidth={strokeWidth + 2} strokeLinecap="round"/>
    <Line x1="11" y1="15" x2="13"   y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
CardAccountIcon.displayName = 'CardAccountIcon'

// ─── Savings — PiggyBank ──────────────────────────────
export const SavingsAccountIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="11" cy="13" r="1" stroke={color} strokeWidth={strokeWidth} fill={color}/>
  </Svg>
))
SavingsAccountIcon.displayName = 'SavingsAccountIcon'

// ─── Bank — Building2 ─────────────────────────────────
export const BankAccountIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="22" x2="21" y2="22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="6" y1="18" x2="6"  y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="10" y1="18" x2="10" y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="14" y1="18" x2="14" y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="18" y1="18" x2="18" y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M12 2L2 7h20z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
BankAccountIcon.displayName = 'BankAccountIcon'

// ─── Wallet ───────────────────────────────────────────
export const WalletAccountIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M4 6v12a2 2 0 002 2h14v-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M18 12a2 2 0 000 4h4v-4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
WalletAccountIcon.displayName = 'WalletAccountIcon'

// ─── Crypto — Bitcoin ─────────────────────────────────
export const CryptoAccountIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L10.5 21m1.267-1.911l-1.267-7.173m1.267 7.173L13.5 21M10.5 3l.5 2.8m0 0l1.267 7.173M11 5.8L9.733 12.973M11 5.8l1.5-.3M9.733 12.973L8 13.3M14.5 9.5c.5 1.5-.167 3-2 3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth}/>
  </Svg>
))
CryptoAccountIcon.displayName = 'CryptoAccountIcon'

// ─── Investment Account — BarChart ────────────────────
export const InvestmentAccountIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="18" y1="20" x2="18" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="12" y1="20" x2="12" y2="4"  stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="6"  y1="20" x2="6"  y2="14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
InvestmentAccountIcon.displayName = 'InvestmentAccountIcon'

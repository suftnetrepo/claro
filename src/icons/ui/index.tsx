import React from 'react'
import Svg, { Path, Line, Circle, Polyline, Rect, Polygon } from 'react-native-svg'
import { createIcon } from '../createIcon'

// ─── Add / Plus ───────────────────────────────────────────────────────────────
export const AddIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
AddIcon.displayName = 'AddIcon'

// ─── Back / ArrowLeft ─────────────────────────────────────────────────────────
export const BackIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M12 19l-7-7 7-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
BackIcon.displayName = 'BackIcon'

// ─── Close / X ────────────────────────────────────────────────────────────────
export const CloseIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
CloseIcon.displayName = 'CloseIcon'

// ─── Check ────────────────────────────────────────────────────────────────────
export const CheckIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
CheckIcon.displayName = 'CheckIcon'

// ─── Filter / Sliders ─────────────────────────────────────────────────────────
export const FilterIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="12" y1="18" x2="12" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
FilterIcon.displayName = 'FilterIcon'

// ─── Search ───────────────────────────────────────────────────────────────────
export const SearchIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="m21 21-4.35-4.35" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
SearchIcon.displayName = 'SearchIcon'

// ─── Edit / Pencil ────────────────────────────────────────────────────────────
export const EditIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
EditIcon.displayName = 'EditIcon'

// ─── Delete / Trash ───────────────────────────────────────────────────────────
export const DeleteIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
DeleteIcon.displayName = 'DeleteIcon'

// ─── More / VerticalDots ──────────────────────────────────────────────────────
export const MoreIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5"  r="1" stroke={color} strokeWidth={strokeWidth} fill={color}/>
    <Circle cx="12" cy="12" r="1" stroke={color} strokeWidth={strokeWidth} fill={color}/>
    <Circle cx="12" cy="19" r="1" stroke={color} strokeWidth={strokeWidth} fill={color}/>
  </Svg>
))
MoreIcon.displayName = 'MoreIcon'

// ─── ChevronLeft ──────────────────────────────────────────────────────────────
export const ChevronLeftIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
ChevronLeftIcon.displayName = 'ChevronLeftIcon'

// ─── ChevronRight ─────────────────────────────────────────────────────────────
export const ChevronRightIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
ChevronRightIcon.displayName = 'ChevronRightIcon'

// ─── ChevronDown ──────────────────────────────────────────────────────────────
export const ChevronDownIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
ChevronDownIcon.displayName = 'ChevronDownIcon'

// ─── TrendingUp ───────────────────────────────────────────────────────────────
export const TrendUpIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Polyline points="17 6 23 6 23 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
TrendUpIcon.displayName = 'TrendUpIcon'

// ─── TrendingDown ─────────────────────────────────────────────────────────────
export const TrendDownIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="23 18 13.5 8.5 8.5 13.5 1 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Polyline points="17 18 23 18 23 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
TrendDownIcon.displayName = 'TrendDownIcon'

// ─── Calendar ─────────────────────────────────────────────────────────────────
export const CalendarIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="8"  y1="2" x2="8"  y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="3"  y1="10" x2="21" y2="10" stroke={color} strokeWidth={strokeWidth}/>
  </Svg>
))
CalendarIcon.displayName = 'CalendarIcon'

// ─── Copy ─────────────────────────────────────────────────────────────────────
export const CopyIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
CopyIcon.displayName = 'CopyIcon'

// ─── Settings / Gear ──────────────────────────────────────────────────────────
export const SettingsIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={strokeWidth}/>
  </Svg>
))
SettingsIcon.displayName = 'SettingsIcon'

// ─── Eye / Show ───────────────────────────────────────────────────────────────
export const EyeIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={strokeWidth}/>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth}/>
  </Svg>
))
EyeIcon.displayName = 'EyeIcon'

// ─── EyeOff / Hide ────────────────────────────────────────────────────────────
export const EyeOffIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
EyeOffIcon.displayName = 'EyeOffIcon'

// ─── Menu / Hamburger ─────────────────────────────────────────────────────────
export const MenuIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="6"  x2="21" y2="6"  stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
MenuIcon.displayName = 'MenuIcon'

// ─── Bell / Notification ──────────────────────────────────────────────────────
export const BellIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
BellIcon.displayName = 'BellIcon'

// ─── Lock ─────────────────────────────────────────────────────────────────────
export const LockIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
LockIcon.displayName = 'LockIcon'

// ─── Fingerprint ──────────────────────────────────────────────────────────────
export const FingerprintIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 018.9 5.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 016-6 5.67 5.67 0 015.5 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M9 16.5C9.5 14 9.5 13 9.5 12a2.5 2.5 0 015 0c0 1.5-.5 3-1 4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M12 12v.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M20 4.5c1 2.5 2 6.5.5 10.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M12.5 22c0-1.5.5-3 .5-5.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
FingerprintIcon.displayName = 'FingerprintIcon'

// ─── Delete (backspace) for calculator ───────────────────────────────────────
export const BackspaceIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="18" y1="9" x2="12" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="12" y1="9" x2="18" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
BackspaceIcon.displayName = 'BackspaceIcon'

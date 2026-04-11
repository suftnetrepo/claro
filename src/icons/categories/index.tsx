import React from 'react'
import Svg, {
  Path, Circle, Line, Rect, Polyline,
  Polygon, Ellipse
} from 'react-native-svg'
import { createIcon } from '../createIcon'

// ══════════════════════════════════════════════════════
//  EXPENSE CATEGORY ICONS
// ══════════════════════════════════════════════════════

// ─── Food — Utensils ──────────────────────────────────
export const FoodIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M7 2v20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
FoodIcon.displayName = 'FoodIcon'

// ─── Car ──────────────────────────────────────────────
export const CarIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2M9 17H5M9 3v5h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="7.5" cy="17.5" r="2.5" stroke={color} strokeWidth={strokeWidth}/>
    <Circle cx="17.5" cy="17.5" r="2.5" stroke={color} strokeWidth={strokeWidth}/>
  </Svg>
))
CarIcon.displayName = 'CarIcon'

// ─── Shopping — Cart ──────────────────────────────────
export const ShoppingIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9"  cy="21" r="1" stroke={color} strokeWidth={strokeWidth} fill={color}/>
    <Circle cx="20" cy="21" r="1" stroke={color} strokeWidth={strokeWidth} fill={color}/>
    <Path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
ShoppingIcon.displayName = 'ShoppingIcon'

// ─── Health — HeartPulse ──────────────────────────────
export const HealthIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h5.27" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
HealthIcon.displayName = 'HealthIcon'

// ─── Home — House ─────────────────────────────────────
export const HomeIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 22V12h6v10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
HomeIcon.displayName = 'HomeIcon'

// ─── Bills — Receipt ──────────────────────────────────
export const BillsIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="8"  y1="8"  x2="16" y2="8"  stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="8"  y1="12" x2="16" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="8"  y1="16" x2="12" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
BillsIcon.displayName = 'BillsIcon'

// ─── Entertainment — Clapperboard ─────────────────────
export const EntertainmentIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 11h16v10a1 1 0 01-1 1H5a1 1 0 01-1-1V11z" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M4 11l3-9h10l3 9M4 11h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="12" y1="2"  x2="12" y2="11" stroke={color} strokeWidth={strokeWidth}/>
    <Line x1="8"  y1="2"  x2="6"  y2="11" stroke={color} strokeWidth={strokeWidth}/>
    <Line x1="16" y1="2"  x2="18" y2="11" stroke={color} strokeWidth={strokeWidth}/>
  </Svg>
))
EntertainmentIcon.displayName = 'EntertainmentIcon'

// ─── Education — GraduationCap ────────────────────────
export const EducationIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M6 12v5c3 3 9 3 12 0v-5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
EducationIcon.displayName = 'EducationIcon'

// ─── Transportation — Bus ─────────────────────────────
export const TransportIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 6v6M3 6h18M3 16h18M8 16v2M16 16v2M16 6v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Rect x="3" y="6" width="18" height="10" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Circle cx="8"  cy="18" r="1" stroke={color} strokeWidth={strokeWidth} fill={color}/>
    <Circle cx="16" cy="18" r="1" stroke={color} strokeWidth={strokeWidth} fill={color}/>
  </Svg>
))
TransportIcon.displayName = 'TransportIcon'

// ─── Telephone — Phone ────────────────────────────────
export const TelephoneIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
TelephoneIcon.displayName = 'TelephoneIcon'

// ─── Clothing — Shirt ─────────────────────────────────
export const ClothingIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 001 .84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 001-.84l.58-3.57a2 2 0 00-1.35-2.13z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
ClothingIcon.displayName = 'ClothingIcon'

// ─── Insurance — ShieldCheck ──────────────────────────
export const InsuranceIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
InsuranceIcon.displayName = 'InsuranceIcon'

// ─── Social — Users ───────────────────────────────────
export const SocialIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
SocialIcon.displayName = 'SocialIcon'

// ─── Sport — Dumbbell ─────────────────────────────────
export const SportIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 4v16M10 4v16M6 12h4M4 6h4M4 18h4M14 4v16M18 4v16M14 12h4M12 6h4M12 18h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
SportIcon.displayName = 'SportIcon'

// ─── Baby — Baby ──────────────────────────────────────
export const BabyIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="3" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M3 21c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M9 10.5c0 1.5.5 3 3 3s3-1.5 3-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
BabyIcon.displayName = 'BabyIcon'

// ─── Tax — Landmark ───────────────────────────────────
export const TaxIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="22" x2="21" y2="22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="6" y1="18" x2="6"  y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="10" y1="18" x2="10" y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="14" y1="18" x2="14" y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="18" y1="18" x2="18" y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M12 2L2 7h20z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
TaxIcon.displayName = 'TaxIcon'

// ─── Beauty — Sparkles ────────────────────────────────
export const BeautyIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3l1.88 5.76a1 1 0 00.95.69H21l-4.94 3.59a1 1 0 00-.36 1.12L17.56 20 12 16.27 6.44 20l1.86-5.84a1 1 0 00-.36-1.12L3 9.45h6.17a1 1 0 00.95-.69z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
BeautyIcon.displayName = 'BeautyIcon'

// ─── Electronics — Monitor ────────────────────────────
export const ElectronicsIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Line x1="8"  y1="21" x2="16" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
ElectronicsIcon.displayName = 'ElectronicsIcon'

// ─── Pet — PawPrint ───────────────────────────────────
export const PetIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="4"  r="2" stroke={color} strokeWidth={strokeWidth}/>
    <Circle cx="18" cy="8"  r="2" stroke={color} strokeWidth={strokeWidth}/>
    <Circle cx="20" cy="16" r="2" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M9 10a5 5 0 015 5v3.5a3.5 3.5 0 01-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 018 13.5V10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
PetIcon.displayName = 'PetIcon'

// ─── Travel — Plane ───────────────────────────────────
export const TravelIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 4a2 2 0 00-1.5.5l-3.5 3.5L6.2 5.3c-.5-.2-1 0-1.3.4l-.2.5c-.3.5-.1 1.1.4 1.3L9 9.4 5.5 13H2l-1 1 3 2 2 3 1-1v-3.5l3.5-3.5 2.4 3.9c.2.5.8.7 1.3.4l.5-.2c.3-.3.5-.8.3-1.3z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
TravelIcon.displayName = 'TravelIcon'

// ─── Rent — Building ──────────────────────────────────
export const RentIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Line x1="9"  y1="22" x2="9"  y2="12" stroke={color} strokeWidth={strokeWidth}/>
    <Line x1="15" y1="22" x2="15" y2="12" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M9 12h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="9"  y1="7"  x2="9.01"  y2="7"  stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="15" y1="7"  x2="15.01" y2="7"  stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="9"  y1="4"  x2="9.01"  y2="4"  stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
    <Line x1="15" y1="4"  x2="15.01" y2="4"  stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round"/>
  </Svg>
))
RentIcon.displayName = 'RentIcon'

// ─── Utilities — Zap ──────────────────────────────────
export const UtilitiesIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
UtilitiesIcon.displayName = 'UtilitiesIcon'

// ─── Gym — Activity ───────────────────────────────────
export const GymIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
GymIcon.displayName = 'GymIcon'

// ─── Coffee — Coffee ──────────────────────────────────
export const CoffeeIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8h1a4 4 0 010 8h-1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="6"  y1="1" x2="6"  y2="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="10" y1="1" x2="10" y2="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="14" y1="1" x2="14" y2="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
CoffeeIcon.displayName = 'CoffeeIcon'

// ─── Restaurant — UtensilsCrossed ─────────────────────
export const RestaurantIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
RestaurantIcon.displayName = 'RestaurantIcon'

// ─── Subscriptions — RefreshCw ────────────────────────
export const SubscriptionsIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 4v6h-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M1 20v-6h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
SubscriptionsIcon.displayName = 'SubscriptionsIcon'

// ─── Medicine — Pill ──────────────────────────────────
export const MedicineIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10.5 20.5a7 7 0 010-9.9l9.9-9.9a7 7 0 010 9.9l-9.9 9.9z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="7" y1="7" x2="17" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
MedicineIcon.displayName = 'MedicineIcon'

// ─── Grocery — ShoppingBasket ─────────────────────────
export const GroceryIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
GroceryIcon.displayName = 'GroceryIcon'

// ─── Fuel — Fuel ──────────────────────────────────────
export const FuelIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3"  y1="22" x2="15" y2="22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Line x1="4"  y1="9"  x2="14" y2="9"  stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M14 22V4a2 2 0 00-2-2H6a2 2 0 00-2 2v18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 13h2a2 2 0 012 2v2a2 2 0 002 2h0a2 2 0 002-2V9.83a2 2 0 00-.59-1.42L18 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
FuelIcon.displayName = 'FuelIcon'

// ─── Repair — Wrench ──────────────────────────────────
export const RepairIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
RepairIcon.displayName = 'RepairIcon'

// ─── Charity — HandHeart ──────────────────────────────
export const CharityIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 12h2a2 2 0 000-4h-3c-.6 0-1.1.2-1.4.6L3 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M2 13l6 6s1.3.5 2 0l7-4c.5-.3.5-1.1.2-1.6a1.5 1.5 0 00-1.2-.8l-3-.4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M17.5 4.5a3 3 0 000 4.5L22 13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
CharityIcon.displayName = 'CharityIcon'

// ─── Other — CircleDot ────────────────────────────────
export const OtherIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth}/>
    <Circle cx="12" cy="12" r="1"  stroke={color} strokeWidth={strokeWidth} fill={color}/>
  </Svg>
))
OtherIcon.displayName = 'OtherIcon'

// ══════════════════════════════════════════════════════
//  INCOME CATEGORY ICONS
// ══════════════════════════════════════════════════════

// ─── Salary — Banknote ────────────────────────────────
export const SalaryIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M6 12h.01M18 12h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
SalaryIcon.displayName = 'SalaryIcon'

// ─── Investment — TrendingUp ──────────────────────────
export const InvestmentIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Polyline points="17 6 23 6 23 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
InvestmentIcon.displayName = 'InvestmentIcon'

// ─── Gift ─────────────────────────────────────────────
export const GiftIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M16 21V7a4 4 0 00-8 0v14M2 11h20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M12 7c0-2-1-4-2.5-4S7 3 7 5s1 2 2 2h3M12 7c0-2 1-4 2.5-4S17 3 17 5s-1 2-2 2h-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
GiftIcon.displayName = 'GiftIcon'

// ─── Freelance — Laptop ───────────────────────────────
export const FreelanceIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Line x1="2"  y1="20" x2="22" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M9 13l3-3 3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="12" y1="10" x2="12" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
FreelanceIcon.displayName = 'FreelanceIcon'

// ─── Rental Income — KeyRound ─────────────────────────
export const RentalIncomeIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="7.5" cy="15.5" r="5.5" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M21 2l-9.6 9.6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Path d="M15.5 7.5L17 6l3 3-1.5 1.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
RentalIncomeIcon.displayName = 'RentalIncomeIcon'

// ─── Business — Briefcase ─────────────────────────────
export const BusinessIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth={strokeWidth}/>
    <Path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16M2 13h20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </Svg>
))
BusinessIcon.displayName = 'BusinessIcon'

// ─── Bonus — Star ─────────────────────────────────────
export const BonusIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
BonusIcon.displayName = 'BonusIcon'

// ─── Refund — Undo2 ───────────────────────────────────
export const RefundIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 14L4 9l5-5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M4 9h10.5a5.5 5.5 0 010 11H11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
RefundIcon.displayName = 'RefundIcon'

// ─── Dividend — PiggyBank ─────────────────────────────
export const DividendIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="11" cy="13" r="1" stroke={color} strokeWidth={strokeWidth} fill={color}/>
  </Svg>
))
DividendIcon.displayName = 'DividendIcon'

// ══════════════════════════════════════════════════════
//  TRANSACTION TYPE ICONS
// ══════════════════════════════════════════════════════

// ─── Income Arrow ─────────────────────────────────────
export const IncomeArrowIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 19V5M5 12l7-7 7 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
IncomeArrowIcon.displayName = 'IncomeArrowIcon'

// ─── Expense Arrow ────────────────────────────────────
export const ExpenseArrowIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M19 12l-7 7-7-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
ExpenseArrowIcon.displayName = 'ExpenseArrowIcon'

// ─── Transfer ─────────────────────────────────────────
export const TransferIcon = createIcon(({ size, color, strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M7 16V4M7 4L3 8M7 4l4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M17 8v12M17 20l4-4M17 20l-4-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
))
TransferIcon.displayName = 'TransferIcon'

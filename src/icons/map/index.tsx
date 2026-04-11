import React from 'react'
import { StyleShape } from 'fluent-styles'
import {
  FoodIcon, CarIcon, ShoppingIcon, HealthIcon, HomeIcon,
  BillsIcon, EntertainmentIcon, EducationIcon, TransportIcon,
  TelephoneIcon, ClothingIcon, InsuranceIcon, SocialIcon,
  SportIcon, BabyIcon, TaxIcon, BeautyIcon, ElectronicsIcon,
  PetIcon, TravelIcon, RentIcon, UtilitiesIcon, GymIcon,
  CoffeeIcon, RestaurantIcon, SubscriptionsIcon, MedicineIcon,
  GroceryIcon, FuelIcon, RepairIcon, CharityIcon, OtherIcon,
  SalaryIcon, InvestmentIcon, GiftIcon, FreelanceIcon,
  RentalIncomeIcon, BusinessIcon, BonusIcon, RefundIcon,
  DividendIcon, IncomeArrowIcon, ExpenseArrowIcon, TransferIcon,
} from '../categories'
import {
  CashAccountIcon, CardAccountIcon, SavingsAccountIcon,
  BankAccountIcon, WalletAccountIcon, CryptoAccountIcon,
  InvestmentAccountIcon,
} from '../accounts'
import { CategoryColors, AccountColors } from '../../constants'
import type { IconProps } from '../createIcon'

type IconComponent = (props: IconProps) => React.ReactElement

interface IconEntry {
  Component: IconComponent
  defaultBg: string
}

export const CATEGORY_ICON_MAP: Record<string, IconEntry> = {
  food:           { Component: FoodIcon,           defaultBg: CategoryColors.food },
  car:            { Component: CarIcon,            defaultBg: CategoryColors.car },
  shopping:       { Component: ShoppingIcon,       defaultBg: CategoryColors.shopping },
  health:         { Component: HealthIcon,         defaultBg: CategoryColors.health },
  home:           { Component: HomeIcon,           defaultBg: CategoryColors.home },
  bills:          { Component: BillsIcon,          defaultBg: CategoryColors.bills },
  entertainment:  { Component: EntertainmentIcon,  defaultBg: CategoryColors.entertainment },
  education:      { Component: EducationIcon,      defaultBg: CategoryColors.education },
  transportation: { Component: TransportIcon,      defaultBg: CategoryColors.transportation },
  telephone:      { Component: TelephoneIcon,      defaultBg: CategoryColors.telephone },
  clothing:       { Component: ClothingIcon,       defaultBg: CategoryColors.clothing },
  insurance:      { Component: InsuranceIcon,      defaultBg: CategoryColors.insurance },
  social:         { Component: SocialIcon,         defaultBg: CategoryColors.social },
  sport:          { Component: SportIcon,          defaultBg: CategoryColors.sport },
  baby:           { Component: BabyIcon,           defaultBg: CategoryColors.baby },
  tax:            { Component: TaxIcon,            defaultBg: CategoryColors.tax },
  beauty:         { Component: BeautyIcon,         defaultBg: CategoryColors.beauty },
  electronics:    { Component: ElectronicsIcon,    defaultBg: CategoryColors.electronics },
  pet:            { Component: PetIcon,            defaultBg: CategoryColors.pet },
  travel:         { Component: TravelIcon,         defaultBg: CategoryColors.travel },
  rent:           { Component: RentIcon,           defaultBg: CategoryColors.rent },
  utilities:      { Component: UtilitiesIcon,      defaultBg: CategoryColors.utilities },
  gym:            { Component: GymIcon,            defaultBg: CategoryColors.gym },
  coffee:         { Component: CoffeeIcon,         defaultBg: CategoryColors.coffee },
  restaurant:     { Component: RestaurantIcon,     defaultBg: CategoryColors.restaurant },
  subscriptions:  { Component: SubscriptionsIcon,  defaultBg: CategoryColors.subscriptions },
  medicine:       { Component: MedicineIcon,       defaultBg: CategoryColors.medicine },
  grocery:        { Component: GroceryIcon,        defaultBg: CategoryColors.grocery },
  fuel:           { Component: FuelIcon,           defaultBg: CategoryColors.fuel },
  repair:         { Component: RepairIcon,         defaultBg: CategoryColors.repair },
  charity:        { Component: CharityIcon,        defaultBg: CategoryColors.charity },
  salary:         { Component: SalaryIcon,         defaultBg: CategoryColors.salary },
  investment:     { Component: InvestmentIcon,     defaultBg: CategoryColors.investment },
  gift:           { Component: GiftIcon,           defaultBg: CategoryColors.gift },
  freelance:      { Component: FreelanceIcon,      defaultBg: CategoryColors.freelance },
  rental_income:  { Component: RentalIncomeIcon,   defaultBg: CategoryColors.rental_income },
  business:       { Component: BusinessIcon,       defaultBg: CategoryColors.business },
  bonus:          { Component: BonusIcon,          defaultBg: CategoryColors.bonus },
  refund:         { Component: RefundIcon,         defaultBg: CategoryColors.refund },
  dividend:       { Component: DividendIcon,       defaultBg: CategoryColors.dividend },
  other:          { Component: OtherIcon,          defaultBg: CategoryColors.other },
  // transaction types
  income:   { Component: IncomeArrowIcon,  defaultBg: '#1B5E20' },
  expense:  { Component: ExpenseArrowIcon, defaultBg: '#B71C1C' },
  transfer: { Component: TransferIcon,     defaultBg: '#0D47A1' },
}

export const ACCOUNT_ICON_MAP: Record<string, IconEntry> = {
  cash:           { Component: CashAccountIcon,       defaultBg: AccountColors.cash },
  card:           { Component: CardAccountIcon,       defaultBg: AccountColors.card },
  savings:        { Component: SavingsAccountIcon,    defaultBg: AccountColors.savings },
  bank:           { Component: BankAccountIcon,       defaultBg: AccountColors.bank },
  wallet:         { Component: WalletAccountIcon,     defaultBg: AccountColors.wallet },
  crypto:         { Component: CryptoAccountIcon,     defaultBg: AccountColors.crypto },
  investment_acc: { Component: InvestmentAccountIcon, defaultBg: AccountColors.investment_acc },
}

export const ALL_CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICON_MAP)
export const ALL_ACCOUNT_ICON_KEYS  = Object.keys(ACCOUNT_ICON_MAP)

// ─── IconCircle — uses StyleShape from fluent-styles ─────────────────────────

interface IconCircleProps {
  iconKey: string
  size?:   number
  bg?:     string
  type?:   'category' | 'account'
}

export const IconCircle: React.FC<IconCircleProps> = ({ iconKey, size = 48, bg, type = 'category' }) => {
  const map     = type === 'account' ? ACCOUNT_ICON_MAP : CATEGORY_ICON_MAP
  const entry   = map[iconKey] ?? CATEGORY_ICON_MAP.other
  const Icon    = entry.Component
  const bgColor = bg ?? entry.defaultBg
  const iconSize = Math.round(size * 0.46)

  return (
    <StyleShape
      cycle
      size={size}
      backgroundColor={bgColor}
      alignItems="center"
      justifyContent="center"
    >
      <Icon size={iconSize} color="#ffffff" strokeWidth={1.8} />
    </StyleShape>
  )
}

export { IncomeArrowIcon, ExpenseArrowIcon, TransferIcon }

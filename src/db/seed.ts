import { db } from './index'
import { accounts, categories, settings } from './schema'
import { CategoryColors, AccountColors } from '../constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })

const now = () => new Date()

// ─── Default categories ───────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  // ── Expense ──────────────────────────────────────────
  { name: 'Food',           icon: 'food',           color: CategoryColors.food,           type: 'expense' as const, sortOrder: 1  },
  { name: 'Grocery',        icon: 'grocery',        color: CategoryColors.grocery,         type: 'expense' as const, sortOrder: 2  },
  { name: 'Restaurant',     icon: 'restaurant',     color: CategoryColors.restaurant,      type: 'expense' as const, sortOrder: 3  },
  { name: 'Coffee',         icon: 'coffee',         color: CategoryColors.coffee,          type: 'expense' as const, sortOrder: 4  },
  { name: 'Shopping',       icon: 'shopping',       color: CategoryColors.shopping,        type: 'expense' as const, sortOrder: 5  },
  { name: 'Clothing',       icon: 'clothing',       color: CategoryColors.clothing,        type: 'expense' as const, sortOrder: 6  },
  { name: 'Health',         icon: 'health',         color: CategoryColors.health,          type: 'expense' as const, sortOrder: 7  },
  { name: 'Medicine',       icon: 'medicine',       color: CategoryColors.medicine,        type: 'expense' as const, sortOrder: 8  },
  { name: 'Home',           icon: 'home',           color: CategoryColors.home,            type: 'expense' as const, sortOrder: 9  },
  { name: 'Rent',           icon: 'rent',           color: CategoryColors.rent,            type: 'expense' as const, sortOrder: 10 },
  { name: 'Bills',          icon: 'bills',          color: CategoryColors.bills,           type: 'expense' as const, sortOrder: 11 },
  { name: 'Utilities',      icon: 'utilities',      color: CategoryColors.utilities,       type: 'expense' as const, sortOrder: 12 },
  { name: 'Car',            icon: 'car',            color: CategoryColors.car,             type: 'expense' as const, sortOrder: 13 },
  { name: 'Fuel',           icon: 'fuel',           color: CategoryColors.fuel,            type: 'expense' as const, sortOrder: 14 },
  { name: 'Transportation', icon: 'transportation', color: CategoryColors.transportation,  type: 'expense' as const, sortOrder: 15 },
  { name: 'Travel',         icon: 'travel',         color: CategoryColors.travel,          type: 'expense' as const, sortOrder: 16 },
  { name: 'Entertainment',  icon: 'entertainment',  color: CategoryColors.entertainment,   type: 'expense' as const, sortOrder: 17 },
  { name: 'Subscriptions',  icon: 'subscriptions',  color: CategoryColors.subscriptions,   type: 'expense' as const, sortOrder: 18 },
  { name: 'Education',      icon: 'education',      color: CategoryColors.education,       type: 'expense' as const, sortOrder: 19 },
  { name: 'Sport',          icon: 'sport',          color: CategoryColors.sport,           type: 'expense' as const, sortOrder: 20 },
  { name: 'Gym',            icon: 'gym',            color: CategoryColors.gym,             type: 'expense' as const, sortOrder: 21 },
  { name: 'Beauty',         icon: 'beauty',         color: CategoryColors.beauty,          type: 'expense' as const, sortOrder: 22 },
  { name: 'Electronics',    icon: 'electronics',    color: CategoryColors.electronics,     type: 'expense' as const, sortOrder: 23 },
  { name: 'Repair',         icon: 'repair',         color: CategoryColors.repair,          type: 'expense' as const, sortOrder: 24 },
  { name: 'Insurance',      icon: 'insurance',      color: CategoryColors.insurance,       type: 'expense' as const, sortOrder: 25 },
  { name: 'Tax',            icon: 'tax',            color: CategoryColors.tax,             type: 'expense' as const, sortOrder: 26 },
  { name: 'Telephone',      icon: 'telephone',      color: CategoryColors.telephone,       type: 'expense' as const, sortOrder: 27 },
  { name: 'Social',         icon: 'social',         color: CategoryColors.social,          type: 'expense' as const, sortOrder: 28 },
  { name: 'Pet',            icon: 'pet',            color: CategoryColors.pet,             type: 'expense' as const, sortOrder: 29 },
  { name: 'Baby',           icon: 'baby',           color: CategoryColors.baby,            type: 'expense' as const, sortOrder: 30 },
  { name: 'Charity',        icon: 'charity',        color: CategoryColors.charity,         type: 'expense' as const, sortOrder: 31 },
  { name: 'Other',          icon: 'other',          color: CategoryColors.other,           type: 'expense' as const, sortOrder: 32 },

  // ── Income ───────────────────────────────────────────
  { name: 'Salary',         icon: 'salary',         color: CategoryColors.salary,          type: 'income' as const,  sortOrder: 1  },
  { name: 'Freelance',      icon: 'freelance',      color: CategoryColors.freelance,       type: 'income' as const,  sortOrder: 2  },
  { name: 'Business',       icon: 'business',       color: CategoryColors.business,        type: 'income' as const,  sortOrder: 3  },
  { name: 'Investment',     icon: 'investment',     color: CategoryColors.investment,      type: 'income' as const,  sortOrder: 4  },
  { name: 'Dividend',       icon: 'dividend',       color: CategoryColors.dividend,        type: 'income' as const,  sortOrder: 5  },
  { name: 'Rental Income',  icon: 'rental_income',  color: CategoryColors.rental_income,   type: 'income' as const,  sortOrder: 6  },
  { name: 'Bonus',          icon: 'bonus',          color: CategoryColors.bonus,           type: 'income' as const,  sortOrder: 7  },
  { name: 'Gift',           icon: 'gift',           color: CategoryColors.gift,            type: 'income' as const,  sortOrder: 8  },
  { name: 'Refund',         icon: 'refund',         color: CategoryColors.refund,          type: 'income' as const,  sortOrder: 9  },
  { name: 'Other Income',   icon: 'other',          color: CategoryColors.other,           type: 'income' as const,  sortOrder: 10 },
]

// ─── Default accounts ─────────────────────────────────────────────────────────

const DEFAULT_ACCOUNTS = [
  { name: 'Cash',    icon: 'cash',    color: AccountColors.cash,    sortOrder: 1, isDefault: true  },
  { name: 'Card',    icon: 'card',    color: AccountColors.card,    sortOrder: 2, isDefault: false },
  { name: 'Savings', icon: 'savings', color: AccountColors.savings, sortOrder: 3, isDefault: false },
]

// ─── Seed function ────────────────────────────────────────────────────────────

export const seedDatabase = async (): Promise<void> => {
  try {
    // Check if already seeded
    const existingCategories = await db.select().from(categories).limit(1)
    if (existingCategories.length > 0) {
      console.log('[DB] Already seeded, skipping')
      return
    }

    const ts = now()

    // Seed categories
    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((c) => ({
        id:        uuid(),
        name:      c.name,
        icon:      c.icon,
        color:     c.color,
        type:      c.type,
        isDefault: true,
        sortOrder: c.sortOrder,
        createdAt: ts,
      }))
    )

    // Seed accounts
    await db.insert(accounts).values(
      DEFAULT_ACCOUNTS.map((a) => ({
        id:            uuid(),
        name:          a.name,
        icon:          a.icon,
        color:         a.color,
        balance:       0,
        initialAmount: 0,
        sortOrder:     a.sortOrder,
        isDefault:     a.isDefault,
        createdAt:     ts,
        updatedAt:     ts,
      }))
    )

    // Seed settings singleton
    await db.insert(settings).values({
      id:             'singleton',
      currency:       'USD',
      currencySymbol: '$',
      viewMode:       'monthly',
      showTotal:      true,
      carryOver:      false,
      updatedAt:      ts,
    }).onConflictDoNothing()

    console.log('[DB] Seed complete')
  } catch (error) {
    console.error('[DB] Seed error:', error)
    throw error
  }
}

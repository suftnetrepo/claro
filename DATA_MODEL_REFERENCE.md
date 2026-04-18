# Claro Data Model Reference

**Last Updated:** 18 April 2026

## Overview

This document clarifies the relationships between core data entities: Accounts, Categories, Transactions, and Budgets.

---

## Entity Definitions

### Accounts
- **Primary Key:** `id`
- **Attributes:** `name`, `icon`, `color`, `balance`, `initialAmount`, `sortOrder`, `isDefault`
- **Purpose:** Represent financial accounts (e.g., "Checking", "Savings", "Credit Card")
- **Uniqueness:** One account per row; users can have multiple accounts

### Categories
- **Primary Key:** `id`
- **Attributes:** `name`, `icon`, `color`, `type` (expense|income), `isDefault`, `sortOrder`
- **Purpose:** Classify transactions (e.g., "Groceries", "Salary", "Transfer")
- **Scope:** Global - same categories available across all accounts

### Transactions
- **Primary Key:** `id`
- **Foreign Keys:** `accountId`, `categoryId` (nullable), `toAccountId` (nullable for transfers)
- **Attributes:** `type` (income|expense|transfer), `amount`, `date`, `notes`
- **Purpose:** Record financial activity
- **Key Constraint:** Every transaction is tied to an account AND a date
- **Account Scope:** Transactions CAN belong to different accounts

**Structure:**
```
Transaction {
  accountId  → Which account (e.g., Checking)
  categoryId → How it's categorized (e.g., Groceries)
  date       → When it happened
  amount     → How much
  type       → expense|income|transfer
  ...
}
```

### Budgets
- **Primary Key:** `id`
- **Foreign Keys:** `categoryId`
- **Attributes:** `month` ("YYYY-MM"), `limitAmount`
- **Unique Constraint:** `(month, categoryId)` - one budget limit per category per month
- **Purpose:** Set spending limits for categories by month
- **⚠️ CRITICAL:** **NO accountId field** - Budgets are NOT account-specific

**Structure:**
```
Budget {
  categoryId    → Which category (e.g., "Groceries")
  month         → Which month (e.g., "2026-04")
  limitAmount   → Spending limit for that category that month
  ...
}
```

---

## Data Relationships

### Budget-to-Transaction Link
**Budgets are applied ACROSS ALL ACCOUNTS**

When calculating budget usage for a given category and month:
1. Find all transactions where `type = 'expense'`
2. AND `date` falls in the calendar month
3. AND `categoryId` matches the budget's categoryId
4. **SUM the amounts from ALL accounts** (no accountId filter)

**Code Location:** [src/services/budgetService.ts](src/services/budgetService.ts#L37-L42)

```typescript
// This sums ALL transactions for a category in a month, across all accounts
const spendingRows = await db
  .select({ categoryId: transactions.categoryId, total: sum(transactions.amount) })
  .from(transactions)
  .where(and(
    eq(transactions.type, 'expense'),
    gte(transactions.date, start),
    lte(transactions.date, end)
  ))
  .groupBy(transactions.categoryId)  // ← Grouped by CATEGORY only, not account
```

---

## Example Scenario

**Accounts:**
- Account A: "Checking"
- Account B: "Credit Card"

**Budget:**
- Category: "Groceries"
- Month: "2026-04"
- Limit: $200

**Transactions:**
- April 5: $50 groceries from Checking (Account A)
- April 12: $75 groceries from Credit Card (Account B)
- April 20: $60 groceries from Checking (Account A)

**Budget Status:**
- Total Spent: $50 + $75 + $60 = **$185** (across both accounts)
- Remaining: $200 - $185 = **$15**
- Usage: 92.5%

✅ **The budget limit applies to the category across all accounts**, not per account.

---

## UI Implications

### Add Transaction Screen
- User selects: Account → Category → Date → Amount
- Account selection is **required** (determines where money flows)
- Category is **optional** (for transaction classification)

### Set Budget Screen
- User selects: Category → Month → Limit
- **No account selection** - Budget applies to that category across all accounts
- User should understand: "Setting budget for Groceries means all groceries spending this month, from any account"

### Budget Tracking
- When viewing budgets for a month, user sees spending aggregated by category
- If user has multiple accounts, they see combined usage across all accounts
- Example user mental model: "I budgeted $200 for groceries and spent $185 across my checking and credit card"

---

## Design Rationale

### Why Budgets Aren't Account-Specific

1. **Cross-account spending patterns:** Most users have multiple accounts and want to track total spending per category, not per account
2. **Simpler mental model:** "I want to spend $X on groceries this month" vs. "$X on groceries in checking, $Y in credit card"
3. **Month-based limits:** Budgets are inherently monthly cash flow tools, not account balance tools
4. **Scalability:** Adding accountId would create N×M budget combinations (accounts × categories × months) instead of M×12 (categories × months)

---

## Free Plan Gating

- **Free users:** 1 budget per month (global limit across all categories and accounts)
- **Premium users:** Unlimited budgets
- **Example:** Free user can set ONE budget (e.g., Groceries in April) before hitting premium paywall

**Code Location:** [src/constants/premium.ts](src/constants/premium.ts#L16)

---

## Related Documentation

- [QA Verification: Budget Gating](QA_VERIFICATION_BUDGET_GATING.md) - Testing scenarios for budget limits
- [src/db/schema.ts](src/db/schema.ts#L53-L65) - Budget table definition
- [src/services/budgetService.ts](src/services/budgetService.ts) - Budget queries and calculations
- [src/screens/budgets/BudgetsScreen.tsx](src/screens/budgets/BudgetsScreen.tsx) - UI for viewing/managing budgets

---

## Summary Table

| Entity | Tied To | Unique Key | Account-Specific? | Scope |
|--------|---------|-----------|-------------------|-------|
| **Account** | — | `id` | N/A | User-level |
| **Category** | — | `id` | No | Global (all accounts) |
| **Transaction** | Account + Category + Date | `id` | Yes (tied to 1 account) | Per-account |
| **Budget** | Category + Month | `(month, categoryId)` | **No** (aggregate across all accounts) | Global (all accounts) |

---

## Verification Checklist

- [x] Schema has no accountId field on budgets table
- [x] budgetService.getByMonth() does NOT filter by accountId
- [x] Budget spending calculation aggregates across all accounts
- [x] UI makes cross-account nature clear to users
- [x] Documentation explains the design rationale

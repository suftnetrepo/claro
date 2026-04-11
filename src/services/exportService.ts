import * as FileSystem from 'expo-file-system'
import * as Sharing    from 'expo-sharing'
import { format }      from 'date-fns'
import { db }          from '../db'
import { transactions, accounts, categories } from '../db/schema'
import { eq, asc }     from 'drizzle-orm'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const escapeCSV = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const row = (...cols: (string | number | null | undefined)[]): string =>
  cols.map(escapeCSV).join(',')

// ─── CSV Export ───────────────────────────────────────────────────────────────

export const exportCSV = async (): Promise<void> => {
  // Fetch all transactions with account + category names
  const rows = await db
    .select({
      id:            transactions.id,
      date:          transactions.date,
      type:          transactions.type,
      amount:        transactions.amount,
      notes:         transactions.notes,
      accountName:   accounts.name,
      categoryName:  categories.name,
    })
    .from(transactions)
    .leftJoin(accounts,    eq(transactions.accountId,   accounts.id))
    .leftJoin(categories,  eq(transactions.categoryId,  categories.id))
    .orderBy(asc(transactions.date))

  const header = row('Date', 'Time', 'Type', 'Amount', 'Category', 'Account', 'Notes')
  const lines  = rows.map(r => {
    const d = new Date(r.date)
    return row(
      format(d, 'yyyy-MM-dd'),
      format(d, 'HH:mm'),
      r.type,
      r.amount,
      r.categoryName ?? '',
      r.accountName  ?? '',
      r.notes        ?? '',
    )
  })

  const csv      = [header, ...lines].join('\n')
  const fileName = `claro-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
  const fileUri  = FileSystem.documentDirectory + fileName

  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  })

  const canShare = await Sharing.isAvailableAsync()
  if (!canShare) throw new Error('Sharing is not available on this device')

  await Sharing.shareAsync(fileUri, {
    mimeType:     'text/csv',
    dialogTitle:  'Export Transactions',
    UTI:          'public.comma-separated-values-text',
  })
}

// ─── JSON Backup ──────────────────────────────────────────────────────────────

export const exportJSON = async (): Promise<void> => {
  const [allTransactions, allAccounts, allCategories] = await Promise.all([
    db.select().from(transactions).orderBy(asc(transactions.date)),
    db.select().from(accounts),
    db.select().from(categories),
  ])

  const backup = {
    version:   '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      transactions: allTransactions,
      accounts:     allAccounts,
      categories:   allCategories,
    },
  }

  const json     = JSON.stringify(backup, null, 2)
  const fileName = `claro-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  const fileUri  = FileSystem.documentDirectory + fileName

  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  })

  const canShare = await Sharing.isAvailableAsync()
  if (!canShare) throw new Error('Sharing is not available on this device')

  await Sharing.shareAsync(fileUri, {
    mimeType:    'application/json',
    dialogTitle: 'Backup Claro Data',
    UTI:         'public.json',
  })
}

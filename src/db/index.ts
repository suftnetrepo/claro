import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as SQLite from 'expo-sqlite'
import * as schema from './schema'
import { SQL_MIGRATIONS } from './migrations'

const sqlite = SQLite.openDatabaseSync('claro.db')

// Enable foreign key enforcement — SQLite disables FK checks by default.
// Without this, onDelete: 'cascade' in the schema is silently ignored,
// meaning deleting an account leaves orphaned transactions in the DB.
sqlite.execSync('PRAGMA foreign_keys = ON;')

export const db = drizzle(sqlite, { schema })

export const runMigrations = async (): Promise<void> => {
  try {
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS __claro_migrations (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        name   TEXT NOT NULL UNIQUE,
        ran_at INTEGER NOT NULL
      );
    `)

    for (let i = 0; i < SQL_MIGRATIONS.length; i++) {
      const name = `migration_${String(i + 1).padStart(4, '0')}`
      const row = await sqlite.getFirstAsync(
        'SELECT id FROM __claro_migrations WHERE name = ?',
        [name]
      )
      if (!row) {
        await sqlite.execAsync(SQL_MIGRATIONS[i])
        await sqlite.runAsync(
          'INSERT INTO __claro_migrations (name, ran_at) VALUES (?, ?)',
          [name, Date.now()]
        )
        console.log('[DB] Ran', name)
      }
    }
    console.log('[DB] Migrations complete')
  } catch (error) {
    console.error('[DB] Migration error:', error)
    throw error
  }
}

export { schema }

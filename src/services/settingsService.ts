import { eq } from 'drizzle-orm'
import { db } from '../db'
import { settings } from '../db/schema'
import type { Settings } from '../db/schema'

export const settingsService = {

  get: async (): Promise<Settings | null> => {
    const rows = await db.select().from(settings).limit(1)
    return rows[0] ?? null
  },

  update: async (input: Partial<Settings>): Promise<void> => {
    await db.update(settings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(settings.id, 'singleton'))
  },
}

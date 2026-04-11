import { useCallback } from 'react'
import { settingsService } from '../services/settingsService'
import type { Settings } from '../db/schema'
import { useSettingsStore } from '../stores'
import { useAsync, type AsyncState } from './useAsync'

export function useSettings(): AsyncState<Settings | null> & {
  update: (partial: Partial<Settings>) => Promise<void>
} {
  const { setSettings } = useSettingsStore()

  const state = useAsync<Settings | null>(async () => {
    const s = await settingsService.get()
    if (s) setSettings(s)
    return s
  }, null)

  const update = useCallback(async (partial: Partial<Settings>) => {
    await settingsService.update(partial)
    state.refetch()
  }, [state])

  return { ...state, update }
}

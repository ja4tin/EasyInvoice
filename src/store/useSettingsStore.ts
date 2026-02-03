import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type SettingsState, type AppSettings } from '@/types'
import { idbStorage } from './storage'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  showGrid: true,
  paperSize: 'a4',
  margin: 20, // 20mm
  appMode: 'payment',
  invoiceLayout: 'cross',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
    }),
    {
      name: 'easyinvoice-settings',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)

/**
 * Project: EasyInvoice
 * File: useSettingsStore.ts
 * Description: 全局应用设置状态管理 (主题、网格显示、纸张大小等)
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

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

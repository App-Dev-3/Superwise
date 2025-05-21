import { defineStore } from 'pinia'
import type { UserSettingsData } from '~/shared/types/userInterfaces'

const STORAGE_KEY = 'app_settings'

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || 'null'
    ) as UserSettingsData | null

    return {
      settings: stored,
    }
  },
  actions: {
    setSettings(settingsData: UserSettingsData) {
      this.settings = settingsData
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
    },
    clearSettings() {
      this.settings = null
      localStorage.removeItem(STORAGE_KEY)
    },
  }
})
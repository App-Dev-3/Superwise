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
    /** private persist helper */
    _persist() {
      if (this.settings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    setSettings(settingsData: UserSettingsData) {
      this.settings = settingsData
      this._persist();
    },
    clearSettings() {
      this.settings = null
      this._persist();
    },
  }
})
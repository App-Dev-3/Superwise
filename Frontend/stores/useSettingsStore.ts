import { defineStore } from 'pinia'
import type { UserSettingsData } from '~/shared/types/userInterfaces'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null as UserSettingsData | null,
  }),
  actions: {
    setSettings(settingsData: UserSettingsData) {
      this.settings = settingsData
    },
    clearSettings() {
      this.settings = null
    },
  }})
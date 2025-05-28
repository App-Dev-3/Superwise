import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserSettingsData } from '~/shared/types/userInterfaces'

export const useSettingsStore = defineStore('settings', () => {
  // Default settings
  const defaultSettings: Required<UserSettingsData> = {
    theme: 'light',
    language: 'en',
    dismissConfirmationModal: true,
    showSupervisionRequestModal: true,
    showDismissModal: true,
    showSupervisionAcceptModal: true,
    showSupervisionRejectModal: true,
    showAddStudentModal: true,
  }

  // Reactive state
  const settings = ref<UserSettingsData>({ ...defaultSettings })

  // Notification ID (you might want to set this from somewhere else in your app)
  const notificationId = ref<string>('N/A')

  // Actions
  function setSettings(settingsData: Partial<UserSettingsData>) {
    settings.value = { ...settings.value, ...settingsData }
    // Persist settings to localStorage if available
    try {
      localStorage.setItem('superwise-settings', JSON.stringify(settings.value))
    } catch (error) {
      console.warn('Could not save settings to localStorage:', error)
    }
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem('superwise-settings')
      if (saved) {
        const parsedSettings = JSON.parse(saved)
        settings.value = { ...defaultSettings, ...parsedSettings }
      }
    } catch (error) {
      console.warn('Could not load settings from localStorage:', error)
    }
  }

  function clearSettings() {
    settings.value = { ...defaultSettings }
    try {
      localStorage.removeItem('superwise-settings')
    } catch (error) {
      console.warn('Could not clear settings from localStorage:', error)
    }
  }

  // Initialize settings on store creation
  loadSettings()

  // Computed getters/setters for each setting
  const theme = computed({
    get: () => settings.value.theme ?? defaultSettings.theme,
    set: (val: string) => setSettings({ theme: val }),
  })

  const language = computed({
    get: () => settings.value.language ?? defaultSettings.language,
    set: (val: string) => setSettings({ language: val }),
  })

  const dismissConfirmationModal = computed({
    get: () => settings.value.dismissConfirmationModal ?? defaultSettings.dismissConfirmationModal,
    set: (val: boolean) => setSettings({ dismissConfirmationModal: val }),
  })

  const showSupervisionRequestModal = computed({
    get: () => settings.value.showSupervisionRequestModal ?? defaultSettings.showSupervisionRequestModal,
    set: (val: boolean) => setSettings({ showSupervisionRequestModal: val }),
  })

  const showDismissModal = computed({
    get: () => settings.value.showDismissModal ?? defaultSettings.showDismissModal,
    set: (val: boolean) => setSettings({ showDismissModal: val }),
  })

  const showSupervisionAcceptModal = computed({
    get: () => settings.value.showSupervisionAcceptModal ?? defaultSettings.showSupervisionAcceptModal,
    set: (val: boolean) => setSettings({ showSupervisionAcceptModal: val }),
  })

  const showSupervisionRejectModal = computed({
    get: () => settings.value.showSupervisionRejectModal ?? defaultSettings.showSupervisionRejectModal,
    set: (val: boolean) => setSettings({ showSupervisionRejectModal: val }),
  })

  const showAddStudentModal = computed({
    get: () => settings.value.showAddStudentModal ?? defaultSettings.showAddStudentModal,
    set: (val: boolean) => setSettings({ showAddStudentModal: val }),
  })

  function setNotificationId(id: string) {
    notificationId.value = id
  }

  return {
    settings,
    notificationId,
    setSettings,
    loadSettings,
    clearSettings,
    setNotificationId,
    theme,
    language,
    dismissConfirmationModal,
    showSupervisionRequestModal,
    showDismissModal,
    showSupervisionAcceptModal,
    showSupervisionRejectModal,
    showAddStudentModal,
  }
})
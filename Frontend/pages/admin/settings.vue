<script setup lang="ts">
import SettingsArea from "~/components/Settings/SettingsArea.vue";
import ThemeToggle from "~/components/App/ThemeToggle/ThemeToggle.vue";
import { useSettingsStore } from "~/stores/useSettingsStore";
import app from "~/app.vue";
import type {Locale} from "@intlify/core-base";

// Language switching
const { locale, locales, setLocale } = useI18n();
const { t } = useI18n();

// Get settings store for state management
const settingsStore = useSettingsStore();

let version = "1.0.0"; // Default version
// Get app version
try {
  version = app.version();
} catch (e) {
  console.error("Error getting app version: ", e);
}

// Copy to clipboard function
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Text copied to clipboard");
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
}

// Handle language change
function onChangeLocale(newLocale: string) {
  setLocale(newLocale as Locale);
  settingsStore.language = newLocale;
}
</script>

<template>
  <div class="flex flex-col items-center px-2 max-w-full">
    <div class="min-h-screen flex flex-col max-w-7xl w-full">
      <AdminHeader :header-text="t('Settings')" />
      <div class="w-full flex flex-col gap-4 p-8 overflow-y-auto">
        <!-- App Settings -->
        <SettingsArea icon="eye" title="Appearance">
          <SettingsElement
            description="Select the theme of the app"
            title="Theme"
          >
            <theme-toggle />
          </SettingsElement>

          <SettingsElement
            :description="t('Select the language of the app')"
            :title="t('language')"
          >
            <CustomSelect
              :model-value="locale"
              :options="
                locales.map((l) => ({
                  key: l.code,
                  value: t('generic.' + l.name),
                }))
              "
              label="Select Language"
              placeholder="Select Language"
              @update:model-value="onChangeLocale"
            />
          </SettingsElement>
        </SettingsArea>

        <!-- App Info -->
        <SettingsArea
          id="settingsArea"
          icon="info-circle"
          title="About SuperWise"
        >
          <SettingsElement :description="version" title="App Version">
            <CustomButton
              class="copyButton"
              color="default"
              left-icon="copy"
              size="lg"
              text=""
              variant="ghost"
              @click="copyToClipboard(`SuperWise App-Version: ${version}`)"
            />
          </SettingsElement>

          <SettingsElement
            :description="settingsStore.notificationId || 'Not available'"
            title="Notification ID"
          >
            <CustomButton
              class="copyButton"
              color="default"
              left-icon="copy"
              size="lg"
              text=""
              variant="ghost"
              @click="
                copyToClipboard(settingsStore.notificationId || 'Not available')
              "
            />
          </SettingsElement>
        </SettingsArea>
      </div>
    </div>
  </div>
</template>

<style scoped>
hr {
  color: var(--color-base-300);
}

.copyButton {
  padding: 0;
  margin: 0;
  width: 48px;
  max-width: 48px;
  opacity: 0.5;
}
</style>

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
      <AdminHeader :header-text="t('nav.settings')" />
      <div class="w-full flex flex-col gap-4 p-8 overflow-y-auto">
        <!-- App Settings -->
        <SettingsArea icon="eye" title="Appearance">
          <SettingsElement
            :description="t('Select the theme of the app')"
            :title="t('settings.theme')"
          >
            <theme-toggle />
          </SettingsElement>

          <SettingsElement
            :description="t('settings.select.language')"
            :title="t('generic.language')"
          >
            <CustomSelect
              :model-value="locale"
              :options="
                locales.map((locale) => ({
                  key: locale.code,
                  value: t('generic.' + locale.name),
                }))
              "
              :label="t('settings.select.language')"
              :placeholder="t('settings.select.language')"
              @update:model-value="onChangeLocale"
            />
          </SettingsElement>
        </SettingsArea>

        <!-- Modal Settings -->
        <SettingsArea icon="phone" title="Modals">
          <SettingsElement
            description="Show confirmation modal when swipe-requesting a supervisor"
            title="Supervision Request Modal"
          >
            <CustomToggle
              v-model:checked="settingsStore.showSupervisionRequestModal"
            />
          </SettingsElement>

          <SettingsElement
            description="Show confirmation modal when swipe-dismissing a supervisor"
            title="Dismiss Modal"
          >
            <CustomToggle v-model:checked="settingsStore.showDismissModal" />
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

<script lang="ts" setup>
import SettingsArea from "~/components/Settings/SettingsArea.vue";
import ThemeToggle from "~/components/App/ThemeToggle/ThemeToggle.vue";
import { useSettingsStore } from "~/stores/useSettingsStore";
import app from "~/app.vue";
import type { Locale } from "@intlify/core-base";

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

definePageMeta({
  layout: "generic-back-layout",
});

</script>

<template>
  <div class="w-full h-fit flex flex-col gap-4 p-8">
    <!-- App Settings -->
    <SettingsArea icon="eye" title="Appearance">
      <SettingsElement
          :description="t('settings.theme.description')"
          :title="t('settings.theme.title')"
      >
        <theme-toggle/>
      </SettingsElement>

      <SettingsElement
          :description="t('settings.language.description')"
          :title="t('settings.language.title')"
      >
        <CustomSelect
            :label="t('settings.language.placeholder')"
            :model-value="locale"
            :options="
                locales.map((l) => ({
                  key: l.code,
                  value: t('generic.' + l.name),
                }))
              "
            :placeholder="t('settings.select.language')"
            @update:model-value="(val) => onChangeLocale(val as string)"
        />
      </SettingsElement>
    </SettingsArea>

    <!-- Modal Settings -->
    <SettingsArea icon="phone" title="Modals">
      <SettingsElement
          :description="t('settings.modal.student.supervisionrequest.description')"
          :title="t('settings.modal.student.supervisionrequest.title')"
      >
        <CustomToggle
            v-model:checked="settingsStore.showSupervisionRequestModal"
        />
      </SettingsElement>

      <SettingsElement
          description="Show confirmation modal when swipe-dismissing a supervisor"
          title="Dismiss Modal"
      >
        <CustomToggle v-model:checked="settingsStore.showDismissModal"/>
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

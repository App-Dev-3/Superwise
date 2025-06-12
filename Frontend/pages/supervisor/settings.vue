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
    <SettingsArea :title="t('settings.title.appearance')" icon="eye">
      <SettingsElement
        :description="t('settings.theme.description')"
        :title="t('settings.theme.title')"
      >
        <theme-toggle />
      </SettingsElement>

      <SettingsElement
        :description="t('settings.language.description')"
        :title="t('settings.language.title')"
      >
        <CustomSelect
          :label="t('settings.select.language')"
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
    <SettingsArea icon="up-right-from-square" title="Modals">
      <SettingsElement
        :description="t('settings.supervisor.acceptingDescription')"
        :title="t('settings.supervisor.acceptingTitle')"
      >
        <CustomToggle
          v-model:checked="settingsStore.showSupervisionAcceptModal"
        />
      </SettingsElement>

      <SettingsElement
        :description="t('settings.supervisor.rejectDescription')"
        :title="t('settings.supervisor.rejectTitle')"
      >
        <CustomToggle
          v-model:checked="settingsStore.showSupervisionRejectModal"
        />
      </SettingsElement>

      <hr >

      <SettingsElement
        :description="t('settings.supervisor.addStudentDescription')"
        :title="t('settings.supervisor.addStudentTitle')"
      >
        <CustomToggle v-model:checked="settingsStore.showAddStudentModal" />
      </SettingsElement>
      <SettingsElement
        :description="t('settings.supervisor.removeStudentDescription')"
        :title="t('settings.supervisor.removeStudentTitle')"
      >
        <CustomToggle v-model:checked="settingsStore.showRemoveStudentModal" />
      </SettingsElement>
    </SettingsArea>

    <!-- App Info -->
    <SettingsArea
      id="settingsArea"
      :title="t('settings.title.about')"
      icon="info-circle"
    >
      <SettingsElement
        :description="version"
        :title="t('settings.title.appVersion')"
      >
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
        :title="t('settings.title.notificationId')"
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

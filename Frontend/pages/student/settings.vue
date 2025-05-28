<script setup lang="ts">
import SettingsArea from "~/components/Settings/SettingsArea.vue";
import { useColorMode } from "#imports";
import ThemeToggle from "~/components/App/ThemeToggle/ThemeToggle.vue";
import { useSettingsStore } from "~/stores/useSettingsStore";
import app from "~/app.vue";
import { onMounted, onBeforeUnmount } from "vue";

definePageMeta({
  layout: "student",
});

// Language switching
const { locale, locales, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});

const { t } = useI18n();

// Get settings store for state management
const settingsStore = useSettingsStore();

let version = "1.0.0"; // Default version
// Get app version
try {
  // @ts-ignore
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

const colorMode = useColorMode();

// Handle language change
function onChangeLocale(newLocale: string) {
  setLocale(newLocale);
  settingsStore.language = newLocale;
}

// Save settings function
const saveSettings = () => {
  // Settings are automatically saved through the store's computed setters
  console.log("Settings saved");
};

// Ensure settings are saved when leaving the page
onMounted(() => {
  window.addEventListener("beforeunload", saveSettings);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", saveSettings);
  saveSettings();
});
</script>

<template>
  <div class="flex flex-col w-full p-6" style="gap: 32px; padding: 24px">
    <!-- App Settings -->
    <SettingsArea icon="eye" title="Appearance">
      <SettingsElement description="Select the theme of the app" title="Theme">
        <theme-toggle />
      </SettingsElement>

      <SettingsElement
        :description="t('Select the language of the app')"
        :title="t('language')"
      >
        <CustomSelect
          :model-value="locale"
          :options="
            locales.map((locale) => ({
              key: locale.code,
              value: t('generic.' + locale.name),
            }))
          "
          label="Select Language"
          placeholder="Select Language"
          @update:model-value="onChangeLocale"
        />
      </SettingsElement>
    </SettingsArea>

    <!-- Modal Settings -->
    <SettingsArea icon="phone" title="Modals">
      <!-- Student -->
      <SettingsElement
        description="Show confirmation modal when swipe-requesting a supervisor"
        title="Supervision Request Modal"
      >
        <CustomToggle
          :model-value="settingsStore.showSupervisionRequestModal"
          @update:model-value="(value: boolean) => settingsStore.showSupervisionRequestModal = value"
        />
      </SettingsElement>

      <SettingsElement
        description="Show confirmation modal when swipe-dismissing a supervisor"
        title="Dismiss Modal"
      >
        <CustomToggle
          :model-value="settingsStore.showDismissModal"
          @update:model-value="(value: boolean) => settingsStore.showDismissModal = value"
        />
      </SettingsElement>

      <hr />
      <!-- Supervisor -->
      <SettingsElement
        description="Show confirmation modal when accepting a chat request"
        title="Chat request Accept Modal"
      >
        <CustomToggle
          :model-value="settingsStore.showChatRequestAcceptModal"
          @update:model-value="(value: boolean) => settingsStore.showChatRequestAcceptModal = value"
        />
      </SettingsElement>

      <SettingsElement
        description="Show confirmation modal when rejecting a chat request"
        title="Chat request Reject Modal"
      >
        <CustomToggle
          :model-value="settingsStore.showChatRequestRejectModal"
          @update:model-value="(value: boolean) => settingsStore.showChatRequestRejectModal = value"
        />
      </SettingsElement>

      <hr />

      <SettingsElement
        description="Show confirmation modal when accepting a supervision request"
        title="Supervision request Accept Modal"
      >
        <CustomToggle
          :model-value="settingsStore.showSupervisionAcceptModal"
          @update:model-value="(value: boolean) => settingsStore.showSupervisionAcceptModal = value"
        />
      </SettingsElement>

      <SettingsElement
        description="Show confirmation modal when rejecting a supervision request"
        title="Supervision request Reject Modal"
      >
        <CustomToggle
          :model-value="settingsStore.showSupervisionRejectModal"
          @update:model-value="(value: boolean) => settingsStore.showSupervisionRejectModal = value"
        />
      </SettingsElement>

      <hr />

      <SettingsElement
        description="Show confirmation modal when adding a student to supervise in the add view."
        title="Add Student to Supervise Modal"
      >
        <CustomToggle
          :model-value="settingsStore.showAddStudentModal"
          @update:model-value="(value: boolean) => settingsStore.showAddStudentModal = value"
        />
      </SettingsElement>
    </SettingsArea>

    <!-- App Info -->
    <SettingsArea id="settingsArea" icon="info-circle" title="About SuperWise">
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

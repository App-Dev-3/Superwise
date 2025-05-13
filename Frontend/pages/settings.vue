<script lang="ts" setup>
import SettingsArea from "~/components/Settings/SettingsArea.vue";
import {useColorMode} from "#imports";
import ThemeToggle from "~/components/App/ThemeToggle/ThemeToggle.vue";
import {useSettingsStore} from "~/stores/useSettingsStore";
import app from "~/app.vue";
import {onMounted} from 'vue';

definePageMeta({
  layout: "landing-layout",
});

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

useColorMode();
// Ensure settings are saved when leaving the page
onMounted(() => {
  window.addEventListener('beforeunload', () => {
    settingsStore.saveAllSettings();
  });
});
</script>

<template>
  <div>
    <admin-header
        header-text="Settings"
        variant="default"
    />

    <!-- I don't know why, but for whatever reason, it does not accept a gap past 4, so i had to go old school css -->
    <div class="flex flex-col w-full p-6" style="gap: 32px; padding: 24px">

      <!-- App Settings -->
      <SettingsArea
          icon="eye"
          title="Appearance"
      >
        <SettingsElement
            description="Select the theme of the app"
            title="Theme"
        >
          <theme-toggle/>
        </SettingsElement>

        <SettingsElement
            description="Select the language of the app"
            title="Language"
        >
          <CustomSelect
              :model-value="settingsStore.language"
              :options="[
                { key: 'en', value: 'English' },
                { key: 'de', value: 'German' },
                { key: 'fr', value: 'French' },
                { key: 'es', value: 'Spanish' },
              ]"
              size="xs"
              @update:model-value="(value: string | number) => settingsStore.language = value as string"
          />
        </SettingsElement>
      </SettingsArea>

      <!-- Modal Settings -->
      <SettingsArea
          icon="phone"
          title="Modals"
      >
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

        <hr>
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

        <hr>

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

        <hr>

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
      <!-- App Info - Fixed icon name -->
      <SettingsArea
          id="settingsArea"
          icon="info-circle"
          title="About SuperWise"
      >
        <SettingsElement
            :description="version"
            title="App Version"
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
            :description="settingsStore.notificationId"
            title="Notification ID"
        >
          <CustomButton
              class="copyButton"
              color="default"
              left-icon="copy"
              size="lg"
              text=""
              variant="ghost"
              @click="copyToClipboard(settingsStore.notificationId)"
          />
        </SettingsElement>
      </SettingsArea>

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
  opacity: .5;
}
</style>

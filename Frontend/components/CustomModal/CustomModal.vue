<template>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box w-9/12 max-w-5xl">
      <div class="flex flex-col w-full items-center space-y-6">
        <div class="flex w-full flex-row justify-between items-center">
          <h3 class="text-lg font-bold">{{ props.title }}</h3>
          <FontAwesomeIcon :icon="icon" class="text-lg self-center" />
        </div>

        <div class="flex flex-col w-full items-center">
          <img
            v-if="props.imageSrc"
            :src="props.imageSrc"
            :alt="props.imageAlt"
            class="h-24 mb-2"
          >
          <p v-if="props.email" class="text-slate-500 text-sm">
            {{ props.email }}
          </p>
        </div>

        <p>{{ props.mainText }}</p>
        <p v-if="props.subText" class="text-slate-500 text-sm">
          {{ props.subText }}
        </p>

        <!-- Optional checkbox -->
        <div v-if="props.showCheckbox" class="flex items-center space-x-2">
          <input
            :id="checkboxId"
            v-model="checked"
            type="checkbox"
            class="checkbox"
          >
          <label :for="checkboxId" class="text-sm select-none">
            {{ props.checkboxLabel || t("Don't show again") }}
          </label>
        </div>
      </div>

      <div class="modal-action">
        <form method="dialog" class="flex flex-col w-full space-y-2">
          <button class="btn w-full">{{ t("Cancel") }}</button>
          <button
            class="btn w-full bg-emerald-500"
            type="button"
            @click="onConfirm"
          >
            {{ props.confirmText }}
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useSettingsStore } from "~/stores/useSettingsStore";

const { t } = useI18n();

const props = defineProps<{
  title: string;
  icon: string;
  imageSrc?: string;
  imageAlt?: string;
  email?: string;
  mainText: string;
  subText?: string;
  confirmText: string;
  /** Display a checkbox inside the modal */
  showCheckbox?: boolean;
  /** Label for the checkbox */
  checkboxLabel?: string;
  /** Key of the settingsStore boolean to bind */
  settingKey?: keyof ReturnType<typeof useSettingsStore>;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
}>();

// Expose show/close
const dialogRef = ref<HTMLDialogElement | null>(null);
function show() {
  dialogRef.value?.showModal();
}
function close() {
  dialogRef.value?.close();
}
defineExpose({ show });

// Checkbox binding to store
const settingsStore = useSettingsStore();
const checked = computed<boolean>({
  get() {
    if (props.showCheckbox && props.settingKey) {
      // invert: unchecked when setting=true
      return !settingsStore[props.settingKey];
    }
    return false;
  },
  set(val: boolean) {
    if (props.showCheckbox && props.settingKey) {
      // invert back to store
      settingsStore[props.settingKey] = !val;
    }
  },
});

// Unique id for label
const checkboxId = `modal-checkbox-${Math.random().toString(36).substr(2, 9)}`;

function onConfirm() {
  emit("confirm");
  close();
}
</script>

<style scoped>
/* reuse any modal styles here */
</style>

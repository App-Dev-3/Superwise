<!-- src/components/CustomModal.vue -->
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
        <p v-if="subText" class="text-slate-500 text-sm">
          {{ props.subText }}
        </p>
      </div>

      <div class="modal-action">
        <form method="dialog" class="flex flex-col w-full space-y-2">
          <button class="btn w-full">Close</button>
          <button class="btn w-full bg-emerald-500" wide @click="onConfirm">
            {{ props.confirmText }}
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps<{
  title: string;
  icon: string;
  imageSrc?: string;
  imageAlt?: string;
  email?: string;
  mainText: string;
  subText?: string;
  confirmText: string;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

function show() {
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

function onConfirm() {
  emit("confirm");
  close();
}

// expose show() so parent can call it with $refs
defineExpose({ show });
</script>

<style scoped>
.border-1 {
  border-width: 1px;
}
.text-x-small {
  font-size: 0.75rem;
}
</style>

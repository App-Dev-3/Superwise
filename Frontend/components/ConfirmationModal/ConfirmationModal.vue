<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  // The id of the component that will be linked to this modal. This MUST BE UNIQUE,
  // as modals get closed by ID references! Could be a UUID etc.
  linkedComponentId: string;
  image?: string;
  headline: string;
  icon: string;
  description: string;
  warning?: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  confirmButtonColor:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'accent'
      | 'error'
      | 'success'
      | 'warning'
      | 'info'
      | 'neutral';
  confirmButtonIcon?: string;
  hideCancelButton?: boolean;
  hideDontShowAgain?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  image: '',
  warning: '',
  cancelButtonText: undefined, // Remove t() from here
  confirmButtonIcon: '',
  hideCancelButton: false,
  hideDontShowAgain: false,
});

// Use computed to get cancel button text
const cancelButtonTextComputed = computed(() => props.cancelButtonText || t('generic.cancel'));

// "cancel" emit is called abort because cancel is a reserved word
const emit = defineEmits<{
  (event: 'confirm' | 'abort' | 'dontShowAgain'): void;
}>();

const dontShowAgain = ref(false);

const closeModal = () => {
  const modal = document.getElementById(
      props.linkedComponentId,
  ) as HTMLDialogElement;
  if (modal) modal.close();
};

const handleCancel = () => {
  emit('abort');
  if (dontShowAgain.value) {
    emit('dontShowAgain');
  }
  closeModal();
};

const handleConfirm = () => {
  emit('confirm');
  if (dontShowAgain.value) {
    emit('dontShowAgain');
  }
  closeModal();
};
</script>

<template>
  <dialog
      :id="props.linkedComponentId"
      class="modal"
      @cancel="handleCancel"
  >
    <div class="modal-box w-11/12 max-w-md">
      <div class="w-full flex justify-between mb-8">
        <h3 class="text-2xl font-bold">
          {{ props.headline }}
        </h3>
        <div class="mx-4 mt-1">
          <FontAwesomeIcon :icon="props.icon" @click="props.icon=='xmark'? closeModal() : null"/>
        </div>
      </div>

      <div class="flex flex-col items-center max-w-full">
        <div
            v-if="props.image"
            class="mask mask-squircle size-24 mb-8"
        >
          <img
              :src="props.image"
              alt="Modal image"
              class="rounded-box"
          >
        </div>
      </div>
      <p class="text-lg text-base-content text-left mb-4">
        {{ props.description }}
      </p>
      <div
          v-if="props.warning"
          class="text-sm text-base-content/60 text-left mb-8"
      >
        <span>{{ props.warning }}</span>
      </div>
      <div v-if="!props.hideDontShowAgain" class="mb-4">
        <label class="label">
          <input
              v-model="dontShowAgain"
              class="checkbox"
              type="checkbox"
          >
          {{ t('modal.dontShowAgain') }}
        </label>
      </div>

      <div class="flex flex-col gap-2">
        <CustomButton
            v-if="!props.hideCancelButton"
            :text="cancelButtonTextComputed"
            block
            color="default"
            size="xl"
            variant="ghost"
            @click="handleCancel"
        />
        <CustomButton
            :color="props.confirmButtonColor"
            :left-icon="props.confirmButtonIcon"
            :text="props.confirmButtonText"
            block
            size="xl"
            variant="soft"
            @click="handleConfirm"
        />
      </div>
    </div>
  </dialog>
</template>

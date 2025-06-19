<script lang="ts" setup>

import { nextTick } from "vue";
import { v4 as uuid } from "uuid";

const { t } = useI18n();

const openConfirmationModal = async () => {
  await nextTick();
  const modal = document.getElementById(modalId) as HTMLDialogElement;
  modal?.showModal();
};

const deleteData = () => {
  // Implement the logic to delete data
  openToast();
};

const openToast = () => {
  showToast.value = true;
}

const closeToast = () => {
  showToast.value = false;
}

const showToast = ref(false);
const modalId = uuid();

definePageMeta({
  layout: "generic-back-layout",
});
</script>

<template>
  <div class="p-8 flex flex-col gap-2">
    <h2 class="text-header">
      {{ t('new-cycle.header') }}
    </h2>
    <p>
      {{ t('new-cycle.body') }}
    </p>
    <CustomButton
        :text="t('new-cycle.startNewCycle')"
        block
        class="py-8"
        color="error"
        left-icon="arrows-spin"
        @click="openConfirmationModal"
    />

    <ConfirmationModal
        :confirm-button-text="t('new-cycle.modal.button')"
        :description="t('new-cycle.body')"
        :headline="t('new-cycle.header')"
        :linked-component-id="modalId"
        confirm-button-color="error"
        confirm-button-icon="arrows-spin"
        hide-dont-show-again
        icon="arrows-spin"
        @confirm="deleteData"
    />

    <Toast
        v-if="showToast"
        :button-text="t('generic.close')"
        :duration="3000"
        :message="t('new-cycle.toast.message')"
        type="success"
        @close="closeToast"
        @button-click="closeToast"
    />
  </div>
</template>

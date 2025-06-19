<script lang="ts" setup>

import ValidatedMailInput from "~/components/SupervisorStudentList/ValidatedMailInput.vue";
import { v4 as uuid } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { HttpMethods } from "#shared/enums/enums";

const { t } = useI18n();

const clearInput = ref(false);
const emailDomain = "fhstp.ac.at";

const updateMail = (value: string) => {
  newAdmin.value.email = value;
};

const confirm = async () => {
  if (!newAdmin.value.email) return;

  const createBody = {
    "email": newAdmin.value.email,
    "first_name": newAdmin.value.firstName,
    "last_name": newAdmin.value.lastName,
  }

  $fetch("/api/admin/create-admin", {
        method: HttpMethods.POST,
        body: createBody,
        headers: {
          "Content-Type": "application/json",
        },
      }
  )
      .then((response) => {
        console.log(response);
        toastData.value = {
          message: t('add-admin.toast.message'),
          type: "success",
        }
      })
      .catch((error) => {
        toastData.value.type = "error";
        switch (error.status) {
          case 400:
            // Bad Request - Invalid email domain, missing required fields, or user already exists.
            toastData.value.message = t('add-admin.toast.error.400');
            break;
          case 403:
            // Forbidden - Only existing admins can create new admin accounts.
            toastData.value.message = t('add-admin.toast.error.403');
            break;
          case 409:
            // Conflict - User with this email already exists.
            toastData.value.message = t('add-admin.toast.error.409');
            break;
          default:
            toastData.value.message = t('add-admin.toast.error.generic');
            break;
        }

      })
      .finally(() => {
        openToast();
      });

};


const openConfirmationModal = async () => {
  console.log('Opening confirmation modal...');
  if (!newAdmin.value.email || newAdmin.value.email.length < 1
      || !newAdmin.value.firstName || newAdmin.value.lastName.length < 1
      || !newAdmin.value.lastName || newAdmin.value.lastName.length < 1) {
    showError.value = true;
    return;
  }
  showError.value = false;

  await nextTick();
  const modal = document.getElementById(modalId) as HTMLDialogElement;
  modal?.showModal();
  console.log(modal);
};
const addAdmin = () => {
  // Implement the logic to delete data
  console.log("Add new admin...");
  confirm();
};
const openToast = () => {
  console.log('Open toast...');
  newAdmin.value = {
    email: "",
    firstName: "",
    lastName: "",
  };
  clearInput.value = true;

  showToast.value = true;
}
const closeToast = () => {
  console.log('Close toast...');
  showToast.value = false;
}
const showToast = ref(false);

const toastData = ref({
  message: t('add-admin.toast.message'),
  type: "success",
})

const newAdmin = ref({
  email: "",
  firstName: "",
  lastName: "",
})

const modalId = uuid();

const showError = ref(false);

definePageMeta({
  layout: "generic-back-layout",
});
</script>

<template>
  <div class="flex min-h-0 h-full flex-col gap-2">
    <div class="flex flex-col size-full p-8 overflow-y-auto">
      <h2 class="text-large">{{ t('add-admin.title') }}</h2>
      <p class="text-body">{{ t('add-admin.text') }}</p>

      <div class="flex py-4 my-4 flex-col gap-2 border-t border-t-base-300">
        <div class="flex flex-col">
          <p class="text-sm font-semibold mb-1 opacity-50 my-0 py-1">
            {{ t('generic.mail') }}*
          </p>
          <ValidatedMailInput
              :clear-input="clearInput"
              :domain="emailDomain"
              error-message="Invalid email address"
              placeholder="Add Student..."
              @update:model-value="updateMail"
              @update:input-cleared="clearInput = false"
          />
        </div>
        <input-field
            v-model="newAdmin.firstName"
            :label="t('onboarding.firstName')"
            placeholder="Max"
            required
        />
        <input-field
            v-model="newAdmin.lastName"
            :label="t('onboarding.lastName')"
            placeholder="Mustermann"
            required
        />
      </div>
    </div>
    <div
        class="w-full h-fit flex flex-col justify-center p-4 border-t border-t-base-300"
    >
      <div
          v-if="showError as boolean && (!newAdmin.email || !newAdmin.firstName || !newAdmin.lastName)"
          class="text-error-content w-full px-4 py-2 bg-error rounded-xl flex justify-start items-center gap-4 my-4">
        <FontAwesomeIcon class="text-error-content" icon="warning"/>
        <p class="text-md">
          {{ t('add-admin.inputMissing') }}
        </p>
      </div>
      <CustomButton
          :text="t('add-admin.add-admin')"
          block
          color="warning"
          left-icon="plus"
          @click="openConfirmationModal"
      />
    </div>

    <ConfirmationModal
        :confirm-button-text="t('add-admin.add-admin')"
        :description="t('add-admin.modal.text', {firstName: newAdmin.firstName, lastName: newAdmin.lastName, mail: newAdmin.email})"
        :headline="t('add-admin.add-admin')"
        :linked-component-id="modalId"
        confirm-button-color="warning"
        confirm-button-icon="plus"
        hide-dont-show-again
        icon="plus"
        @confirm="addAdmin"
    />

    <Toast
        v-if="showToast"
        :button-text="t('generic.close')"
        :message="toastData.message"
        :type="toastData.type"
        @close="closeToast"
        @button-click="closeToast"
    />

  </div>
</template>

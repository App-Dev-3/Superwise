<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import GenericHeader from "../AdminHeader/GenericHeader.vue";

const { t } = useI18n();

interface MultiStepFormProps {
  totalSteps: number;
  buttonText: string[];
  descriptionText: string[];
  headerText: string[];
}

const props = defineProps<MultiStepFormProps>();

const emit = defineEmits([ 'submit', 'step-changed' ]);

const currentStep = ref(1);

function next() {
  if (currentStep.value < props.totalSteps) currentStep.value++;
  emit('step-changed', currentStep.value);
}

function back() {
  if (currentStep.value > 1) currentStep.value--;
  emit('step-changed', currentStep.value);
}

function submit() {
  emit('submit');
}
</script>

<template>
  <form
      @submit.prevent="submit"
  >
    <GenericHeader
        :show-back="currentStep > 1"
        :text="props.headerText[currentStep - 1]"
        @back="back"
    />
    <div class="p-8 flex flex-col gap-8 size-full">

      <!-- Dynamic slots for each step -->
      <div class="size-full flex flex-col">
        <slot :name="`step${currentStep}`"/>
      </div>

      <div class="flex justify-center w-full flex-col gap-3">
        <p
            class="text-x-small opacity-50 px-4">
          {{ props.descriptionText[currentStep - 1] }}
        </p>

        <CustomButton
            v-if="currentStep < totalSteps"
            :text="props.buttonText[currentStep-1]"
            block
            class="w-full"
            data-test="next-button"
            right-icon="arrow-right"
            @click="next"

        />

        <CustomButton
            v-else
            :text="t('multiStepForm.startMatching')"
            block
            btn-type="submit"
            class="w-full"
            data-test="submit-button"
            right-icon="arrow-right"
            @click="next"
        />
      </div>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface MultiStepFormProps {
  totalSteps: number;
  buttonText: string[];
  descriptionText: string[];
}

const props = defineProps<MultiStepFormProps>();

const emit = defineEmits([ 'submit', 'step-changed' ]);

const currentStep = ref(1);

function next() {
  if (currentStep.value < props.totalSteps) currentStep.value++;
  emit('step-changed', currentStep.value);
}

function submit() {
  emit('submit');
}
</script>

<template>
  <form @submit.prevent="submit">
    <!-- Dynamic slots for each step -->
    <div class="size-full flex flex-col">
      <slot :name="`step${currentStep}`"/>
    </div>

    <!-- TODO: Replace buttons with custom component button as soon as it is ready -->
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
  </form>
</template>

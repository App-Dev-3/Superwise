<script setup>
import {ref} from 'vue';
import {useI18n} from 'vue-i18n';

const {t} = useI18n();

const props = defineProps({
  totalSteps: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['submit', 'step-changed']);

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
    <slot :name="`step${currentStep}`"/>

    <!-- TODO: Replace buttons with custom component button as soon as it is ready -->
    <div class="flex justify-center pt-4">
      <CustomButton
          v-if="currentStep < totalSteps"
          :text="t('multiStepForm.next')"
          :wide="true"
          class="w-3/4"
          data-test="next-button"
          right-icon="arrow-right"
          @click="next"
      />

      <CustomButton
          v-else
          :text="t('multiStepForm.startMatching')"
          :wide="true"
          btn-type="submit"
          class="w-3/4"
          data-test="submit-button"
          right-icon="arrow-right"
          @click="next"
      />
    </div>
  </form>
</template>

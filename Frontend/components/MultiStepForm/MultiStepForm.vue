<script setup>
import { ref } from "vue";

const props = defineProps({
  totalSteps: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["submit", "step-changed"]);

const currentStep = ref(1);

function next() {
  if (currentStep.value < props.totalSteps) currentStep.value++;
  emit("step-changed", currentStep.value);
}

function submit() {
  emit("submit");
}
</script>

<template>
  <form @submit.prevent="submit">
    <!-- Dynamic slots for each step -->
    <slot :name="`step${currentStep}`" />

    <!-- TODO: Replace buttons with custom component button as soon as it is ready -->
    <div class="flex justify-center pt-4">
      <CustomButton
        v-if="currentStep < totalSteps"
        text="Next"
        class="w-3/4"
        right-icon="arrow-right"
        data-test="next-button"
        :wide="true"
        @click="next"
      />  
      
      <CustomButton
        v-else
        text="Start Matching"
        btnType="submit"
        class="w-3/4"
        right-icon="arrow-right"
        data-test="submit-button"
        :wide="true"
        @click="next"
      />
    </div>
  </form>
</template>

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
      <button
        v-if="currentStep < totalSteps"
        type="button"
        class="btn w-3/4"
        data-test="next-button"
        @click="next"
      >
        next
      </button>

      <button v-else type="submit" class="btn w-3/4" data-test="submit-button">
        Submit
      </button>
    </div>
  </form>
</template>

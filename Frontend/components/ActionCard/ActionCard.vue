<script setup>
import {computed} from 'vue';

const props = defineProps({
  buttonText: {
    type: String,
    default: 'Button Text'
  },
  cardType: {
    type: String,
    default: 'default',
  },
  action: {
    type: Function,
    default: () => {
    }
  },
  headerText: {
    type: String,
    default: ''
  },
});

const emit = defineEmits(['action']);

function handleAction() {
  // Call the action prop if provided
  props.action();
  // Also emit the action event
  emit('action');
}

// Compute button style based on cardType
const buttonStyle = computed(() => {
  switch (props.cardType?.toLocaleLowerCase()) {
    case "primary":
      return 'btn-primary';
    case "default":
    default:
      return 'btn-ghost';
  }
});
</script>

<template>
  <div
      class="">
    <p
        v-if="props.headerText.blankLine"
    >{{ props.headerText }}</p>
    <div class="card shadow-xl border border-base-300">
      <slot/>

      <!-- Action button at the bottom -->
      <div class="flex justify-center px-16 py-4 border-t border-base-300">
        <button
            :class="buttonStyle"
            class="w-full btn"
            data-test="action-button"
            @click="handleAction"
        >
          {{ props.buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

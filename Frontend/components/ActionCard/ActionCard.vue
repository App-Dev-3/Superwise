<script setup>
import CustomButton from "../CustomButton/CustomButton.vue";

const props = defineProps({
  buttonText: {
    type: String,
    default: "Click Me",
  },
  cardType: {
    type: String,
    default: 'default',
    validator: (value) => !value || ["default", "primary"].includes(value),
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

</script>

<template>
  <div
      class="">
    <p
        v-if="props.headerText"
        class="px-1"
    >
      {{ props.headerText }}
    </p>
    <div class="card shadow-xl border border-base-300">
      <slot/>

      <!-- Action button at the bottom -->
      <div class="px-16 py-4 border-t border-base-300">

        <CustomButton
            :color="props.cardType"
            :text="props.buttonText"
            block
            @click="handleAction"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

<script lang="ts" setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {onMounted, ref, watch} from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: "success",
    validator: (value) => ["success", "error", "exception"].includes(value as string),
  },
  message: {
    type: String,
    default: "Chat request has been sent",
  },
  duration: {
    type: Number,
    default: 3000,
  },
  buttonText: {
    type: String,
    default: "close",
  }
});

const emit = defineEmits(['buttonClick', 'close']);

// Internal visibility state
const visible = ref(props.show);

// Watch for changes to the show prop
watch(() => props.show, (newValue) => {
  visible.value = newValue;
});

// Helper function to get the correct alert class based on type
const getAlertClass = () => {
  switch (props.type) {
    case "success":
      return 'alert-success';
    case "error":
    case "exception":
      return 'alert-error';
    default:
      return 'alert-success';
  }
};

// Helper function to get the correct icon based on type
const getIcon = () => {
  switch (props.type) {
    case "success":
      return 'check';
    case "error":
      return 'xmark';
    case "exception":
      return 'triangle-exclamation';
    default:
      return 'check';
  }
};

// Auto-close toast after duration by changing internal visibility
onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      visible.value = false;
      emit('close');
    }, props.duration);
  }
});

// Just emit the event, don't change visibility
const handleButtonClick = () => {
  emit('buttonClick');
};
</script>

<template>
  <div
      v-if="visible"
      class="fixed bottom-18 left-0 right-0 flex justify-center z-50 px-12"
  >
    <div :class="['alert', getAlertClass(), 'w-full', 'shadow-lg']" role="alert">
      <FontAwesomeIcon :icon="getIcon()" class="text-xl"/>
      <span>{{ message }}</span>
      <CustomButton
          :text="buttonText"
          color="default"
          @click="handleButtonClick"
      />
    </div>
  </div>
</template>

<style scoped>
</style>

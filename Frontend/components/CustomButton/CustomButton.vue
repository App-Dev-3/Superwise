<script lang="js" setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {computed} from "vue";

const props = defineProps({
  text: {
    type: String,
    default: "Click Me",
  },
  color: {
    type: String,
    default: "primary",
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["xs", "sm", "md", "lg", "xl"].includes(value),
  },
  variant: {
    type: String,
    default: null,
    validator: (value) => !value || ["outline", "ghost", "soft", "dash"].includes(value),
  },
  wide: {
    type: Boolean,
    default: false,
    validator(value, props) {
      if (props.block && value) {
        console.warn("classes 'wide' and 'block' cannot be used together on button");
        return false;
      }
      return true;
    }
  },
  block: {
    type: Boolean,
    default: false,
    validator(value, props) {
      if (props.wide && value) {
        console.warn("classes 'wide' and 'block' cannot be used together on button");
        return false;
      }
      return true;
    }
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  leftIcon: {
    type: String,
    default: "",
  },
  rightIcon: {
    type: String,
    default: "",
  },
  topText: {
    type: String,
    default: "",
  },
  btnType: {
    type: String,
    default: "button",
    validator: (value) => ["button", "submit"].includes(value),
  }
})

const emit = defineEmits(["click"])

const buttonClasses = computed(() => {
  return {
    // Boolean classes
    'btn-wide': props.wide,
    'btn-block': props.block,
    'btn-disabled': !props.isActive,
    'btn-loading': props.isLoading,

    // Color classes
    'btn-neutral': props.color === 'neutral',
    'btn-primary': props.color === 'primary',
    'btn-secondary': props.color === 'secondary',
    'btn-accent': props.color === 'accent',
    'btn-info': props.color === 'info',
    'btn-success': props.color === 'success',
    'btn-warning': props.color === 'warning',
    'btn-error': props.color === 'error',

    // Size classes
    'btn-xs': props.size === 'xs',
    'btn-sm': props.size === 'sm',
    'btn-md': props.size === 'md',
    'btn-lg': props.size === 'lg',
    'btn-xl': props.size === 'xl',

    // Variant classes
    'btn-outline': props.variant === 'outline',
    'btn-ghost': props.variant === 'ghost',
    'btn-soft': props.variant === 'soft',
    'btn-dash': props.variant === 'dash',
  };
});
</script>

<template>
  <div
      :class="{'w-full': props.block}"
      class="flex flex-col items-center max-w-full"
  >
    <div v-if="props.topText" class="mb-2">
      <span class="text-sm text-base-content/60 block text-center">{{ props.topText }}</span>
    </div>
    <button
        :class="buttonClasses"
        :type="props.btnType"
        class="btn"
        @click="props.isActive ? emit('click') : null"
    >
      <span v-if="props.isLoading && (!props.rightIcon || props.leftIcon)" class="loading"/>
      <FontAwesomeIcon
          v-if="props.leftIcon && !props.isLoading"
          :icon="props.leftIcon"
          data-test="left-icon"
      />
      {{ props.text }}
      <FontAwesomeIcon
          v-if="(props.rightIcon && !props.isLoading) || (props.leftIcon && props.rightIcon)"
          :icon="props.rightIcon"
          data-test="right-icon"
      />
      <span v-if="props.isLoading && props.rightIcon && !props.leftIcon" class="loading"/>
    </button>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  autoFocus: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  leftIcon: {
    type: String,
    default: ''
  },
  rightIcon: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
})

onMounted(() => {
  if (props.autoFocus) {
    if (inputFieldRef.value) {
      inputFieldRef.value.focus()
    }
  }
})

const inputFieldRef = ref(null)

const emit = defineEmits(['update:modelValue', 'blur'])

function handleInput(event) {
  const trimmed = event.target.value.trim()
  if (trimmed !== '') {
    emit('update:modelValue', event.target.value)
  }
}

function handleBlur(event) {
  emit('blur', event)
}

</script>

<template>
    <div class="fieldset">
    <legend class="fieldset-legend text-sm font-semibold mb-1">
      {{ label }}
    </legend>

    <div class="input-container">
      <FontAwesomeIcon
        v-if="leftIcon"
        :icon='leftIcon'
        class="input-container__leftIcon"
      />
      <input
        ref="inputFieldRef"
        type="text"
        class="input input-bordered w-full rounded-full"
        :class="{
          'input-container__input--left': leftIcon,
          'input-container__input--right': rightIcon,
        }"
        :placeholder="placeholder"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
      >
      <FontAwesomeIcon
        v-if="rightIcon"
        :icon='rightIcon'
        class="input-container__rightIcon"
      />
    </div>

    <p class="text-xs text-gray-500 mt-1">
      {{ note }}
    </p>
</div>
</template>

<style lang="scss" scoped>
.input-container {
  position: relative;

  &__leftIcon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 10;
    color: #888;
  }

  &__input--left {
    padding-left: 2.5rem; 
  }
  &__input--right {
    padding-right: 2.5rem; 
  }

  &__rightIcon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 10;
    color: #888;
  }
}
</style>
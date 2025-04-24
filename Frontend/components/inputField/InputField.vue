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

    <input
      ref="inputFieldRef"
      type="text"
      class="input input-bordered w-full rounded-full"
      :placeholder="placeholder"
      :value="modelValue"
      @input="handleInput"
      @blur="handleBlur"
    />

    <p class="text-xs text-gray-500 mt-1">
      {{ note }}
    </p>
</div>
</template>
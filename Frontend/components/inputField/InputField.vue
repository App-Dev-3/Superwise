<script setup>
import {defineEmits } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  modelValue: String
})

const emit = defineEmits(['field-value'])

function handleBlur(event) {
  emit('field-value', event.target.value)
}

</script>

<template>
    <div class="fieldset">
    <legend class="fieldset-legend text-sm font-semibold mb-1">
      {{ label }}
    </legend>

    <input
      type="text"
      class="input input-bordered w-full rounded-full"
      :placeholder="label"
      :value="modelValue"
      @blur="handleBlur"
    />

    <p class="text-xs text-gray-500 mt-1">
      {{ note }}
    </p>
</div>
</template>
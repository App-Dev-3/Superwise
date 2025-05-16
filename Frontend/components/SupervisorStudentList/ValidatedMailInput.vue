<script lang="ts" setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

interface ValidatedMailInput {
  errorMessage: string;
  placeholder: string;
  modelValue: string;
  domain: string;
}

const props = withDefaults(defineProps<ValidatedMailInput>(), {});

const emit = defineEmits(['update:modelValue', 'blur']);

function handleInput(event) {
  const trimmed = event.target.value.trim();
  if (trimmed !== '') {
    event.target.value = trimmed.replace(/[^a-zA-Z0-9._%+-]/g, '');
  }
  emit('update:modelValue', event.target.value);
}

function handleBlur(event) {
  emit('blur', event);
}
</script>

<template>
  <div class="w-full">
    <label class="input validator w-full">
      <FontAwesomeIcon
          class="opacity-50"
          icon="envelope"
      />
      <input
          :placeholder="props.placeholder"
          :value="props.modelValue"
          class="w-full"
          type="text"
          @blur="handleBlur"
          @input="handleInput"
      >
      <span class="text-body opacity-75 pr-4">
        @{{ props.domain }}
      </span>
    </label>
  </div>
</template>

<style scoped>
</style>

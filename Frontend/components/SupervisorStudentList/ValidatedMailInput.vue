<script lang="ts" setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

interface ValidatedMailInput {
  placeholder: string;
  modelValue: string;
  domain: string;
}

const props = withDefaults(defineProps<ValidatedMailInput>(), {});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
}>();

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  const trimmed = target.value.trim();
  if (trimmed !== '') {
    target.value = trimmed.replace(/[^a-zA-Z0-9._%+-]/g, '');
  }
  emit('update:modelValue', target.value);
}

function handleBlur(event: FocusEvent): void {
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

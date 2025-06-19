<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref, watchEffect } from 'vue';

interface ValidatedMailInput {
  placeholder: string;
  domain: string;
  clearInput: boolean;
}

const props = withDefaults(defineProps<ValidatedMailInput>(), {});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'update:inputCleared'): void
}>();

const value = ref<string>('');

watchEffect(() => {
  if (props.clearInput) {
    value.value = '';
    console.log('input cleared');
    emit('update:inputCleared')
  }
})


function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  const trimmed = target.value.trim();
  if (trimmed !== '') {
    value.value = trimmed.replace(/[^a-zA-Z0-9._%-]/g, '');
  }
  emit('update:modelValue', value.value?.concat('@').concat(props.domain));
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
          v-model="value"
          :placeholder="props.placeholder"
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

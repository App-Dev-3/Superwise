<script lang="ts" setup>
interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  placeholder?: string;
  options?: Option[];
  modelValue?: string | number;
}

const props = withDefaults(defineProps<CustomSelectProps>(), {
  placeholder: '',
  options: () => [],
  modelValue: ''
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const handleSelect = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  emit('update:modelValue', value);
};
</script>

<template>
  <select :value="props.modelValue" class="select" @change="handleSelect">
    <option v-if="placeholder !== ''" disabled selected value="">{{ props.placeholder }}</option>
    <option v-for="option in props.options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

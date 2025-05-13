<script lang="ts" setup>
interface Option {
  key: string | number;
  value: string;
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
  const rawValue = (event.target as HTMLSelectElement).value;
  const option = props.options?.find(opt => String(opt.key) === rawValue);
  const value = option && typeof option.key === 'number' ? Number(rawValue) : rawValue;
  emit('update:modelValue', value);
};
</script>

<template>
  <select class="select" @change="handleSelect">
    <option v-if="placeholder !== ''" disabled selected value="">{{ props.placeholder }}</option>
    <option
        v-for="option in props.options" :key="option.key" :selected="props.modelValue === option.key"
        :value="option.key">
      {{ option.value }}
    </option>
  </select>
</template>

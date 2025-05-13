<script lang="ts" setup>
interface Option {
  key: string | number;
  value: string;
}

interface CustomSelectProps {
  placeholder?: string;
  options?: Option[]
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  modelValue?: string | number;
}

const props = withDefaults(defineProps<CustomSelectProps>(), {
  placeholder: '',
  options: () => [],
  size: 'md',
  modelValue: ''
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const selectSize = computed(() => {
  return {
    'xs': 'select-xs',
    'sm': 'select-sm',
    'md': 'select-md',
    'lg': 'select-lg',
    'xl': 'select-xl'
  }[props.size];
})
const handleSelect = (event: Event) => {
  const rawValue = (event.target as HTMLSelectElement).value;
  const option = props.options?.find(opt => String(opt.key) === rawValue);
  const value = option && typeof option.key === 'number' ? Number(rawValue) : rawValue;
  emit('update:modelValue', value);
};
</script>

<template>
  <select
      :class="selectSize"
      :title="props?.placeholder?.toString()||props.modelValue?.toString() || ''"
      class="select w-fit"
      @change="handleSelect"
  >
    <option v-if="props.placeholder !== ''" :selected="props.modelValue === ''" disabled title="placeholder" value="">
      {{ props.placeholder }}
    </option>
    <option
        v-for="option in props.options" :key="option.key" :selected="props.modelValue === option.key"
        :title="option.value"
        :value="option.key"
    >
      {{ option.value }}
    </option>
  </select>
</template>

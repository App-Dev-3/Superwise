<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, ref } from "vue";

interface Option {
  key: string | number;
  value: string;
}

interface CustomSelectProps {
  placeholder?: string;
  options?: Option[];
  modelValue?: string | number;
  id?: string; // Allow custom ID to be passed
}

const props = withDefaults(defineProps<CustomSelectProps>(), {
  placeholder: '',
  options: () => [],
  modelValue: '',
  id: ''
});

const emit = defineEmits<{
  'update:modelValue': [ value: string | number ];
}>();

// Generate a unique ID for this dropdown instance
const uniqueId = ref(props.id || `dropdown-${ Math.random().toString(36).substring(2, 9) }`);

const handleSelect = (selectedValue: string | number) => {
  const option = props.options?.find(opt => String(opt.key) === selectedValue);
  const value = option && typeof option.key === 'number' ? Number(selectedValue) : selectedValue;
  emit('update:modelValue', value);
};

const getPlaceholder = computed(() => {
  return props.options.find((val) => val.key === props.modelValue)?.value || props.placeholder
});

</script>

<template>
  <!-- Each dropdown now has a unique identifier -->
  <div :data-dropdown-id="uniqueId" class="dropdown dropdown-end">
    <div
        class="btn min-w-fit text-nowrap !py-0 px-2 max-h-fit !bg-base-100 border-base-content m-0" role="button"
        tabindex="0">
      {{ getPlaceholder }}
      <FontAwesomeIcon
          icon="caret-down"
      />
    </div>
    <ul class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm" tabindex="0">
      <li v-for="option in props.options" :key="option.key" @click="handleSelect(option.key)">
        <a> {{ props.modelValue === option.key ? '✅' : '' }} {{ option.value }}</a>
      </li>
    </ul>
  </div>
</template>

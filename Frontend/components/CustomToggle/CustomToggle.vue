<script lang="ts" setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {computed} from 'vue';

interface CustomToggleProps {
  modelValue?: boolean;
  offIcon?: string;
  onIcon?: string;
}

const props = withDefaults(defineProps<CustomToggleProps>(), {
  modelValue: false,
  offIcon: "",
  onIcon: "",
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();

const hasIcons = computed(() => {
  return props.offIcon && props.onIcon;
});

const toggle = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>

<template>

  <input
      v-if="!hasIcons"
      :checked="modelValue"
      class="toggle"
      type="checkbox"
      @change="toggle"
  >

  <label v-else class="toggle text-base-content">
    <input
        :checked="modelValue"
        type="checkbox"
        @change="toggle"
    >
    <FontAwesomeIcon
        v-if="onIcon"
        :icon="onIcon"
        aria-label="enabled"
        class="opacity-75 !h-3"
    />
    <FontAwesomeIcon
        v-if="offIcon"
        :icon="offIcon"
        aria-label="disabled"
        class="opacity-75 !h-3"
    />
  </label>

</template>

<style scoped>

</style>
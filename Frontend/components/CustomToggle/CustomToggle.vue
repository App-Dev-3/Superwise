<script lang="ts" setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {computed} from 'vue';

interface CustomToggleProps {
  checked?: boolean;
  offIcon?: string;
  onIcon?: string;
}

const props = withDefaults(defineProps<CustomToggleProps>(), {
  checked: false,
  offIcon: "",
  onIcon: "",
});

const emit = defineEmits<{
  (event: 'update:checked', value: boolean): void;
}>();

const hasIcons = computed(() => {
  return props.offIcon && props.onIcon;
});

const toggle = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:checked', target.checked);
};
</script>

<template>

  <input
      v-show="!hasIcons"
      :checked="checked"
      class="toggle"
      type="checkbox"
      @change="toggle"
  >

  <label v-show="hasIcons" class="toggle text-base-content">
    <input
        :checked="checked"
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
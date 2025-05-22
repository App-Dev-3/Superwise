<script lang="ts" setup>
import {computed, ref, watch} from "vue";

interface TextAreaProps {
  modelValue: string;
  rows?: number;
  color?: "default" | "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  labelTop?: string;
  labelBottom?: string;
  maxlength?: number;
  placeholder?: string;
}

const props = withDefaults(defineProps<TextAreaProps>(), {
  color: "default",
  size: "md",
  labelTop: "",
  labelBottom: "",
  maxlength: 1000,
  rows: 3,
  placeholder: "",
});

const emit = defineEmits(['update:modelValue']);

const tArea = ref<HTMLTextAreaElement | null>(null);
const localValue = ref(props.modelValue);

// Keep local value in sync with prop changes
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
});

const showBottomArea = computed(() => {
  return props.labelBottom?.length > 0 || props.maxlength > 0;
});

const currentLength = computed(() => localValue.value.length);

const updateValue = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  localValue.value = target.value;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <fieldset class="fieldset">
    <legend v-if="props.labelTop?.length > 0" class="fieldset-legend opacity-50">{{ props.labelTop }}</legend>
    <textarea
      ref="tArea"
      :maxlength="props.maxlength"
      :placeholder="props.placeholder"
      :rows="props.rows"
      :value="localValue"
      class="textarea h-24 w-full rounded-2xl opacity-75"
      @input="updateValue"
    />
    <div v-if="showBottomArea" class="flex gap-2 justify-end items-center w-full flex-row opacity-50">
      <div v-if="props.labelBottom?.length > 0" class="label text-xs w-full">{{ props.labelBottom }}</div>

      <div v-if="props.maxlength>0" class="self-end text-xs">{{ currentLength }}/{{ props.maxlength }}</div>
    </div>
  </fieldset>
</template>

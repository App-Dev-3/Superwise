<script lang="ts" setup>
import {useRouter} from "vue-router";
import {computed} from "vue";

const router = useRouter();

interface Props {
  variant?: "default" | "upload" | "download" | "delete";
  headerText: string;
  rightButton?: string;
  rightIcon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  rightButton: "",
  rightIcon: "",
});


const headerBG = computed(() => ({
  'bg-base-100': props.variant === 'default',
  'bg-info': props.variant === 'upload',
  'bg-success': props.variant === 'download',
  'bg-error': props.variant === 'delete',
}));

const colorText = computed(() => ({
  'text-base-content': props.variant === 'default',
  'text-info-content': props.variant === 'upload',
  'text-success-content': props.variant === 'download',
  'text-error-content': props.variant === 'delete',
}));

const goBack = () => {
  router.back();
};

const emit = defineEmits(['right-button-click']);
</script>

<template>

  <div
    :class="headerBG"
    class="w-full flex items-center p-4 gap-4 shadow z-10 "
  >
    <CustomButton
      :class="colorText"
      color="default"
      left-icon="fa-solid fa-arrow-left"
      text=""
      variant="ghost"
      @click="goBack()"
    />
    <span
      :class="colorText"
      class="text-header bg-info-soft w-full">{{ props.headerText }}</span>
    <CustomButton
      v-if="props.rightButton && props.rightIcon"
      :class="colorText"
      :right-icon="props.rightIcon"
      :text="props.rightButton"
      class="opacity-75"
      clickable
      color="default"
      size="xs"
      variant="ghost"
      @click="emit('right-button-click')"
    />
  </div>
</template>

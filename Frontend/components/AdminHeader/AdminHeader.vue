<script lang="ts" setup>
import {useRouter} from "vue-router";
import {computed} from "vue";

const router = useRouter();

interface Props {
  variant?: "default" | "upload" | "download" | "delete";
  headerText: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
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
</script>

<template>

  <div
      :class="headerBG"
      class="w-full flex items-center p-4 gap-4 shadow z-10"
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
        class="text-head bg-info-soft">{{ props.headerText }}</span>
  </div>
</template>

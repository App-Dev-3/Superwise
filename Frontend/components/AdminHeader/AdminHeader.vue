<script lang="ts" setup>
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useColorMode } from "#imports";

const router = useRouter();
const colorMode = useColorMode();

const { t } = useI18n();

interface Props {
  variant?: "default" | "upload" | "download" | "delete" | "text" | "warning";
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
  'bg-base-100': props.variant === 'default' || props.variant === 'text',
  'bg-info': props.variant === 'upload',
  'bg-success': props.variant === 'download',
  'bg-error': props.variant === 'delete',
  'bg-warning': props.variant === 'warning',
}));

const colorText = computed(() => ({
  'text-base-content': props.variant === 'default' || props.variant === 'text',
  'text-info-content': props.variant === 'upload',
  'text-success-content': props.variant === 'download',
  'text-error-content': props.variant === 'delete',
  'text-warning-content': props.variant === 'warning',
}));

const goBack = () => {
  router.back();
};

const emit = defineEmits([ 'right-button-click' ]);
</script>

<template>

  <div
      :class="headerBG"
      class="w-full flex items-center p-4 gap-4 z-10 border-b border-b-base-300"
  >
    <CustomButton
        v-if="props.variant !== 'text'"
        :class="colorText"
        color="default"
        left-icon="fa-solid fa-arrow-left"
        text=""
        variant="ghost"
        @click="goBack()"
    />

    <ClientOnly v-else>
      <div aria-hidden="true" class="navbar-center">
        <img
            :src="
              colorMode.value === 'dark'
                ? '../images/logo_dark.svg'
                : '../images/logo_light.svg'
            "
            alt="Logo image"
            class="h-8"
        >
      </div>
    </ClientOnly>

    <!--For some reason the aria-label is not read out... so i have disabled it for now!-->
    <span
        :aria-label="t('aria.pageHeader', {pageName: props.headerText})"
        :class="{colorText}"
        aria-hidden="true"
        class="text-header bg-info-soft w-full"
    >
      {{ props.headerText }}
    </span>

    <CustomButton
        v-if="props.rightButton && props.rightIcon"
        :class="colorText"
        :right-icon="props.rightIcon"
        :text="props.rightButton"
        class="opacity-75"
        color="default"
        size="xs"
        variant="ghost"
        @click="emit('right-button-click')"
    />
  </div>
</template>

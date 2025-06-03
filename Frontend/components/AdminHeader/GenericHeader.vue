<script lang="ts" setup>
import { useColorMode } from "#imports";

const colorMode = useColorMode();

interface GenericHeaderProps {
  showBack?: boolean;
  showForward?: boolean;
  text?: string;
  showLogo?: boolean;
}

const props = defineProps<GenericHeaderProps>();

const emit = defineEmits<{ (e: 'back' | 'forward'): void }>();

const backClick = () => {
  emit('back');
};

const forwardClick = () => {
  emit('forward');
};
</script>

<template>
  <div
      class="w-full p-4 gap-4 bg-base-100 border-b border-b-neutral-content z-1 flex flex-row justify-between items-center">
    <div class="flex w-fit min-w-12">
      <CustomButton
          v-if="props.showBack"
          color="default"
          left-icon="fa-arrow-left"
          text=""
          variant="ghost"
          @click="backClick"
      />
    </div>
    <span v-if="props.text" class="text-header w-full text-center">
      {{ props.text }}
    </span>
    <ClientOnly>
      <div
          v-if="props.showLogo"
          class="w-full text-center">

        <img
            :src="
              colorMode.value === 'dark'
                ? '../images/appHeader_logo_dark.svg'
                : '../images/appHeader_logo_light.svg'
            "
            alt="Logo image"
            class="h-6 self-center"
        >
      </div>
    </ClientOnly>
    <div class="flex w-fit min-w-12">
      <CustomButton
          v-if="props.showForward"
          color="default"
          left-icon="fa-arrow-right"
          text=""
          variant="ghost"
          @click="forwardClick"
      />
    </div>
  </div>
</template>

<style scoped>

</style>

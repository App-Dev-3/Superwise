<script lang="ts" setup>
import { useColorMode } from '#imports';

const colorMode = useColorMode();

interface EmptyPagePlaceholderProps {
  text: string
}

const props = defineProps<EmptyPagePlaceholderProps>();

</script>

<template>
  <div class="flex flex-col w-full h-fit opacity-50 items-center p-6">
    <ClientOnly>
      <div class="navbar-center">
        <img
            :src="
              colorMode.value === 'dark'
                ? '../images/logo_dark.svg'
                : '../images/logo_light.svg'
            "
            alt="Logo image"
            class="w-full"
        >
      </div>
    </ClientOnly>
    <p class="text-body">
      {{ props.text }}
    </p>
  </div>
</template>

<style scoped>

</style>
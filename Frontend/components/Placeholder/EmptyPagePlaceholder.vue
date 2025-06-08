<script lang="ts" setup>
import { useColorMode } from '#imports';

const colorMode = useColorMode();

interface EmptyPagePlaceholderProps {
  text: string
  renderCondition?: Array<unknown>
}

const props = withDefaults(defineProps<EmptyPagePlaceholderProps>(), {
  renderCondition: () => []
});

</script>

<template>
  <div
      v-if="!renderCondition || renderCondition.length === 0"
      class="size-full flex flex-col justify-center items-center opacity-50 p-6">
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
<template>
  <div class="w-full h-screen flex max-w-xl m-auto flex-col p-8 justify-center items-center">
    <ClientOnly>
      <img
          :src="
          colorMode.value === 'dark'
            ? '../images/appHeader_logo_dark.svg'
            : '../images/appHeader_logo_light.svg'
        "
          alt="Logo image"
          class="w-full max-w-xs"
      >
    </ClientOnly>
    <span class="text-large flex flex-row items-center gap-1">
      {{ props.text }}
      <span class="loading loading-dots loading-xs translate-y-1"/>
    </span>
  </div>
</template>

<script setup>
const colorMode = useColorMode();

const props = defineProps({
  text: {
    type: String,
    default: 'Loading...',
  },
});
</script>
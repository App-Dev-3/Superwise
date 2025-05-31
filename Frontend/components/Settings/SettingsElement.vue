<script lang="ts" setup>
interface SettingsElementProps {
  title: string;
  description: string;
}

const props = withDefaults(defineProps<SettingsElementProps>(), {});
</script>

<template>
  <div class="w-full flex flex-row gap-4 items-center">
    <div class="flex flex-col w-full">
      <span class="text-body">{{ props.title }}</span>
      <span class="text-x-small opacity-50">{{ props.description }}</span>
    </div>

    <slot />
  </div>
</template>

<style scoped></style>

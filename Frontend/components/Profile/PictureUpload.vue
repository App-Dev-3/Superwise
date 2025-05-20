<script lang="ts" setup>
interface PictureUploadProps {
  avatar: {
    imgSrc: string;
    firstName: string;
    lastName: string;
    emoji?: string;
    ringColor?: "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error";
  },
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const props = defineProps<PictureUploadProps>();

</script>

<template>
  <div class="flex flex-col gap-4 items-center justify-center">
    <Avatar
      :emoji="props.avatar.emoji"
      :first-name="props.avatar.firstName"
      :last-name="props.avatar.lastName"
      :ring-color="props.avatar.ringColor"
      :size="props.size"
      :src="props.avatar.imgSrc"
      add-button
      alt="Profile Picture of {{ props.firstName }} {{ props.lastName }}"
      shape="circle"
    />
  </div>
</template>

<style scoped>

</style>
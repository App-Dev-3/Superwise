<script lang="ts" setup>
import {computed, onMounted, ref, watchEffect} from 'vue';

/**
 * Avatar component displays a user's profile image with various customization options.
 * It falls back to a placeholder image generated from the user's name when no source image
 * is available or when the image fails to load.
 *
 * Note: The `online` status is sketchy if used incorrectly.
 * Always test its behavior thoroughly when using it to ensure
 * it reflects the desired state accurately.
 * ALSO NOTE: Online status only works with the `circle` shape.
 *
 *
 */
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "squircle" | "rounded" | "circle";
  online?: boolean;
  ring?: boolean;
  ringColor?: "primary" | "error";
  firstName: string;
  lastName: string;
}

const props = withDefaults(defineProps<AvatarProps>(), {
  src: '',
  alt: 'Avatar',
  size: 'md',
  shape: 'squircle',
  online: false,
  ring: false,
  ringColor: 'primary',
});

// Track image loading errors
const imgError = ref(false);
// Use this to force the image to reload
const imgKey = ref(Date.now());

// Reset error state when src changes
watchEffect(() => {
  if (props.src) {
    imgError.value = false;
    imgKey.value = Date.now(); // Force reload of image
  }
});

// Check if image exists on mount
onMounted(() => {
  if (props.src) {
    checkImageExists(props.src);
  }
});

// Function to check if image exists
function checkImageExists(url: string) {
  if (!url) {
    imgError.value = true;
    return;
  }

  const img = new Image();
  img.onload = () => {
    imgError.value = false;
  };
  img.onerror = () => {
    imgError.value = true;
  };
  img.src = url;
}

const imgSize = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-8 h-8';
    case 'sm':
      return 'w-12 h-12';
    case 'lg':
      return 'w-20 h-20';
    case 'xl':
      return 'w-24 h-24';
    case 'md':
    default:
      return 'w-16 h-16';
  }
});

const onlineStatus = computed(() => {
  // Only apply online status for circle shape
  if (props.shape !== 'circle') {
    return '';
  }
  return props.online ? 'avatar-online' : '';
});

const shapeClass = computed(() => {
  switch (props.shape) {
    case 'squircle':
      return 'mask mask-squircle';
    case 'rounded':
      return 'rounded-xl';
    case 'circle':
      return 'rounded-full';
    default:
      return '';
  }
});

const ringClass = computed(() => {
  if (!props.ring) return '';
  const ringColor = props.ringColor || 'primary';
  return `ring-${ringColor} ring-offset-base-100 ring-2 ring-offset-2`;
});

// Handle image loading errors
const handleImageError = () => {
  console.log(`Image Error: ${props.src}`);
  imgError.value = true;
};

</script>

<template>
  <div :class="onlineStatus" class="avatar">
    <div :class="[imgSize, shapeClass, ringClass]">
      <img
          :key="imgKey"
          :alt="props.alt"
          :src="(props.src && !imgError)
              ? props.src
              : getPlaceholderImage(props.firstName, props.lastName)"
          class="object-cover w-full h-full"
          loading="lazy"
          @error="handleImageError"
      >
    </div>
  </div>
</template>

<style scoped>

</style>
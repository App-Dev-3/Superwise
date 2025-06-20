<script lang="ts" setup>
import { computed, onMounted, ref, watchEffect } from 'vue';

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
  ringColor?: "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error" | '';
  firstName: string;
  lastName: string;
  emoji?: string;
  addButton?: boolean;
}

const props = withDefaults(defineProps<AvatarProps>(), {
  src: '',
  alt: 'Avatar',
  size: 'md',
  shape: 'squircle',
  online: false,
  emoji: '',
  addButton: false,
  ringColor: '',
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
  switch (props.ringColor) {
    case 'primary':
      return 'ring-primary ring-offset-base-100 ring-2 ring-offset-2';
    case 'error':
      return 'ring-error ring-offset-base-100 ring-2 ring-offset-2';
    case "secondary":
      return 'ring-secondary ring-offset-base-100 ring-2 ring-offset-2';
    case 'success':
      return 'ring-success ring-offset-base-100 ring-2 ring-offset-2';
    case 'warning':
      return 'ring-warning ring-offset-base-100 ring-2 ring-offset-2';
    case 'info':
      return 'ring-info ring-offset-base-100 ring-2 ring-offset-2';
    case 'accent':
      return 'ring-accent ring-offset-base-100 ring-2 ring-offset-2';
    case 'neutral':
      return 'ring-neutral ring-offset-base-100 ring-2 ring-offset-2';
    default:
      return '';
  }
});

const emojiStyle = computed(() => {
  switch (props.ringColor) {
    case 'primary':
      return 'btn-primary';
    case 'error':
      return 'btn-primary';
    case "secondary":
      return 'btn-primary';
    case 'success':
      return 'btn-primary';
    case 'warning':
      return 'btn-primary';
    case 'info':
      return 'btn-primary';
    case 'accent':
      return 'btn-primary';
    case 'neutral':
      return 'btn-primary';
    default:
      return '';
  }
});

const buttonStyle = computed(() => {
  switch (props.ringColor) {
    case 'primary':
      return 'btn-primary';
    case 'error':
      return 'btn-error';
    case "secondary":
      return 'btn-secondary';
    case 'success':
      return 'btn-success';
    case 'warning':
      return 'btn-warning';
    case 'info':
      return 'btn-info';
    case 'accent':
      return 'btn-accent';
    case 'neutral':
      return 'btn-neutral';
    default:
      return '';
  }
});

const emojiPosition = computed(() => {
  switch (props.size) {
    case 'xs':
      return '-left-[.5px] -bottom-[.5px] size-2 text-[6px]';
    case 'sm':
      return '-left-1 -bottom-1 size-4 text-[8px]';
    case 'lg':
      return '-left-1 -bottom-1 size-7 text-sm';
    case 'xl':
      return '-left-1 -bottom-1 size-8 text-base';
    case 'md':
    default:
      return '-left-1 -bottom-1 size-6 text-xs';
  }
});

const addPosition = computed(() => {
  switch (props.size) {
    case 'xs':
      return '-right-[.5px] -bottom-[.5px] size-2 text-[8px]';
    case 'sm':
      return '-right-1 -bottom-1 size-4 text-sm';
    case 'lg':
      return '-right-1 -bottom-1 size-7 text-lg';
    case 'xl':
      return '-right-1 -bottom-1 size-8 text-xl';
    case 'md':
    default:
      return '-right-1 -bottom-1 size-6 text-base';
  }
});

// Handle image loading errors
const handleImageError = () => {
  console.log(`Image Error: ${ props.src }`);
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
    <button
        v-if="props.emoji"
        :class="[emojiPosition, emojiStyle]"
        class="btn btn-soft absolute rounded-full ring-base-100 ring-offset-base-100 ring-1 ring-offset-1 flex items-center justify-center aspect-square p-0"
    >
      {{ props.emoji }}
    </button>

    <button
        v-if="props.addButton"
        :class="[addPosition, buttonStyle]"
        class="btn absolute rounded-full ring-base-100 ring-offset-base-100 ring-1 ring-offset-1 flex items-center justify-center aspect-square p-0"
    >+
    </button>

  </div>
</template>

<style scoped>

</style>
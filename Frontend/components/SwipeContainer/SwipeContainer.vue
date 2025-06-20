<script setup lang="ts">
import { usePointerSwipe } from "@vueuse/core";
import { computed, shallowRef, ref } from "vue";
import { faCheck, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

interface Props {
  swipeThreshold?: number;
  swipeLeftText?: string;
  swipeRightText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  swipeThreshold: 40,
  swipeLeftText: "Request",
  swipeRightText: "Reject",
});

const emit = defineEmits(["swipeRight", "swipeLeft"]);

defineExpose({
  reset,
});

const target = shallowRef<HTMLElement | null>(null);
const container = shallowRef<HTMLElement | null>(null);

const containerWidth = computed(() => container.value?.offsetWidth || 0);

const left = shallowRef("0");
const opacity = shallowRef(1);

const cardIsAtStartPosition = ref(false);

function reset() {
  left.value = "0";
  opacity.value = 1;
  cardIsAtStartPosition.value = true;
}

const { distanceX, isSwiping } = usePointerSwipe(target, {
  disableTextSelect: true,
  threshold: props.swipeThreshold,
  onSwipe() {
    cardIsAtStartPosition.value = false;
    if (containerWidth.value) {
      if (distanceX.value < 0) {
        // Swipe right direction (negative distanceX)
        const distance = Math.abs(distanceX.value);
        left.value = `${distance}px`;
        opacity.value = 1.25 - distance / containerWidth.value;
      } else if (distanceX.value > 0) {
        // Swipe left direction (positive distanceX)
        const distance = distanceX.value;
        left.value = `-${distance}px`;
        opacity.value = 1.25 - distance / containerWidth.value;
      } else {
        left.value = "0";
        opacity.value = 1;
      }
    }
  },
  onSwipeEnd() {
    if (containerWidth.value) {
      // Calculate the ratio relative to container width
      const ratio = Math.abs(distanceX.value) / containerWidth.value;

      if (distanceX.value < 0 && ratio >= 0.5) {
        // Swipe right direction threshold reached
        left.value = "100%";
        opacity.value = 0;
        emit("swipeRight");
      } else if (distanceX.value > 0 && ratio >= 0.5) {
        // Swipe left direction threshold reached
        left.value = "-100%";
        opacity.value = 0;
        emit("swipeLeft");
      } else {
        // Reset if threshold not reached
        cardIsAtStartPosition.value = true;
        left.value = "0";
        opacity.value = 1;
      }
    }
  },
});

const backgroundColorClasses = computed(() => ({
  "bg-base-100": cardIsAtStartPosition.value,
  "bg-success": distanceX.value < -props.swipeThreshold / 10,
  "bg-error": distanceX.value > props.swipeThreshold / 10,
}));

const swipeIcon = computed(() => {
  if (!isSwiping.value) return null;

  if (distanceX.value < -props.swipeThreshold / 10) return faCheck;
  if (distanceX.value > props.swipeThreshold / 10) return faBan;
  return null;
});

const textPositionClass = computed(() => {
  if (distanceX.value < -props.swipeThreshold / 10) return "left-4";
  if (distanceX.value > props.swipeThreshold / 10) return "right-4";
  return "";
});
</script>

<template>
  <div class="inline-flex">
    <div
      ref="container"
      class="rounded-3xl relative inline-block overflow-hidden shadow-lg"
      :class="backgroundColorClasses"
    >
      <div
        ref="target"
        class="relative w-full flex items-center justify-center z-10"
        :class="{ 'transition-all duration-200 ease-linear': !isSwiping }"
        :style="{ left, opacity }"
      >
        <slot />
      </div>
      <!-- Overlay text for swipe direction -->
      <div
        v-if="swipeIcon"
        class="absolute top-1/2 transform -translate-y-1/2 pointer-events-none"
        :class="textPositionClass"
      >
        <FontAwesomeIcon :icon="swipeIcon" class="text-3xl text-white" />
      </div>
    </div>
  </div>
</template>

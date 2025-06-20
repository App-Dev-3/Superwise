<script lang="ts" setup>
import { usePointerSwipe } from '@vueuse/core';
import { computed, ref, shallowRef } from 'vue';

interface Props {
  swipeThreshold?: number;
  ariaLabel?: string;
  name?: string;
}

const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
  swipeThreshold: 40,
  ariaLabel: 'Unnamed Swipe Container',
  name: 'Supervisor',
});

const emit = defineEmits([ 'swipeRight', 'swipeLeft' ]);

defineExpose({
  reset,
});

const target = shallowRef<HTMLElement | null>(null);
const container = shallowRef<HTMLElement | null>(null);

const containerWidth = computed(() => container.value?.offsetWidth || 0)

const left = shallowRef('0');
const opacity = shallowRef(1);

const cardIsAtStartPosition = ref(false);

function reset() {
  left.value = '0';
  opacity.value = 1;
  cardIsAtStartPosition.value = true;
}

const { distanceX, isSwiping } = usePointerSwipe(target, {
  disableTextSelect: true,
  threshold: props.swipeThreshold,
  onSwipe() {
    cardIsAtStartPosition.value = false
    if (containerWidth.value) {
      if (distanceX.value < 0) {
        // Swipe right direction (negative distanceX)
        const distance = Math.abs(distanceX.value)
        left.value = `${ distance }px`
        opacity.value = 1.25 - distance / containerWidth.value
      } else if (distanceX.value > 0) {
        // Swipe left direction (positive distanceX)
        const distance = distanceX.value
        left.value = `-${ distance }px`
        opacity.value = 1.25 - distance / containerWidth.value
      } else {
        left.value = '0'
        opacity.value = 1
      }
    }
  },
  onSwipeEnd() {
    if (containerWidth.value) {
      // Calculate the ratio relative to container width
      const ratio = Math.abs(distanceX.value) / containerWidth.value

      if (distanceX.value < 0 && ratio >= 0.5) {
        // Swipe right direction threshold reached
        left.value = '100%'
        opacity.value = 0
        emit('swipeRight')
      } else if (distanceX.value > 0 && ratio >= 0.5) {
        // Swipe left direction threshold reached
        left.value = '-100%'
        opacity.value = 0
        emit('swipeLeft')
      } else {
        // Reset if threshold not reached
        cardIsAtStartPosition.value = true
        left.value = '0'
        opacity.value = 1
      }
    }
  },
})

const backgroundColorClasses = computed(() => {
  return {
    'bg-base-100': cardIsAtStartPosition.value,
    'bg-success': distanceX.value < -props.swipeThreshold / 10,
    'bg-error': distanceX.value > props.swipeThreshold / 10,
  }
});

</script>

<template>
  <div :aria-label="props.ariaLabel" class="inline-flex">
    <div
        ref="container"
        :class="backgroundColorClasses"
        class="rounded-3xl relative inline-block overflow-hidden shadow-lg"
    >
      <div
          ref="target"
          :class="{
					'transition-all duration-200 ease-linear':
						!isSwiping,
				}"
          :style="{ left, opacity }"
          class="relative w-full flex items-center justify-center"
      >
        <slot/>
      </div>
      <!-- Screen reader only action buttons -->

      <button
          :aria-label="
					t('matching.aria.matchWith', {
						name: props.name,
					}) + '.' +props.ariaLabel
				"
          class="sr-only sr-only-focusable"
          type="button"
          @click="emit('swipeRight')"
      />
      <button
          :aria-label="
					t('matching.aria.reject', {
						name: props.name,
					})
				"
          class="sr-only sr-only-focusable"
          type="button"
          @click="emit('swipeLeft')"
      />
    </div>
  </div>
</template>

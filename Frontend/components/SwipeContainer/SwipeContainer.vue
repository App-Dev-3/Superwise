<script setup lang="ts">
import { usePointerSwipe } from '@vueuse/core'
import { computed, shallowRef } from 'vue'

const emit = defineEmits(['swipeRight', 'swipeLeft'])

defineExpose({
    reset,
})

const target = shallowRef<HTMLElement | null>(null)
const container = shallowRef<HTMLElement | null>(null)

const containerWidth = computed(() => container.value?.offsetWidth || 0)

const left = shallowRef('0')
const opacity = shallowRef(1)


const swipeThreshold = ref(30) // Minimum distance to trigger a swipe
const cardIsAtStartPosition = ref(false)

function reset() {
    left.value = '0'
    opacity.value = 1
    cardIsAtStartPosition.value = true
}

const { distanceX, isSwiping } = usePointerSwipe(target, {
    disableTextSelect: true,
    threshold: swipeThreshold.value,
    onSwipe() {
        cardIsAtStartPosition.value = false
        if (containerWidth.value) {
            if (distanceX.value < 0) {
                // Swipe right direction (negative distanceX)
                const distance = Math.abs(distanceX.value)
                left.value = `${distance}px`
                opacity.value = 1.25 - distance / containerWidth.value
            }
            else if (distanceX.value > 0) {
                // Swipe left direction (positive distanceX)
                const distance = distanceX.value
                left.value = `-${distance}px`
                opacity.value = 1.25 - distance / containerWidth.value
            }
            else {
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
            }
            else if (distanceX.value > 0 && ratio >= 0.5) {
                // Swipe left direction threshold reached
                left.value = '-100%'
                opacity.value = 0
                emit('swipeLeft')
            }
            else {
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
        'bg-success': distanceX.value < -swipeThreshold.value/10,
        'bg-error':  distanceX.value > swipeThreshold.value/10,
    }
})

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
                class="relative w-full flex items-center justify-center"
                :class="{ 'transition-all duration-200 ease-linear': !isSwiping }"
                :style="{ left, opacity }"
            >
                <slot />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import type { UseSwipeDirection } from '@vueuse/core'
import { usePointerSwipe } from '@vueuse/core'
import { computed, shallowRef } from 'vue'

const target = shallowRef<HTMLElement | null>(null)
const container = shallowRef<HTMLElement | null>(null)

const containerWidth = computed(() => container.value?.offsetWidth)

const left = shallowRef('0')
const opacity = shallowRef(1)

function reset() {
    left.value = '0'
    opacity.value = 1
}

const { distanceX, isSwiping } = usePointerSwipe(target, {
    disableTextSelect: true,
    onSwipe(e: PointerEvent) {
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
    onSwipeEnd(e: PointerEvent, direction: UseSwipeDirection) {
        if (containerWidth.value) {
            if (distanceX.value < 0 && (Math.abs(distanceX.value) / containerWidth.value) >= 0.5) {
                // Swipe right direction threshold reached
                left.value = '100%'
                opacity.value = 0
            }
            else if (distanceX.value > 0 && (distanceX.value / containerWidth.value) >= 0.5) {
                // Swipe left direction threshold reached
                left.value = '-100%'
                opacity.value = 0
            }
            else {
                // Reset if threshold not reached
                left.value = '0'
                opacity.value = 1
            }
        }
    },
})
</script>

<template>
    <div ref="container" class="bg-gray-200 rounded relative w-full h-[80px] m-auto flex items-center justify-center overflow-hidden">
        <button @click="reset" class="btn">
            Reset
        </button>
        <div
            ref="target"
            class="absolute w-full h-full top-0 left-0 bg-[#3eaf7c] flex items-center justify-center"
            :class="{ 'transition-all duration-200 ease-linear': !isSwiping }"
            :style="{ left, opacity }"
        >
            <p class="flex text-white items-center">
                <- Swipe ->
            </p>
        </div>
    </div>
</template>
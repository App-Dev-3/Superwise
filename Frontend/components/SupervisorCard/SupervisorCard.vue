<script setup>
const props = defineProps({
    image: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    tags: {
        type: Array,
        default: () => [],
    },
    description: {
        type: String,
        default: '',
    },
    similarityScore: {
        type: Number,
        default: 0,
    },
    maxCapacity: {
        type: Number,
        default: 0,
    },
    currentCapacity: {
        type: Number,
        default: 0,
    },
    pendingAmount: {
        type: Number,
        default: 0,
    },
    dragging: {
        type: Boolean,
        default: false,
    },
    iconSwipeLeft: {
        type: String,
        default: 'trash',
    },
    iconSwipeRight: {
        type: String,
        default: 'check',
    },
})

const emit = defineEmits(['swipeLeft', 'swipeRight'])


</script>

<template>

</template>

<style scoped>

</style>
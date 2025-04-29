<script setup>
import { computed } from 'vue'
import CustomTag from "../CustomTag/CustomTag.vue";

const props = defineProps({
    size: {
        type: String,
        default: 'md',
        required: false,
        validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl', ].includes(value),
    },
    image: {
        type: String,
        required: true,
    },
    // TODO: change name to fname and lname for the fallback image
    name: {
        type: String,
        required: true,
    },
    tags: {
        type: Array,
        default: () => [],
    },
    maxTagAmount: {
        type: Number,
        default: 4,
    },
    description: {
        type: String,
        default: '',
    },
    similarityScore: {
        type: Number,
        required: true,
    },
    maxCapacity: {
        type: Number,
        required: true,
    },
    currentCapacity: {
        type: Number,
        required:  true
    },
    pendingAmount: {
        type: Number,
        default: 0,
    },
})

const limitedTags = computed(() => props.tags.slice(0, props.maxTagAmount))

const cardSizeClasses = computed(() => ({
    'w-72 card-xs': props.size === 'xs',
    'w-80 card-sm': props.size === 'sm',
    'w-96 card-md': props.size === 'md',
    'w-[28rem] card-lg': props.size === 'lg',
    'w-[32rem] card-xl': props.size === 'xl',
}))

const imageSizeClasses = computed(() => ({
    'size-8': props.size === 'xs',
    'size-10': props.size === 'sm',
    'size-12': props.size === 'md',
    'size-14': props.size === 'lg',
    'size-16': props.size === 'xl',
}))

</script>

<template>
    <div
        class="card bg-base-100 shadow-lg"
        :class="cardSizeClasses"
    >
        <div class="card-body">
            <h2 class="card-title font-bold">
                <div class="mask mask-squircle">
                    <img
                        class="rounded-box"
                        :class="imageSizeClasses"
                        :src="props.image"
                        alt="Profile Picture of {{ props.name }}"
                    >
                </div>{{ props.name }}
            </h2>

            <p
                class="text-base-content/50 text-xs line-clamp-4 leading-tight"
               :class="{ 'h-15': props.description.trim().length > 0 }"
            >
                {{ description }}
            </p>
            <div>
                <CustomTag v-for="tag in limitedTags" :key=tag :text=tag size="xl" variant="outline"/>
            </div>
            <div class="card-actions w-full flex justify-between">
                <CustomTag :text="props.similarityScore + '%'" size="xs" variant="clear" color="base-content/50"/>
                <div>
                    <CustomTag
                        :text="props.currentCapacity + '/' + props.maxCapacity + ' '"
                        right-icon="user-group"
                        size="xs"
                        variant="clear"
                        color="base-content/50"
                    />
                    <CustomTag
                        :text="props.pendingAmount + ' '"
                        right-icon="hourglass"
                        size="xs"
                        variant="clear"
                        color="base-content/50"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>
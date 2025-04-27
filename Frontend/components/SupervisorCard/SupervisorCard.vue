<script setup>
import { computed } from 'vue'

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
        default: 0,
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
                    />
                </div>{{ props.name }}
            </h2>

            <p
                class="text-base-content/50 text-xs line-clamp-4 leading-tight"
               :class="{ 'h-15': props.description.trim().length > 0 }"
            >
                {{ description }}
            </p>
            <!--                TODO: All badges will be replaced with the custom tag component-->
            <div>
                <span v-for="tag in limitedTags" class="text-base-content/50 badge badge-lg badge-gray badge-outline mx-0.5 my-0.5">{{ tag }}</span>
            </div>
            <div class="card-actions w-full flex justify-between">
<!--                similarity score badge-->
                <div class="badge badge-sm badge-gray badge-outline mx-0.5 my-0.5">
                    <span class="text-base-content/50 ">{{ props.similarityScore }} % </span>
                </div>
                <div>
    <!--                capacity badge-->
                    <div class="badge badge-sm badge-gray badge-outline mx-0.5 my-0.5">
                        <span class="text-base-content/50 ">{{ props.currentCapacity }}/{{ props.maxCapacity }} </span>
                        <svg class="fill-base-content/50 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" >
                            <path d="M680-360q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM520-160q-17 0-28.5-11.5T480-200v-16q0-24 12.5-44.5T528-290q36-15 74.5-22.5T680-320q39 0 77.5 7.5T832-290q23 9 35.5 29.5T880-216v16q0 17-11.5 28.5T840-160H520ZM400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-272q0-34 17-62.5t47-43.5q60-30 124.5-46T400-440q35 0 70 6t70 14l-68 68q-25 25-48.5 51T400-240v39q0 12 4.5 22.5T419-160H160q-33 0-56.5-23.5T80-240v-32Z"/>
                        </svg>
                    </div>
    <!--                pending badge-->
                    <div class="badge badge-sm badge-gray badge-outline mx-0.5 my-0.5">
                        <span class="text-base-content/50 ">{{ props.pendingAmount }}</span>
                        <svg class="fill-base-content/50 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" >
                            <path d="M320-160h320v-120q0-66-47-113t-113-47q-66 0-113 47t-47 113v120Zm160-360q66 0 113-47t47-113v-120H320v120q0 66 47 113t113 47ZM200-80q-17 0-28.5-11.5T160-120q0-17 11.5-28.5T200-160h40v-120q0-61 28.5-114.5T348-480q-51-32-79.5-85.5T240-680v-120h-40q-17 0-28.5-11.5T160-840q0-17 11.5-28.5T200-880h560q17 0 28.5 11.5T800-840q0 17-11.5 28.5T760-800h-40v120q0 61-28.5 114.5T612-480q51 32 79.5 85.5T720-280v120h40q17 0 28.5 11.5T800-120q0 17-11.5 28.5T760-80H200Z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>
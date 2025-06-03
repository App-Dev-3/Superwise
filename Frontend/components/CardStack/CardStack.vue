<script setup>
const props = defineProps({
    amount: {
        type: Number,
        default: 3,
    },
})

function getRotationStyle(index) {
    if (index === 1) {
        return 'rotate(0deg)';
    }
    return index % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1deg)';
}
</script>

<template>
    <div class="flex flex-col">
        <div class="stack w-full">
            <div
                v-for="index in props.amount"
                :key="index"
                :style="{ transform: getRotationStyle(index) }"
                class="relative w-full"
            >
                <slot>
                    <div
                        class="h-48 w-48 bg-error text-error-content grid place-content-center rounded-box text-center">
                        You forgot to add a Card in the "CardStack" Component! <br>
                        Go buy drinks🍻<br>
                        <p class="text-xs">(the tag should also not be self-closing)</p>
                    </div>
                </slot>
            </div>
        </div>
    </div>
</template>

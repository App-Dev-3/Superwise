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
    return index % 2 === 0 ? 'rotate(-3deg)' : 'rotate(3deg)';
}
</script>

<template>
    <div class="stack relative w-fit h-fit">
        <div
            v-for="index in props.amount"
            :key="index"
            :style="{ transform: getRotationStyle(index) }"
            class="absolute"
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
</template>

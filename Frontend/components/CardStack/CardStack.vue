<script setup>
const props = defineProps({
    amount: {
        type: Number,
        default: 3,
    },
})
</script>

<template>
    <div class="stack w-96">
        <template v-for="index in props.amount" :key="index">
            <div :style="{ transform: `rotate(${index === 1 ? 0 : (index % 2 === 0 ? -3 : 3)}deg)` }">
                <slot>
                    <div
                        class="h-48 w-48 bg-error text-error-content grid place-content-center rounded-box text-center">
                        You forgot to add a Card in the "CardStack" Component! <br>
                        Go buy drinks🍻<br>
                        <p class="text-xs">(the tag should also not be self-closing)</p>
                    </div>
                </slot>
            </div>
        </template>
    </div>
</template>

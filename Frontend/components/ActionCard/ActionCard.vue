<script setup>
import CustomButton from "../CustomButton/CustomButton.vue";

const props = defineProps({
    buttonText: {
        type: String,
        default: "Click Me",
    },
    cardType: {
        type: String,
        default: 'ghost',
        validator: (value) => !value || ["ghost", "primary"].includes(value),
    },
    headerText: {
        type: String,
        default: ''
    },
});

const emit = defineEmits(['actionButtonClicked']);
function emitActionEvent() {
  emit('actionButtonClicked');
}
</script>

<template>
    <div>
        <p v-if="props.headerText" class="mb-2 ml-4 text-lg font-bold">
          {{ props.headerText }}
        </p>
        <div class="card shadow-xl border border-base-300">
            <slot/>
            <!-- Action button at the bottom -->
            <div class="px-16 py-4 border-t border-base-300">
                <CustomButton
                    v-if="props.cardType === 'ghost'"
                    :text="props.buttonText"
                    block
                    color="default"
                    variant="ghost"
                    @click="emitActionEvent"
                />
                <CustomButton
                    v-else
                    :text="props.buttonText"
                    block
                    color="primary"
                    @click="emitActionEvent"
                />
            </div>
        </div>
    </div>
</template>
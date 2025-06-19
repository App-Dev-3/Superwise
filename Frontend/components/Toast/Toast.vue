<script lang="ts" setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';

const props = defineProps({
    type: {
        type: String,
        default: "success",
        validator: (value) => ["success", "error", "exception"].includes(value as string),
    },
    message: {
        type: String,
        default: "Chat request has been sent",
    },
    duration: {
        type: Number,
        default: 3000,
    },
    buttonText: {
        type: String,
        default: "close",
    }
});

const emit = defineEmits(['buttonClick', 'close']);

// Internal visibility state
const visible = ref(true);

// Helper function to get the correct alert class based on type - now as computed property
const alertClass = computed(() => ({
    'alert-success': props.type === 'success' || props.type === undefined,
    'alert-error': props.type === 'error' || props.type === 'exception',
}));


// Get the actual icon name as a string
const iconName = computed(() => {
    if (props.type === 'error') return 'ban';
    if (props.type === 'exception') return 'triangle-exclamation';
    return 'check'; // default for success
});

// Auto-close toast after duration by changing internal visibility
let timeoutId: ReturnType<typeof setTimeout> | null = null;
onMounted(() => {
    if (props.duration > 0) {
        timeoutId = setTimeout(() => {
            emit('close');
            visible.value = false;
        }, props.duration);
    }
});

onBeforeUnmount(() => {
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }
});
// Just emit the event, don't change visibility
const handleButtonClick = () => {
    emit('buttonClick');
};
</script>

<template>
    <div
        v-if="visible"
        class="fixed bottom-18 left-0 right-0 flex justify-center z-50 px-12"
    >
        <div
            :class="alertClass"
            class="alert w-full shadow-lg flex alert-soft"
            role="alert">
            <FontAwesomeIcon :icon="iconName" class="text-xl"/>
            <span class="w-full">{{ message }}</span>
            <CustomButton
                :text="buttonText"
                :color="props.type === 'success' ? 'success' : 'error'"
                variant="outline"
                @click="handleButtonClick"
            />
        </div>
    </div>
</template>

<style scoped>
</style>

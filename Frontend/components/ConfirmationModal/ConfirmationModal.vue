<script setup lang="ts">
    import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

    interface Props {
        linkedComponentId: string;
        image?: string;
        headline: string;
        icon: string;
        description: string;
        warning?: string;
        confirmButtonText: string;
        cancelButtonText?: string;
        confirmButtonColor: 'default' | 'primary' | 'secondary' | 'accent' | 'error' | 'success' | 'warning' | 'info' | 'neutral';
        confirmButtonIcon?: string;
    }
    const props = withDefaults(defineProps<Props>(), {
        image: '',
        warning: 'This action can not be undone!',
        cancelButtonText: 'Cancel',
        confirmButtonIcon: ''
    })

    // "cancel" emit is called abort because cancel is a reserved word
    const emit = defineEmits<{
        (event: 'confirm' | 'abort' | 'dontShowAgain'): void;
    }>()

    const dontShowAgain = ref(false);

    const handleCancel = () => {
        emit('abort');
        if (dontShowAgain.value) {
            emit('dontShowAgain');
        }
    }

    const handleConfirm = () => {
        emit('confirm');
        if (dontShowAgain.value) {
            emit('dontShowAgain');
        }
    }
</script>

<template>
    <dialog :id="props.linkedComponentId" class="modal">
        <div class="modal-box w-11/12 max-w-3xl">
            <div class="w-full flex justify-between mb-8">
                <h3 class="text-2xl font-bold">{{ props.headline }}</h3>
                <div class="mx-4 mt-1">
                    <FontAwesomeIcon :icon="props.icon" />
                </div>
            </div>

            <div class="flex flex-col items-center max-w-full">
                <div v-if="props.image" class="mask mask-squircle size-24 mb-8">
                    <img :src="props.image" alt="Modal image" class="rounded-box" >
                </div>
            </div>
            <p class="text-lg text-base-content text-left mb-4">{{ props.description }}</p>
            <div v-if="props.warning" class="text-sm text-base-content/60 text-left mb-8">
                <span>{{ props.warning }}</span>
            </div>
            <div class="mb-4">
                <label class="label">
                    <input v-model="dontShowAgain" type="checkbox" class="checkbox" >
                    Don't show again
                </label>
            </div>
            
            <form method="dialog" class="flex flex-col gap-2">
                <CustomButton block size="xl" :text="props.cancelButtonText" variant="ghost" color="default" @click="handleCancel"/>
                <CustomButton :left-icon="props.confirmButtonIcon" block size="xl" :color="props.confirmButtonColor" :text="props.confirmButtonText" variant="soft" @click="handleConfirm"/>
            </form>
        </div>
    </dialog>
</template>

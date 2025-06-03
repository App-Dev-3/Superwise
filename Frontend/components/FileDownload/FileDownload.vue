<script lang="ts" setup>
// this should give type safety and autocomplete in the ide,
// we should have used this from the start lol
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

interface Props {
    title: string;
    fileName?: string;
    description: string;
    buttonText?: string;
    buttonColor?: string;
    buttonTopText?: string;
    buttonWidth?: 'fit-content' | 'wide' | 'block';
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    buttonText: 'Upload File',
    fileName: 'select *.csv',
    buttonColor: 'primary',
    buttonTopText: '',
    buttonWidth: 'fit-content',
    disabled: false,
});

const emit = defineEmits(["click"])

</script>

<template>
    <div class="flex flex-col gap-2">
        <span class="text-large px-6">{{ props.title }}</span>
        <div class="bg-base-100 rounded-3xl border border-base-300">
            <div class="flex flex-col items-center gap-4 w-full py-4 px-8">
                <div
                    class="hover:cursor-pointer flex flex-col px-8 py-3 shadow-inner rounded-3xl bg-base-200 w-full max-w-xs items-center gap-3"
                    @click="emit('click')"
                >

                    <FontAwesomeIcon
                        class="text-success text-5xl opacity-75"
                        icon="cloud-arrow-down"
                    />
                    <span class="text-xs-heavy opacity-75">{{ props.fileName }}</span>
                </div>
                <span
                    class="text-xs-heavy opacity-50 text-center">{{ props.description }}</span>
            </div>

            <hr class="border-base-300">

            <div class="py-4 px-8">
                <CustomButton
                    :block="props.buttonWidth === 'block'"
                    :color="props.buttonColor"
                    :is-active="!props.disabled"
                    :text="props.buttonText"
                    :top-text="props.buttonTopText"
                    :wide="props.buttonWidth === 'wide'"
                    left-icon="cloud-arrow-down"
                    @click="emit('click')"
                />
            </div>
        </div>
    </div>


</template>
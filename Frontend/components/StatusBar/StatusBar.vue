<script setup>
    import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

    const props = defineProps({
        step: {
            type: Number,
            default: 1,
        },
        smallText: {
            type: Boolean,
            default: true,
        },
    })
</script>

<template>
    <ul class="steps w-full">
        <li
            class="step text-base-content font-bold"
            :class="{'step-primary': props.step >= 1, 'text-sm': props.smallText}"
        >
            <span class="step-icon" >
                <FontAwesomeIcon icon="arrow-right-to-bracket"/>
            </span>
            Onboarding
        </li>
        <li
            class="step text-base-content font-bold"
            :class="{'step-primary': props.step >= 2, 'text-sm': props.smallText}"
        >
            <span class="step-icon" >
                <FontAwesomeIcon icon="message"/>
            </span>
            Matching
        </li>
        <li
            class="step text-base-content font-bold"
            :class="{'step-primary': props.step === 3, 'text-sm': props.smallText}"
        >
            <span class="step-icon" >
                <FontAwesomeIcon icon="user-group"/>
            </span>
            Confirmed
        </li>
    </ul>
</template>

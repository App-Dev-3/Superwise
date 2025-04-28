<script setup>
import { computed } from "vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
    text: { type: String, default: 'Tag' },
    color: {
        type: String,
        default: 'primary',
        validator(value, props) {
            // TLDR: The color of a badge is constrained to daisyUI colors if the variant is not 'clear' or 'ghost'.
            // If the variant is 'clear' or 'ghost', the color can be any color.
            const currentVariant = props.variant || 'default'
            const daisyColors = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']
            const clearVariants = ['clear', 'ghost']
            if (clearVariants.includes(currentVariant)) {
                return true
            } else {
                const isValidColor = daisyColors.includes(value)
                if (!isValidColor) {
                    console.warn(`Invalid color "${value}" for variant "${currentVariant}". Valid colors are: ${daisyColors.join(', ')}`)
                }
                return isValidColor
            }
        }
    },
    variant: {
        type: String,
        default: 'default',
        validator(value, props) {
            // FYI: the 'clear' variant is custom. It removes all the background and border styles.
            // (the 'ghost' variant from daisy was not enough to do that)
            return ['default', 'outline', 'ghost', 'soft', 'dash', 'clear'].includes(value);
        }
    },
    size: {
        type: String,
        default: 'md',
        validator(value, props) {
            return ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
        }
    },
    rightIcon: { type: String, default: '' },
    clickable: { type: Boolean, default: false },
    deletable: { type: Boolean, default: false },
})

const emit = defineEmits(['click', 'delete'])

function handleClick() {
  if (props.clickable && !props.deletable) {
    emit('click')
  }
}

function handleDelete() {
  if (props.deletable) {
    emit('delete')
  }
}

const badgeClasses = computed(() => {
  // i know we hate margins but with paddings it doesnt work, because padding just pushes the border away
    const classes = ['badge', 'm-0.5']

    // Color classes
    const daisyColors = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']
    const invisibleVariants = ['clear', 'ghost']
    if (!invisibleVariants.includes(props.variant)) { // if not a clear or ghost variant
        if (daisyColors.includes(props.color)) { // if the color is a daisy color, create normal badge
            classes.push(`badge-${props.color}`)
        }
    } else {
        classes.push(`text-${props.color}`)
    }


    // Variant classes
    switch (props.variant) {
        case 'outline':
            classes.push('badge-outline')
            break
        case 'ghost':
            classes.push('badge-ghost')
            break
        case 'soft':
            classes.push('badge-soft')
            break
        case 'dash':
            classes.push('badge-dash')
            break
        case 'clear':
            classes.push('bg-transparent')
            classes.push('border-none')
            break
        default:
            break
    }

    // Size classes
    classes.push(`badge-${props.size}`)

    // Clickable styling
    if (props.clickable) {
        classes.push('cursor-pointer')
    }

    return classes
})

const iconColorClass = computed(() => {
    return `!fill-${props.color}`
})

</script>

<template>
    <div
        :class="badgeClasses"
        @click="handleClick"
    >
        <FontAwesomeIcon
            v-if="props.deletable"
            icon="xmark"
            class="text-s cursor-pointer"
            :class="iconColorClass"
            data-test="delete-icon"
            @click="handleDelete"
        />
        <span >
            {{ props.text }}
            <FontAwesomeIcon
                v-if="props.rightIcon"
                :icon="props.rightIcon"
                :class="iconColorClass"
                data-test="prop-icon"
            />
        </span>
    </div>

</template>
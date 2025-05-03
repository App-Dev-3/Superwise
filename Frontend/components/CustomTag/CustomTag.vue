<script setup>
import { computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps({
    text: { type: String, default: "Tag" },
    color: {
        type: String,
        default: "default",
        validator(value, props) {
            const currentVariant = props.variant || "default";
            const clearVariants = ["clear", "ghost"];
            const daisyColors = [
                "default",
                "primary",
                "secondary",
                "accent",
                "neutral",
                "info",
                "success",
                "warning",
                "error",
            ];
            if (clearVariants.includes(currentVariant)) {
                return (daisyColors.includes(value) || value === "base-content");
            }
            return daisyColors.includes(value)
            },
    },
    muted: {
        type: Boolean,
        default: false,
        validator(value, props) {
            if (value && !["clear", "ghost"].includes(props.variant)) {
                console.warn("The 'muted' prop can only be applied with 'clear' or 'ghost' variants");
                return false;
            }
            return true;
        }
    },
    variant: {
        type: String,
        default: "default",
        validator(value) {
            // FYI: the 'clear' variant is custom. It removes all the background and border styles.
            // (the 'ghost' variant from daisy was not enough to do that)
            return ["default", "outline", "ghost", "soft", "dash", "clear"].includes(
                value
            );
        },
    },
    size: {
        type: String,
        default: "md",
        validator(value) {
            return ["xs", "sm", "md", "lg", "xl"].includes(value);
        },
    },
    rightIcon: { type: String, default: "" },
    clickable: { type: Boolean, default: false },
    deletable: { type: Boolean, default: false },
});

const emit = defineEmits(["click", "delete"]);

function handleClick() {
  if (props.clickable && !props.deletable) {
    emit("click");
  }
}

function handleDelete() {
  if (props.deletable) {
    emit("delete");
  }
}

const isInvisibleVariant = computed(() => ["clear", "ghost"].includes(props.variant));
const isMuted = computed(() => props.muted && isInvisibleVariant.value); // muted reduced the opacity

const badgeClasses = computed(() => {
    return {
        // Base classes
        'badge': true,
        'm-0.5': true,

        // Color classes for daisyUI colors (only for visible variants)
        'badge-primary': !isInvisibleVariant.value && props.color === 'primary',
        'badge-secondary': !isInvisibleVariant.value && props.color === 'secondary',
        'badge-accent': !isInvisibleVariant.value && props.color === 'accent',
        'badge-neutral': !isInvisibleVariant.value && props.color === 'neutral',
        'badge-info': !isInvisibleVariant.value && props.color === 'info',
        'badge-success': !isInvisibleVariant.value && props.color === 'success',
        'badge-warning': !isInvisibleVariant.value && props.color === 'warning',
        'badge-error': !isInvisibleVariant.value && props.color === 'error',

        // Text color for invisible variants (not muted)
        'text-primary': isInvisibleVariant.value && props.color === 'primary' && !isMuted.value,
        'text-secondary': isInvisibleVariant.value && props.color === 'secondary' && !isMuted.value,
        'text-accent': isInvisibleVariant.value && props.color === 'accent' && !isMuted.value,
        'text-neutral': isInvisibleVariant.value && props.color === 'neutral' && !isMuted.value,
        'text-info': isInvisibleVariant.value && props.color === 'info' && !isMuted.value,
        'text-success': isInvisibleVariant.value && props.color === 'success' && !isMuted.value,
        'text-warning': isInvisibleVariant.value && props.color === 'warning' && !isMuted.value,
        'text-error': isInvisibleVariant.value && props.color === 'error' && !isMuted.value,
        'text-base-content': isInvisibleVariant.value && props.color === 'base-content' && !isMuted.value,

        // Muted text colors (with 70% opacity) - only for invisible variants
        'text-primary/60': isInvisibleVariant.value && props.color === 'primary' && isMuted.value,
        'text-secondary/60': isInvisibleVariant.value && props.color === 'secondary' && isMuted.value,
        'text-accent/60': isInvisibleVariant.value && props.color === 'accent' && isMuted.value,
        'text-neutral/60': isInvisibleVariant.value && props.color === 'neutral' && isMuted.value,
        'text-info/60': isInvisibleVariant.value && props.color === 'info' && isMuted.value,
        'text-success/60': isInvisibleVariant.value && props.color === 'success' && isMuted.value,
        'text-warning/60': isInvisibleVariant.value && props.color === 'warning' && isMuted.value,
        'text-error/60': isInvisibleVariant.value && props.color === 'error' && isMuted.value,
        'text-base-content/60': isInvisibleVariant.value && props.color === 'base-content' && isMuted.value,

        // Variant classes
        'badge-outline': props.variant === 'outline',
        'badge-ghost': props.variant === 'ghost',
        'badge-soft': props.variant === 'soft',
        'badge-dash': props.variant === 'dash',
        'bg-transparent': props.variant === 'clear',
        'border-none': props.variant === 'clear',

        // Size classes
        'badge-xs': props.size === 'xs',
        'badge-sm': props.size === 'sm',
        'badge-md': props.size === 'md',
        'badge-lg': props.size === 'lg',
        'badge-xl': props.size === 'xl',

        // Clickable styling
        'cursor-pointer': props.clickable
    };
});

const iconColorClass = computed(() => {
    if (props.color === "default") {
        return {"fill-current": true};
    }

    return {
        // Normal icon colors (for invisible variants without muted)
        'fill-primary': isInvisibleVariant.value && props.color === 'primary' && !isMuted.value,
        'fill-secondary': isInvisibleVariant.value && props.color === 'secondary' && !isMuted.value,
        'fill-accent': isInvisibleVariant.value && props.color === 'accent' && !isMuted.value,
        'fill-neutral': isInvisibleVariant.value && props.color === 'neutral' && !isMuted.value,
        'fill-info': isInvisibleVariant.value && props.color === 'info' && !isMuted.value,
        'fill-success': isInvisibleVariant.value && props.color === 'success' && !isMuted.value,
        'fill-warning': isInvisibleVariant.value && props.color === 'warning' && !isMuted.value,
        'fill-error': isInvisibleVariant.value && props.color === 'error' && !isMuted.value,
        'fill-base-content': isInvisibleVariant.value && props.color === 'base-content' && !isMuted.value,

        // Muted icon colors (with 70% opacity) - only for invisible variants
        'fill-primary/60': isInvisibleVariant.value && props.color === 'primary' && isMuted.value,
        'fill-secondary/60': isInvisibleVariant.value && props.color === 'secondary' && isMuted.value,
        'fill-accent/60': isInvisibleVariant.value && props.color === 'accent' && isMuted.value,
        'fill-neutral/60': isInvisibleVariant.value && props.color === 'neutral' && isMuted.value,
        'fill-info/60': isInvisibleVariant.value && props.color === 'info' && isMuted.value,
        'fill-success/60': isInvisibleVariant.value && props.color === 'success' && isMuted.value,
        'fill-warning/60': isInvisibleVariant.value && props.color === 'warning' && isMuted.value,
        'fill-error/60': isInvisibleVariant.value && props.color === 'error' && isMuted.value,
        'fill-base-content/60': isInvisibleVariant.value && props.color === 'base-content' && isMuted.value,
    };
});
</script>

<template>
    <div :class="badgeClasses" @click="handleClick">
        <FontAwesomeIcon
            v-if="props.deletable"
            icon="xmark"
            class="text-s cursor-pointer"
            :class="iconColorClass"
            data-test="delete-icon"
            @click="handleDelete"
        />
        <span>
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
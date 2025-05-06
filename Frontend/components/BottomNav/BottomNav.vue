<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps({
    activeRoute: {
        type: String,
        default: '/dashboard'
    },
    alwaysShowLabels: {
        type: Boolean,
        default: true
    },
    showLabelsOnActive: {
        type: Boolean,
        default: true
    },
});

const emit = defineEmits(['navigate']);

function handleClick(route) {
    emit('navigate', route);
}

const isActiveRoute = (route) => {
    return props.activeRoute === route;
};

const bottomNavButtons = [
    { icon: 'house', label: 'Dashboard', route: '/dashboard' },
    { icon: 'user-group', label: 'Matching', route: '/matching' },
    { icon: 'message', label: 'Chat', route: '/chat' }
]
</script>

<template>
    <div class="dock max-w-7xl w-full mx-auto">
        <button
            v-for="button in bottomNavButtons"
            :key="button.route"
            :class="{ 'dock-active': isActiveRoute(button.route) }"
            @click="handleClick(button.route)"
        >
            <FontAwesomeIcon :icon="button.icon" />
            <span
                v-if="props.alwaysShowLabels || (props.showLabelsOnActive && isActiveRoute(button.route))"
                class="dock-label"
            >
                {{ button.label }}
            </span>
        </button>
    </div>
</template>
<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

interface NavButton {
    label: string;
    icon: string;
    route: string;
}
// Example of bottomNavButtons array
// const bottomNavButtons = [
//     { label: 'Dashboard', icon: 'house', route: '/dashboard' },
//     { label: 'Matching', icon: 'user-group', route: '/matching' },
//     { label: 'Chat', icon: 'message', route: '/chat' }
// ]
interface Props {
    activeRoute: string;
    bottomNavButtons: NavButton[];
    alwaysShowLabels?: boolean;
    showLabelsOnActive?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
        alwaysShowLabels: false,
        showLabelsOnActive: true
});

const emit = defineEmits(['navigate']);

function handleClick(route) {
    emit('navigate', route);
}

const isActiveRoute = (route) => {
    return props.activeRoute === route;
};

</script>

<template>
    <div class="dock max-w-3xl w-full mx-auto">
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
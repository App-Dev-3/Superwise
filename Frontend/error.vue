<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full p-8 bg-white shadow-lg rounded-lg text-center">
            <div class="flex justify-center mb-6">
                <div class="text-6xl text-red-500">
                    <span v-if="error.statusCode">{{ error.statusCode }}</span>
                    <span v-else>Error</span>
                </div>
            </div>

            <h1 class="text-2xl font-bold mb-4">
                {{ error.statusMessage || 'Something went wrong' }}
            </h1>

            <p class="text-gray-600 mb-6">
                {{ errorDescription }}
            </p>

            <div class="flex justify-center">
                <button
                    class="btn btn-primary"
                    @click="handleError"
                >
                    Back to Home
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    error: {
        type: Object,
        default: () => ({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
        }),
    }
})

console.error(props.error)

const errorDescription = computed(() => {
    if (props.error.statusCode === 404) {
        return "The page you're looking for doesn't exist."
    }

    if (props.error.statusCode === 401) {
        return "You need to be logged in to access this page."
    }

    return "We're sorry, but something went wrong on our end."
})

const handleError = () => {
    // Clear the error and redirect to home page
    clearError({ redirect: '/' })
}
</script>
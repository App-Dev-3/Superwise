<template>
    <div class="w-full h-screen flex max-w-3xl m-auto flex-col p-8 justify-center items-center">

                    <span v-if="error.statusCode" class="text-2xl font-bold mb-4">{{ error.statusCode }}</span>




            <h1 class="text-sm text-base-content/60 mb-4">
                {{ error.statusMessage || 'Something went wrong' }}
            </h1>

            <p class="text-base-content mb-6">
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
    // make switch case for all error codes
    switch (props.error.statusCode) {
        case 400:
            return "Bad Request. Please check your input.";
        case 401:
            return "You need to log in to access this page.";
        case 403:
            return "You don't have permission to access this page.";
        case 404:
            return "The page you're looking for doesn't exist.";
        case 500:
            return "Internal Server Error. Please try again later.";
        default:
            return "An unexpected error occurred.";
    }
})

const handleError = () => {
    clearError({ redirect: '/' })
}
</script>
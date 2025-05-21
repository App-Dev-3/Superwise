<template>
    <div class="max-w-xl flex flex-col items-center m-auto gap-8">
        <UserButton />
        <div class="join">
            <div>
                <select v-model="httpMethod" class="select select-bordered join-item">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                </select>
            </div>
            <div>
                <label class="input join-item">
                    <input v-model="inputRoute" type="text" class="grow" placeholder="/api/..." @keydown.enter="sendRequest">
                </label>
            </div>
            <div>
                <button class="join-item btn btn-primary" @click="sendRequest">Send Request </button>
            </div>
        </div>
        <button class="btn btn-primary" @click="clearOutput">Clear Output</button>

        <div v-if="showBodyInput" class="w-full">
            <h2 class="text-center font-semibold">Request Body (JSON):</h2>
            <textarea
                v-model="requestBody"
                class="textarea textarea-bordered w-full h-40 font-mono"
                placeholder='{ "key": "value" }'
                @keydown.ctrl.enter="sendRequest"
            />
        </div>

        <h1>Status:</h1>
        <div class="mockup-code w-full">
            <pre><code>{{ responseStatus }}</code></pre>
        </div>
        <h1>Response:</h1>
        <div class="mockup-code w-full">
            <pre><code>{{ responseData }}</code></pre>
        </div>
        <h1>Error:</h1>
        <div class="mockup-code w-full">
            <pre><code>{{ responseError }}</code></pre>
        </div>
    </div>
</template>

<script setup lang="ts">
const inputRoute = ref("")
const httpMethod = ref<"GET" | "POST" | "DELETE" | "PUT" | "PATCH">("GET")
const requestBody = ref("")

// Show the body input field only for methods that typically send data
const showBodyInput = computed(() => {
    return ['POST', 'PUT', 'PATCH'].includes(httpMethod.value)
})

const responseData = ref()
const responseError = ref()
const responseStatus = ref()

const clearOutput = () => {
    responseData.value = ""
    responseError.value = ""
    responseStatus.value = ""
}

const sendRequest = async () => {
    clearOutput()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
        method: httpMethod.value,
        lazy: true,
    }

    // Add body to request for methods that support it
    if (showBodyInput.value && requestBody.value.trim()) {
        try {
            options.body = JSON.parse(requestBody.value)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            responseError.value = "Invalid JSON in request body"
            responseStatus.value = 'Error'
            return
        }
    }
    try {
        const { data, error, status } = await useFetch(inputRoute.value, options)
        responseData.value = data
        responseError.value = error
        responseStatus.value = status
    } catch (error) {
        responseError.value = error
        responseStatus.value = 'Error'
        responseData.value = null
    }
}
</script>
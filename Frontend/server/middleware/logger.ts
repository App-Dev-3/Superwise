export default defineEventHandler((event) => {
    console.info(`[${new Date(Date.now())}]: Nuxt API called at ${event.method} ${getRequestURL(event)}`)
})

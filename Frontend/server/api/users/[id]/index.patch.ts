import {getAuth} from "@clerk/nuxt/server";
import {updateUserSchema} from "#shared/validationSchemas/validationSchemas";

export default defineEventHandler ( async (event) => {
    // specific checks for this endpoint
    const body = await readValidatedBody(event, body => updateUserSchema.parse(body))

    // standard setup for every endpoint
    const { getToken } = getAuth(event)
    const token = await getToken({ template: 'SuperwiseJWT' })
    const targetPath = getRequestURL(event).pathname.split('/api')[1] || ''

    // Send request to Nest API
    return await fetchNest(targetPath, {
        method: event.method,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: body,
    }).catch((error) => {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Internal Server Error',
        })
    })
})
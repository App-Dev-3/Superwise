import {emailSchema} from "#shared/validationSchemas/validationSchemas";
import {ZodError} from "zod";

export default defineEventHandler(async (event) => {
    // specific checks for this endpoint
    const email = getQuery(event).email
    if (!email) return sendError(event, createError({
        statusCode: 400, statusMessage: 'Email is required and has to be a valid email'
    }))
    try {
        emailSchema.parse(email)
    } catch (e) {
        if (e instanceof ZodError) {
            const errorMessage = e.errors.map(err => err.message).join(', ')
            return sendError(event, createError({
                statusCode: 400,
                statusMessage: errorMessage
            }))
        }
        return sendError(event, createError({
            statusCode: 400,
            statusMessage: 'Invalid email format'
        }))
    }

    // standard setup for every endpoint
    const token = await getBearerToken(event)
    const targetPath = getTargetPath(event)

    // Send request to Nest API

    return await fetchNest(targetPath, {
        method: event.method,
        query: {
            email: email as string,
        },
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
        },
    }).catch((error) => {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Internal Server Error',
        })
    })
})
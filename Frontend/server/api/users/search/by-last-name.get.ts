import {getAuth} from '@clerk/nuxt/server'
import {nameSchema} from "#shared/validationSchemas/validationSchemas";
import {ZodError} from "zod";

export default defineEventHandler(async (event) => {
    // specific checks for this endpoint
    const lastName = getQuery(event).lastName
    if (!lastName) return sendError(event, createError({
        statusCode: 400, statusMessage: 'lastName is required'
    }))
    try {
        nameSchema.parse(lastName)
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
            statusMessage: 'Invalid Name'
        }))
    }

    // standard setup for every endpoint
    const { getToken } = getAuth(event)
    const token = await getToken({ template: 'SuperwiseJWT' })
    const targetPath = getRequestURL(event).pathname.split('/api')[1] || ''

    // Send request to Nest API

    return await fetchNest(targetPath, {
        method: event.method,
        query: {
            lastName: lastName as string,
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
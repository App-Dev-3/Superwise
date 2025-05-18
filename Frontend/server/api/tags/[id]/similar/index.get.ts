import {similarityThresholdSchema} from "#shared/validationSchemas/validationSchemas";
import {ZodError} from "zod";

export default defineEventHandler ( async (event) => {
    // specific checks for this endpoint
    const minSimilarity = getQuery(event).minSimilarity
    if (!minSimilarity) return sendError(event, createError({
        statusCode: 400, statusMessage: 'minSimilarity is required'
    }))
    try {
        similarityThresholdSchema.parse(minSimilarity)
    } catch (e) {
        if (e instanceof ZodError) {
            const errorMessage = e.errors.map(err => err.message).join(', ')
            return sendError(event, createError({
                statusCode: 400,
                statusMessage: `Invalid Similarity Threshold: ${errorMessage}`
            }))
        }
        return sendError(event, createError({
            statusCode: 400,
            statusMessage: 'Invalid Similarity Threshold'
        }))
    }

    // standard setup for every endpoint
    const token = await getBearerToken(event)
    const targetPath = getTargetPath(event)

    // Send request to Nest API
    return await fetchNest(targetPath, {
        method: event.method,
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
        },
        query: {
            minSimilarity: minSimilarity as number
        }
    }).catch((error) => {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Internal Server Error',
        })
    })
})
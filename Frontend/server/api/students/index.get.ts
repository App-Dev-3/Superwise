import {takeSchema} from "#shared/validationSchemas/validationSchemas";
import {ZodError} from "zod";


export default defineEventHandler ( async (event) => {
    // specific checks for this endpoint
    const take = getQuery(event).take;

    let parsedTake: number;
    try {
        parsedTake = takeSchema.parse(take);
    } catch (e) {
        if (e instanceof ZodError) {
            const errorMessage = e.errors.map(err => err.message).join(', ')
            return sendError(event, createError({
                statusCode: 400,
                statusMessage: `Invalid QueryParameter: ${errorMessage}`
            }))
        }
        return sendError(event, createError({
            statusCode: 400,
            statusMessage: 'Invalid QueryParameter'
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
            take: parsedTake,
        }
    }).catch((error) => {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Internal Server Error',
        })
    })
})
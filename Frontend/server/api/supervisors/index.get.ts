import {takeSchema, availableOnlySchema} from "#shared/validationSchemas/validationSchemas";
import {ZodError} from "zod";

export default defineEventHandler(async (event) => {
    // specific checks for this endpoint
    const take = getQuery(event).take;
    const availableOnly = getQuery(event).availableOnly;

    let parsedTake: number | undefined;
    let parsedAvailableOnly: boolean;

    try {
        // Only parse take if it's provided
        if (take !== undefined) {
            parsedTake = takeSchema.parse(take);
        }
        parsedAvailableOnly = availableOnlySchema.parse(availableOnly);
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

    // Prepare query object, only including take if it's defined
    const query: Record<string, number | boolean> = {
        availableOnly: parsedAvailableOnly
    };

    // Only add take to query if it's defined
    if (parsedTake !== undefined) {
        query.take = parsedTake;
    }

    // Send request to Nest API
    return await fetchNest(targetPath, {
        method: event.method,
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
        },
        query
    }).catch((error) => {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Internal Server Error',
        })
    })
})
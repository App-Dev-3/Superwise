import { requestStateSchema } from "#shared/validationSchemas/validationSchemas";
import { ZodError } from "zod";

export default defineEventHandler ( async (event) => {
    const request_state = getQuery(event).request_state
    
        let parsedRequestState: string | undefined = undefined;
        if (request_state !== undefined) {
            try {
                parsedRequestState = requestStateSchema.parse(request_state);
            } catch (e) {
                if (e instanceof ZodError) {
                    const errorMessage = e.errors.map(err => err.message).join(', ');
                    return sendError(event, createError({
                        statusCode: 400,
                        statusMessage: `Invalid QueryParameter: ${errorMessage}`
                    }));
                }
                return sendError(event, createError({
                    statusCode: 400,
                    statusMessage: 'Invalid QueryParameter'
                }));
            }
        }
    
    
    // standard setup for every endpoint
    const token = await getBearerToken(event)
    const targetPath = getTargetPath(event)

    const queryParams: Record<string, string> = {};
    if (parsedRequestState !== undefined) {
        queryParams.request_state = parsedRequestState;
    }

    // Send request to Nest API
    return await fetchNest(targetPath, {
        method: event.method,
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
        },
        query: queryParams

    }).catch((error) => {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Internal Server Error',
        })
    })
})
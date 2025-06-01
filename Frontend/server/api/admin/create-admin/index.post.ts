import {createAdminSchema} from "#shared/validationSchemas/validationSchemas";

export default defineEventHandler ( async (event) => {
    // specific checks for this endpoint
    const validatedBody = await readValidatedBody(event, body => createAdminSchema.safeParse(body))
    if (!validatedBody.success) {
        throw createError({
            statusCode: 400,
            statusMessage: validatedBody.error.errors.map(err =>
                `${err.path.join('.')}: ${err.message}`
            ).join('; ') || 'Invalid request body',
    })}

    const body = validatedBody.data

    // standard setup for every endpoint
    const token = await getBearerToken(event)
    const targetPath = getTargetPath(event)

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
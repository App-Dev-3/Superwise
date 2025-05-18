export default defineEventHandler(async (event) => {
    // specific checks for this endpoint
    const tagIds = getQuery(event).tagIds
    if (!tagIds) return sendError(event, createError({
        statusCode: 400, statusMessage: 'tagIds are required'
    }))

    // standard setup for every endpoint
    const token = await getBearerToken(event)
    const targetPath = getTargetPath(event)

    // Send request to Nest API
    return await fetchNest(targetPath, {
        method: event.method,
        query: {
            tagIds: tagIds as string,
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
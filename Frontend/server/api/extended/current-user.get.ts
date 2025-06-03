import {clerkClient} from "@clerk/nuxt/server";
import type { UserData } from "#shared/types/userInterfaces";

export default defineEventHandler ( async (event) => {
    // Extra setup for this endpoint
    const { userId } = event.context.auth()
    if (!userId) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: No user ID provided',
        })
    }
    const clerkUser = await clerkClient(event).users.getUser(userId)
    const email = clerkUser.primaryEmailAddress?.emailAddress
    if (!email) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: No primary email address found',
        })
    }

    // standard setup for every endpoint
    const token = await getBearerToken(event)

    // Send request to Nest API
    return await fetchNest('/users/search/by-email', {
        method: event.method,
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
        },
        query: {
            email: email as string,
        }
     }).then(
        (response) => response as UserData,
    ).catch((error) => {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Internal Server Error',
        })
    })
})
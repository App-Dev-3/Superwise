import type {EventHandlerRequest, H3Event} from "h3";
import {getAuth} from "@clerk/nuxt/server";

export const getBearerToken = async (event: H3Event<EventHandlerRequest>) => {
    const { getToken } = getAuth(event)
    return await getToken({ template: 'SuperwiseJWT' })
}
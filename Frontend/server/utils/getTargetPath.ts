import type {EventHandlerRequest, H3Event} from "h3";

export const getTargetPath = (event: H3Event<EventHandlerRequest>) => {
    return getRequestURL(event).pathname.split('/api')[1] || ''
}

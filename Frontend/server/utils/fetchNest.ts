import {ofetch} from "ofetch";

const config = useRuntimeConfig()

export const fetchNest = ofetch.create({
    baseURL: config.nestApiUrl,
});
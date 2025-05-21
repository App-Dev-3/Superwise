export function useSupervisionRequests(requestState?: string) {
    return useFetch(
        '/api/supervision-requests',
        { params: requestState ? { request_state: requestState } : {} }
    )
}

import { makeRequest } from './useApi'

export const useSupervisorApi = () => {
    const getSupervisorByUserId = async (userId: string) => {
        return await makeRequest(`supervisors/user/${userId}`, 'GET')
    }

    return {
        getSupervisorByUserId,
    }

}

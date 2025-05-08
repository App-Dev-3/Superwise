import { makeRequest } from './useApi'
import type { UserCreateData } from "~/shared/types/userInterfaces";

export const useUserApi = () => {
  const getUserRole = async (data: { email: string }) => {
    console.log('getUserRole', data)
    return await makeRequest('user/role', 'POST', data)
  }

  const createUser = async (data: UserCreateData) => {
    return await makeRequest('users', 'POST', data)
  }

  const getUserByEmail = async (data: string) => {
    return await makeRequest('users/search/by-email', 'GET', {
      email: data
    })
  }

  const getUserById = async (data: string) => {
    return await makeRequest(`users/${data}`, 'GET')
  }

  //TODO: upload tags to use this endpoint
  const addUserTag = async (data: Record<string, unknown>) => {
    console.log('addUserTag', data)
    return await makeRequest(`users/${data.id}/tags`, 'PUT', { tags: data.tags })
  }

  const getMatches = async (data: string) => {
    return await makeRequest(`match/${data}`, 'GET');
  }

  return {
    getUserRole,
    createUser,
    getUserByEmail,
    getUserById,
    addUserTag,
    getMatches
  }

}
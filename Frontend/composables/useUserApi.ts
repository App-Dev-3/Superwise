import { makeRequest } from './useApi'
import type { UserCreateData } from "~/shared/types/userInterfaces";

export const useUserApi = () => {
  const getUserRole = async (data: { email: string }) => {
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

  const getUserByFirstName = async (data: string) => {
    return await makeRequest('users/search/by-first-name', 'GET', {
      firstName: data
    })
  }

  const getUserByLastName = async (data: string) => {
    return await makeRequest('users/search/by-last-name', 'GET', {
      lastName: data
    })
  }

  //TODO: upload tags to use this endpoint
  const addUserTag = async (data: Record<string, unknown>) => {
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
    getUserByFirstName,
    getUserByLastName,
    addUserTag,
    getMatches,
  }
}
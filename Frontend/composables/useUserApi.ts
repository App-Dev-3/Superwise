import { makeRequest } from './useApi'
import type {UserCreateData, UserRegistrationData} from "~/shared/types/userInterfaces";
import type {UserCreateData, UserRegistrationData} from "~/shared/types/userInterfaces";

export const useUserApi = () => {

  const getUserRegistrationStatus = async (data: string) => {
    return await makeRequest('users/check-registration', 'GET', {
      email: data
    }) as UserRegistrationData
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
  
  const addUserTag = async (data: Record<string, unknown>) => {
    return await makeRequest(`users/${data.id}/tags`, 'PUT', {tags: data.tags})
  }

  const getRecommendedSupervisors = async (data: string) => {
  const getRecommendedSupervisors = async (data: string) => {
    return await makeRequest(`match/${data}`, 'GET');
  }

  return {
    getUserRegistrationStatus,
    getUserRegistrationStatus,
    createUser,
    getUserByEmail,
    getUserById,
    addUserTag,
    getRecommendedSupervisors,
    getRecommendedSupervisors,
  }

}
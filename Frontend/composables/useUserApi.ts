import {makeRequest} from './useApi'
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

  const getUserById = async (data: string) => {
    return await makeRequest(`users/${data}`, 'GET')
  }

  const addUserTag = async (data: Record<string, unknown>) => {
    return await makeRequest(`users/${data.id}/tags`, 'PUT', { tags: data.tags })
  }

  const getRecommendedSupervisors = async (data: string) => {
    return await makeRequest(`match/${data}`, 'GET');
  }
  
  const createStudentProfile = async (data: string) => {
    return await makeRequest('students', 'POST', {
      thesis_description: data
    })
  }

  return {
    getUserRegistrationStatus,
    createUser,
    getUserByEmail,
    getUserByFirstName,
    getUserByLastName,
    getUserById,
    addUserTag,
    getRecommendedSupervisors,
    createStudentProfile
  }

}
import { makeRequest } from './useApi'

export const useUserApi = () => {
  const getUserRole = async (data: {email:string}) => {
    console.log('getUserRole', data)
    return await makeRequest('user/role', 'POST', data) 
  }

  const createUser = async (data: Object) => {
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
  const addUserTag = async (data: Record<string, any>) => {
    console.log('addUserTag', data)
    return await makeRequest(`users/${data.id}/tags`, 'PUT', {tags: data.tags})
  }

  return {
    getUserRole,
    createUser,
    getUserByEmail,
    getUserById,
    addUserTag
  }

}
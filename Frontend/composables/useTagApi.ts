import { makeRequest } from './useApi'

export const useTagApi = () => {
  const getTags = async () => {
    return await makeRequest('tags', 'GET')
  }

  return {
    getTags
  }

}
  
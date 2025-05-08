import { makeRequest } from './useApi'
import type { tagData } from '~/shared/types/tagInterfaces';


export const useTagApi = () => {
  const getTags = async () => {
    return await makeRequest('tags', 'GET')
  }

  return {
    getTags
  }

}
  
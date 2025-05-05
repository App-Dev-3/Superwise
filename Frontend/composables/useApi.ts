export const useApi = () => {

  const makeRequest = async (endpoint: string, method: string, body: Record<string, any> = {}) => {
    const data = fetch(`/api/proxy/${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),    
    })

    const response = await data
    return response.json()
  }

  const getUserRole = async (data: {email:string}) => {
    console.log('getUserRole', data)
    return await makeRequest('user/role', 'POST', data) 
  }

  const helloWorld = async () => {
    return await makeRequest('hello-world', 'GET')
  }

  return {
    getUserRole,
  }

}
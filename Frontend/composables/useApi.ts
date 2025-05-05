export const makeRequest = async (endpoint: string, method: string, body: Record<string, any> = {}) => {
  const data = fetch(`/api/proxy/${endpoint}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
  })

  const response = await data
  return response.json()
}
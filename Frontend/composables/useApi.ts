// If you do a request, and it has a payload, it always has to be a key-value pair.
// The key has to match the backend naming convention. Otherwise it will not work.


export const makeRequest = async (endpoint: string, action: string, payload: Record<string, unknown> = {}) => {
  const res = await fetch(`/api/proxy/${endpoint}`, {
    //enforce POST to allow the body to be included
    //decide the actual method in the proxy
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      data: payload
    })
  })

  if (!res.ok) {
    const error = await res.json()
    console.error('API Error:', error)
    throw new Error(`API request failed: ${error.message}`)
  }
  return res.json()
}
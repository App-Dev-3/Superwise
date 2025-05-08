import { joinURL } from 'ufo'
import { getAuth } from '@clerk/nuxt/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path') ?? '' 
  let target = joinURL(config.nestApiUrl, path)
  
  const incomingBody = await readBody(event)
  const method = incomingBody.action || 'GET'
  const data = incomingBody.data || {}
  //clerk token
  const { getToken } = getAuth(event)
  const token = await getToken({ template: 'SuperwiseJWT' })
  
  const headers = {
    'Content-Type': 'application/json',
    'bearer-token': token,
  }

  let body;
  if (method === 'GET' && data) {
    //append query param to url since GET shouldnt have a body
    //In the event that its a path param, its already set from calling code
    const url = new URL(target)
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })

    target = url.toString()
  } else if (data){ 
    body = JSON.stringify(data)
  }
  const response = await fetch(target, {
    method,
    headers: headers,
    body
  })

  return response.json()  
})
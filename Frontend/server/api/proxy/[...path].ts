import { joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path') ?? '' 
  const target = joinURL(config.nestApiUrl, path)
  
  const headers = {
    'Content-Type': 'application/json',
    'bearer-token': 'bebebobo',
  }
  
  let body: any = null
  const method = event.node.req.method ?? 'GET'
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    body = await readBody(event)
  }

  const response = await fetch(target, {
    method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.text()
  return data  
})
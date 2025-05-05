// import { proxyRequest } from 'h3-proxy'
import { joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
  console.log('proxy event', event);
  const config = useRuntimeConfig()
  const path = event.context.params?.path || ''
  const target = joinURL(config.nestApiUrl, path)
  
  const headers = await generateSecureHeaders()
  return {
    target: target,
    headers: headers,
  }

  // return proxyRequest(event, target, {
  //   method: event.method,
  //   headers
  // })
})
import crypto from 'crypto'

export const generateSecureHeaders = async () => {
  const config = useRuntimeConfig()
  const timeStamp = Date.now().toString()

  //TODO: get clerk session
  const clerkUserSession = 'bebebobo'

  const signature = crypto
    .createHmac('sha256', config.SECRET_KEY)
    .update(clerkUserSession + timeStamp)
    .digest('hex')

  return {
    'x-api-key': config.apiKey,
    'x-user-id': clerkUserSession,
    'x-timestamp': timeStamp,
    'x-signature': signature
  }
  
}
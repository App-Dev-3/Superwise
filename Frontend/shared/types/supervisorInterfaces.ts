export interface SupervisorData {
  supervisorId: string
  supervisor_userId: string
  firstName: string
  lastName: string
  compatibilityScore: number
  bio: string
  tags: string[]
  pendingRequests: number
  availableSpots: number
  totalSpots: number
}
import type { supervisionRequestStatus } from "../enums/enums"

// This is the data returned from /matching, the name is misleading. This is NOT the Supervisor Profile!
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
  profileImage: string
}

export interface SupervisionRequestsData {
  id: string;
  request_state: supervisionRequestStatus;
  student_id: string;
  supervisor_id: string;
  created_at: string;
  updated_at: string;
  studentWasCreated: boolean;
  student: UserReference;
  supervisor: UserReference;
}

export interface UserBasicInfo {
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
}

export interface UserReference {
  id: string;
  user_id: string;
  user: UserBasicInfo;
}

export interface SupervisorProfile {
  id: string;
  user_id: string;
  bio: string | null;
  available_spots: number;
  total_spots: number;
  created_at: string;
  updated_at: string;
}
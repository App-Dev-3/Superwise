import type {supervisionRequestStatus} from "#shared/enums/enums";
import type {SupervisorProfile} from "#shared/types/supervisorInterfaces";
import type {StudentProfile} from "#shared/types/StudentInterfaces";

export interface SupervisionRequest {
    id: string;
    request_state: supervisionRequestStatus;
    student_id: string;
    supervisor_id: string;
    student?: StudentProfile;
    supervisor?: SupervisorProfile
    created_at: string;
    updated_at: string;
}
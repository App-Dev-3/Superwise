import type {UserRoles} from "#shared/enums/enums";

import type { SupervisorData } from "./supervisorInterfaces";

export interface UserCreateData extends Record<string, unknown> {
    email: string;
    first_name?: string;
    last_name?: string;
}

export interface UserData extends Record<string, unknown> {
    id: string;
    clerk_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRoles;
    profile_image: string | null;
    is_registered: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserRegistrationData extends Record<string, unknown> {
    exists: boolean;
    is_registered: boolean;
    role: UserRoles;
}

export interface SupervisionRequestData extends Record<string, unknown> {
    supervisor_id?: string
    student_email?: string
}

export interface SupervisionRequestResponseData extends Record<string, unknown> {
    id: string,
    request_state: string,
    student_id: string,
    supervisor_id: string,
    created_at: string,
    updated_at: string,
    studentWasCreated: boolean
}

export enum supervisionRequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN'
}

export interface ConfirmationDialogData {
    type: 'confirm' | 'dismiss'
    headline: string
    icon: string
    description: string
    warning: string
    confirmButtonText: string
    confirmButtonColor: 'default' | 'primary' | 'secondary' | 'accent' | 'error' | 'success' | 'warning' | 'info' | 'neutral'
    supervisor?: SupervisorData
}

export interface UserSettingsData {
    theme?: string
    language?: string
    dismissConfirmationModal?: boolean
}
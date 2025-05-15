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
    role: 'STUDENT' | 'SUPERVISOR' | string;
    profile_image: string | null;
    is_registered: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserRegistrationData extends Record<string, unknown> {
    exists: boolean;
    is_registered: boolean;
}
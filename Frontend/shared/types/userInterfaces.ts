export interface UserCreateData extends Record<string, unknown> {
    email: string;
    first_name?: string;
    last_name?: string;
}

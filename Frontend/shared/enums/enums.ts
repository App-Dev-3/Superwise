export enum UserRoles {
    STUDENT = "STUDENT",
    SUPERVISOR = "SUPERVISOR",
    ADMIN = "ADMIN",
}

export enum HttpMethods {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export enum supervisionRequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN'
}

export enum supervisionRequestType {
    CONFIRM = 'CONFIRM',
    DISMISS = 'DISMISS',
}
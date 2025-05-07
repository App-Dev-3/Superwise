export { }

declare global {
    interface CustomJwtSessionClaims {
        unsafeMetadata: {
            onboardingCompleted?: boolean,
        }
    }
}
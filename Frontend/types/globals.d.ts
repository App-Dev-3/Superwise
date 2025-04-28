export { }

declare global {
  interface CustomJwtSessionClaims {
    unsafeMetadata: {
      onboardingComplete?: boolean,
    }
  }
}

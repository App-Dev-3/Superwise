/**
 * Defines the structure of the Clerk JWT payload after decoding
 * Contains only the essential properties we use from the token
 */
export interface JwtPayload {
  /** Subject (Clerk user ID) */
  sub: string;
  /** Expiration time */
  exp: number;
  /** User's verified email address */
  email: string;
}

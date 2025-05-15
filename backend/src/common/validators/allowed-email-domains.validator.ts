import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Validates that an email belongs to an allowed domain from the ALLOWED_EMAIL_DOMAINS env variable
 */
export function IsAllowedEmailDomain(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAllowedEmailDomain',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string): boolean {
          if (typeof value !== 'string') return false;
          if (!value) return false;

          // Extract the domain from the email
          const domain = value.split('@')[1]?.toLowerCase();
          if (!domain) return false;

          // Get allowed domains from environment variable
          const allowedDomainsStr = process.env.ALLOWED_EMAIL_DOMAINS;
          if (!allowedDomainsStr) {
            throw new Error('ALLOWED_EMAIL_DOMAINS environment variable must be set');
          }

          const allowedDomains = allowedDomainsStr.split(',').map(d => d.trim());
          return allowedDomains.includes(domain);
        },
        defaultMessage(): string {
          const allowedDomainsStr = process.env.ALLOWED_EMAIL_DOMAINS || '';
          const allowedDomains = allowedDomainsStr.split(',').map(d => d.trim());
          return `Email must be from one of the allowed domains: ${allowedDomains.join(', ')}`;
        },
      },
    });
  };
}

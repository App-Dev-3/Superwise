import {createSupervisionRequestSchema} from "#shared/validationSchemas/validationSchemas";

export default defineEventHandler ( async (event) => {
    // specific checks for this endpoint
    const body = await readValidatedBody(event, body => createSupervisionRequestSchema.parse(body))

    // email validation has to be done here, because the schema is not aware of the allowed domains
    if (body.student_email) {
        const config = useRuntimeConfig()
        const domain = body.student_email.split('@')[1].trim().toLowerCase()

        let allowedDomains: string[] = [];

        if (typeof config.allowedEmailDomains === 'string') {
            allowedDomains = (config.allowedEmailDomains as string).split(',').map(d => d.trim().toLowerCase());
        }
        else if (Array.isArray(config.allowedEmailDomains)) {
            allowedDomains = config.allowedEmailDomains.flatMap(domain =>
                typeof domain === 'string'
                    ? domain.split(',').map(d => d.trim().toLowerCase())
                    : [String(domain).trim().toLowerCase()]
            );
        }

        if (!allowedDomains.includes(domain)) {
            throw createError({
                statusCode: 400,
                statusMessage: `Email must be from an allowed domain: ${allowedDomains.join(', ')}, but got ${domain}`,
            })
        }
    }

    // standard setup for every endpoint
    const token = await getBearerToken(event)
    const targetPath = getTargetPath(event)

    // Send request to Nest API
    return await fetchNest(targetPath, {
        method: event.method,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: body,
    }).catch((error) => {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Internal Server Error',
        })
    })
})
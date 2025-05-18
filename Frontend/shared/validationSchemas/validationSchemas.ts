import {z} from "zod";

export const createUserSchema = z.object({
    "email": z.string().email(),
    "first_name": z.string(),
    "last_name": z.string(),
    "profile_image": z.string().optional(),
})

export const updateUserSchema = z.object({
    "email": z.string().email().optional(),
    "first_name": z.string().optional(),
    "last_name": z.string().optional(),
    "profile_image": z.string().optional(),
})

const userTagPrioritySchema = z.object({
    "tag_id": z.string().uuid({
        message: "Tag ID must be a valid UUID"
    }),
    "priority": z.number().int().min(1, {
        message: "Priority must be a positive integer starting from 1"
    }),
})

export const updateTagsSchema = z.object({
    "tags": z.array(userTagPrioritySchema)
        .min(1, { message: "At least one tag must be provided" })
        .refine(tags => {
            // Check if priorities are sequential
            const priorities = tags.map(tag => tag.priority).sort((a, b) => a - b);
            for (let i = 0; i < priorities.length; i++) {
                if (priorities[i] !== i + 1) {
                    return false;
                }
            }
            return true;
        }, {
            message: "Priorities must be sequential positive integers starting from 1"
        })
})

export const blockUserSchema = z.object({
    blocked_id: z.string().uuid(),
})

export const emailSchema = z.string().email()

export const nameSchema = z.string().min(1, {
    message: "First name is required"
})

export const uuidSchema = z.string().uuid()

export const similarityThresholdSchema = z.coerce
    .number()
    .min(0, { message: "Similarity threshold must be between 0 and 1" })
    .max(1, { message: "Similarity threshold must be between 0 and 1" });

export const takeSchema = z.coerce
    .number()
    .int()
    .positive()
    .default(10);

export const availableOnlySchema = z.enum(['true', 'false'])
    .optional()
    .transform(val => val === 'true')
    .default('false');

export const updateSupervisorProfileSchema = z.object({
    "bio": z.string().optional(),
    "available_spots": z.number().int().min(0, {
        message:"Available Spots need to be at least 0"
    }).optional(),
    "total_spots": z.number().int().min(0, {
        message:"Total Spots need to be at least 0"
    }).optional(),
})

export const updateStudentProfileSchema = z.object({
    "thesis_description": z.string().optional(),
})

const tagSimilaritiesSchema = z.object({
    field1: z.string().min(1, "Field1 cannot be empty"),
    field2: z.string().min(1, "Field2 cannot be empty"),
    similarity_score: z.number()
        .min(0, "Similarity score must be at least 0")
        .max(1, "Similarity score must be at most 1")
});

export const tagBulkImportSchema = z.object({
    tags: z.array(z.string().min(1, "Tag names cannot be empty"))
        .min(1, "At least one tag must be provided"),
    similarities: z.array(tagSimilaritiesSchema)
});

const createSupervisorSchema = z.object({
    first_name: z.string().min(1, "First name cannot be empty"),
    last_name: z.string().min(1, "Last name cannot be empty"),
    email: z.string().email("Invalid email format"),
    bio: z.string().optional(),
    available_spots: z.number()
        .int("Available spots must be an integer")
        .min(0, "Available spots cannot be negative")
        .optional(),
    total_spots: z.number()
        .int("Total spots must be an integer")
        .min(0, "Total spots cannot be negative")
        .optional()
});

export const supervisorBulkImportSchema = z.object({
    supervisors: z.array(createSupervisorSchema)
        .min(1, "At least one supervisor must be provided")
});

export const requestStateSchema = z.enum([
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN"
]).optional();

export const createSupervisionRequestSchema = z.object({
    supervisor_id: z.string()
        .uuid("Supervisor ID must be a valid UUID")
        .optional()
        .describe("The supervisor ID (required for student requests)"),

    student_email: z.string()
        .email("Student email must be a valid email address")
        .optional()
        .describe("The student email (required for supervisor requests)")
}).refine(
    (data) => {
        // Either supervisor_id or student_email must be provided
        return data.supervisor_id !== undefined || data.student_email !== undefined;
    },
    {
        message: "Either supervisor_id or student_email must be provided",
        path: ["_errors"], // This indicates it's a general error not tied to a specific field
    }
);

export const updateSupervisionRequestStateScheme = z.object({
    request_state: requestStateSchema
})
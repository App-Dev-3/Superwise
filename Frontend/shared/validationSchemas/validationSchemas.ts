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

export const similaritySchema = z.coerce
    .number()
    .min(0, { message: "Similarity threshold must be between 0 and 1" })
    .max(1, { message: "Similarity threshold must be between 0 and 1" });
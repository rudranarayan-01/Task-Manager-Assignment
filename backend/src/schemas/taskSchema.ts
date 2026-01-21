import { z } from 'zod';

export const CreateTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial(); 
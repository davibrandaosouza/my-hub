import { z } from "zod"

export const devocionalSchema = z.object({
    reflection: z.string().optional(),
    completed: z.boolean(),
})

export type DevocionalFormData = z.infer<typeof devocionalSchema>
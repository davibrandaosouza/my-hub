import { z } from "zod"

export const mediaStatusSchema = z.enum(["concluido", "assistindo", "abandonado", "quero_assistir"])

export const mediaSchema = z.object({
    apiId: z.string().min(1),
    titulo: z.string().min(1),
    capaUrl: z.string().url(),
    categoria: z.string().min(1),
    status: mediaStatusSchema,
    nota: z.number().nullable(),
})

export type MediaFormData = z.infer<typeof mediaSchema>

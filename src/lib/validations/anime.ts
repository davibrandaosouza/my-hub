import { z } from "zod"

export const animeStatusSchema = z.enum(["concluido", "assistindo", "abandonado", "quero_assistir"])

export const animeSchema = z.object({
    apiId: z.string().min(1),
    titulo: z.string().min(1),
    capaUrl: z.string().url(),
    categoria: z.string().min(1),
    status: animeStatusSchema,
    nota: z.number().nullable(),
})

export type AnimeFormData = z.infer<typeof animeSchema>

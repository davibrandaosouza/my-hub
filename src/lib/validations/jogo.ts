import { z } from "zod"

export const jogoSchema = z.object({
    status: z.enum(["jogando", "zerado", "abandonado", "quero_jogar"]),
    nota: z.number().min(0).max(10).nullable(),
    categoria: z.string(),
})

export type JogoFormData = z.infer<typeof jogoSchema>

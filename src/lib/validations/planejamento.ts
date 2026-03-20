import { z } from "zod"

export const planejamentoSchema = z.object({
    titulo: z.string().min(1, "Título é obrigatório").max(100, "Máximo 100 caracteres"),
    descricao: z.string().max(500, "Máximo 500 caracteres").optional(),
    status: z.enum(["pendente", "em_progresso", "concluido"]),
    prioridade: z.enum(["alta", "media", "baixa"]),
    categoria: z.string().min(1, "Categoria é obrigatória").max(30, "Máximo 30 caracteres"),
    data: z.string().optional(),
})

export type PlanejamentoFormData = z.infer<typeof planejamentoSchema>
import { z } from "zod"

export const notebookSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1, "Nome do caderno é obrigatório"),
    icon: z.string().optional(),
    color: z.string().optional(),
    createdAt: z.number(),
})

export const noteSchema = z.object({
    id: z.string().min(1),
    notebookId: z.string().min(1),
    title: z.string().min(1, "Título é obrigatório"),
    content: z.string().optional(),
    updatedAt: z.number(),
    pinned: z.boolean().optional(),
})

export type NotebookFormData = z.infer<typeof notebookSchema>
export type NoteFormData = z.infer<typeof noteSchema>

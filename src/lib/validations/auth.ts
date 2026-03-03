import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    rememberMe: z.boolean().optional(),
})

export { loginSchema }
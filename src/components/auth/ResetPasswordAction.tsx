"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const newPasswordSchema = z.object({
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
})

type NewPasswordFormData = z.infer<typeof newPasswordSchema>

export function ResetPasswordAction() {
    const searchParams = useSearchParams()
    const oobCode = searchParams.get("oobCode")

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">(
        oobCode ? "loading" : "error"
    )
    const [errorMessage, setErrorMessage] = useState(
        oobCode ? "" : "Link inválido ou expirado."
    )
    const [userEmail, setUserEmail] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<NewPasswordFormData>({
        resolver: zodResolver(newPasswordSchema),
    })

    // Verifica se o código é válido ao carregar a página
    useEffect(() => {
        if (!oobCode) return

        verifyPasswordResetCode(auth, oobCode)
            .then((email) => {
                setUserEmail(email)
                setStatus("ready")
            })
            .catch(() => {
                setStatus("error")
                setErrorMessage("Este link expirou ou já foi usado. Solicite um novo.")
            })
    }, [oobCode])

    const onSubmit = async (data: NewPasswordFormData) => {
        if (!oobCode) return

        try {
            await confirmPasswordReset(auth, oobCode, data.password)
            setStatus("success")
        } catch {
            setErrorMessage("Erro ao redefinir senha. O link pode ter expirado.")
            setStatus("error")
        }
    }

    // CARREGANDO
    if (status === "loading") {
        return (
            <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted">Verificando link...</p>
            </div>
        )
    }

    // ERRO
    if (status === "error") {
        return (
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-white">Link inválido</p>
                    <p className="text-sm text-muted">{errorMessage}</p>
                </div>
                <a
                    href="/reset-password"
                    className="inline-flex items-center justify-center w-full h-11 rounded-md bg-linear-to-r from-primary to-primary-active text-white text-sm font-semibold transition hover:opacity-80"
                >
                    Solicitar novo link
                </a>
            </div>
        )
    }

    // SUCESSO
    if (status === "success") {
        return (
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-white">Senha redefinida!</p>
                    <p className="text-sm text-muted">
                        Sua senha foi atualizada com sucesso.
                    </p>
                </div>
                <a
                    href="/login"
                    className="inline-flex items-center justify-center w-full h-11 rounded-md bg-linear-to-r from-primary to-primary-active text-white text-sm font-semibold transition hover:opacity-80"
                >
                    Ir para o login
                </a>
            </div>
        )
    }

    // FORMULÁRIO
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-muted text-center">
                Redefinindo senha para{" "}
                <span className="text-white">{userEmail}</span>
            </p>

            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white">
                    Nova senha
                </label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                    Confirmar nova senha
                </label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        {...register("confirmPassword")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                    </>
                ) : (
                    <>
                        <KeyRound className="w-4 h-4 mr-2" />
                        Salvar nova senha
                    </>
                )}
            </Button>
        </form>
    )
}
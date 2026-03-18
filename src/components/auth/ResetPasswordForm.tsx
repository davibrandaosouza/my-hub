"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react"

import { resetPasswordSchema } from "@/lib/validations/auth"
import { resetPassword } from "@/lib/firebase/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
    const [firebaseError, setFirebaseError] = useState<string | null>(null)
    const [emailSent, setEmailSent] = useState(false)

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { email: "" },
    })

    const onSubmit = async (data: ResetPasswordFormData) => {
        setFirebaseError(null)

        const { error } = await resetPassword(data.email)

        if (error) {
            setFirebaseError(error)
            return
        }

        // Não informa se o e-mail existe ou não
        setEmailSent(true)
    }

    // TELA DE SUCESSO
    if (emailSent) {
        return (
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-white">E-mail enviado!</p>
                    <p className="text-sm text-muted">
                        Se existe uma conta com{" "}
                        <span className="text-white">{getValues("email")}</span>,
                        você receberá as instruções em breve.
                    </p>
                </div>
                <p className="text-xs text-muted">
                    Não recebeu?{" "}
                    <button
                        onClick={() => setEmailSent(false)}
                        className="text-primary hover:text-primary-hover transition-colors"
                    >
                        Tentar novamente
                    </button>
                </p>
                <a
                    href="/login"
                    className="inline-flex items-center justify-center gap-1 w-full h-11 rounded-md border border-border bg-transparent text-sm font-medium text-foreground transition hover:bg-white/5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                </a>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">

            <p className="text-sm text-muted text-center">
                Digite seu e-mail e enviaremos as instruções para redefinir sua senha.
            </p>

            {/* EMAIL */}
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white">
                    E-mail
                </label>
                <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    disabled={isSubmitting}
                    {...register("email")}
                />
                {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
            </div>

            {/* ERRO FIREBASE */}
            {firebaseError && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <p className="text-sm text-red-400">{firebaseError}</p>
                </div>
            )}

            {/* BOTÃO */}
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    <>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar instruções
                    </>
                )}
            </Button>

            <div className="text-center">
                <a
                    href="/login"
                    className="inline-flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Voltar para o login
                </a>
            </div>
        </form>
    )
}
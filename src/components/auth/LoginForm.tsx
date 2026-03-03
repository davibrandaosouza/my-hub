"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { loginSchema } from "@/lib/validations/auth"
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

type LoginFormData = z.infer<typeof loginSchema>

async function setSessionCookie(token: string) {
    await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
    })
}

export function LoginForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [firebaseError, setFirebaseError] = useState<string | null>(null)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    })

    const onSubmit = async (data: LoginFormData) => {
        setFirebaseError(null)

        const { user, error } = await loginWithEmail(data.email, data.password)

        if (error) {
            setFirebaseError(error)
            return
        }

        if (user) {
            const token = await user.getIdToken()
            setSessionCookie(token)
            router.push("/dashboard")
        }
    }

    const handleGoogleLogin = async () => {
        setFirebaseError(null)
        setIsGoogleLoading(true)

        const { user, error } = await loginWithGoogle()

        if (error) {
            setFirebaseError(error)
            setIsGoogleLoading(false)
            return
        }

        if (user) {
            const token = await user.getIdToken()
            setSessionCookie(token)
            router.push("/dashboard")
        }

        setIsGoogleLoading(false)
    }

    const isLoading = isSubmitting || isGoogleLoading

    return (
        <div className="space-y-4 w-full">

            {/* BOTÃO GOOGLE */}
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-md border border-border bg-transparent text-sm font-medium text-foreground transition hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
                {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                )}
                Continuar com Google
            </button>

            {/* DIVISOR */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            {/* FORMULÁRIO EMAIL/SENHA */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* EMAIL */}
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-white">
                        E-mail
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        disabled={isLoading}
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                {/* SENHA */}
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-white">
                        Senha
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            disabled={isLoading}
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">
                                {showPassword ? "Ocultar senha" : "Mostrar senha"}
                            </span>
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                </div>

                {/* LEMBRAR + ESQUECEU */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="rememberMe"
                            disabled={isLoading}
                            {...register("rememberMe")}
                        />
                        <label
                            htmlFor="rememberMe"
                            className="text-sm font-medium text-muted cursor-pointer"
                        >
                            Lembrar de mim
                        </label>
                    </div>
                    <a href="/reset-password" className="text-sm text-primary hover:text-primary-hover transition-colors">
                        Esqueceu a senha?
                    </a>
                </div>

                {/* ERRO DO FIREBASE */}
                {firebaseError && (
                    <div className="rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3">
                        <p className="text-sm text-red-400">{firebaseError}</p>
                    </div>
                )}

                {/* BOTÃO ENTRAR */}
                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        <>
                            <LogIn className="w-4 h-4 mr-2" />
                            Entrar
                        </>
                    )}
                </Button>

            </form>

            {/* CRIAR CONTA */}
            <p className="text-center text-sm text-muted">
                Não tem uma conta?{" "}
                <a href="/register" className="text-primary hover:text-primary-hover transition-colors">
                    Criar conta
                </a>
            </p>

        </div>
    )
}
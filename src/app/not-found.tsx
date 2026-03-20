"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="text-center space-y-8 max-w-md w-full">

                {/* ── NÚMERO 404 ── */}
                <div className="relative select-none">
                    <p className="text-[180px] font-black leading-none text-white/5">
                        404
                    </p>
                </div>

                {/* ── TEXTO ── */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white">
                        Página não encontrada
                    </h1>
                    <p className="text-sm text-muted">
                        A página não existe ou foi movida.
                    </p>
                </div>

                {/* ── BOTÕES ── */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-transparent text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-sm font-medium text-white hover:opacity-80 transition-opacity"
                    >
                        <Home className="w-4 h-4" />
                        Ir ao Dashboard
                    </button>
                </div>

            </div>
        </div>
    )
}
"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "warning" | "info"

export type Toast = {
    id: string
    message: string
    type: ToastType
    duration?: number
}

const ICONS = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
}

const STYLES = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    error: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    info: "border-primary/30 bg-primary/10 text-primary",
}

type ToastItemProps = {
    toast: Toast
    onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const [visible, setVisible] = useState(false)
    const Icon = ICONS[toast.type]
    const duration = toast.duration ?? 4000

    useEffect(() => {
        // Pequeno delay para ativar a animação de entrada
        const enter = setTimeout(() => setVisible(true), 10)

        // Inicia saída antes do tempo total para animar
        const exit = setTimeout(() => setVisible(false), duration - 300)

        // Remove após a animação de saída
        const remove = setTimeout(() => onRemove(toast.id), duration)

        return () => {
            clearTimeout(enter)
            clearTimeout(exit)
            clearTimeout(remove)
        }
    }, [toast.id, duration, onRemove])

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 min-w-[280px] max-w-[400px]",
                "bg-card-background",
                STYLES[toast.type],
                visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
            )}
        >
            <Icon className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium flex-1 text-white">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

type ToastContainerProps = {
    toasts: Toast[]
    onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-2 items-end">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    )
}
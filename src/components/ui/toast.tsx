"use client"

import { useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

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
    const Icon = ICONS[toast.type]
    const duration = toast.duration ?? 4000

    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), duration)
        return () => clearTimeout(timer)
    }, [toast.id, duration, onRemove])

    return (
        <motion.div
            layout
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] max-w-[400px]",
                "bg-card-background",
                STYLES[toast.type]
            )}
            initial={{ opacity: 0, x: 24, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <Icon className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium flex-1 text-white">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    )
}

type ToastContainerProps = {
    toasts: Toast[]
    onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-2 items-end">
            <AnimatePresence mode="sync">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    )
}
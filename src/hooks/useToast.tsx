import { useState, useCallback } from "react"
import type { Toast, ToastType } from "@/components/ui/toast"

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, type: ToastType = "info", duration?: number) => {
        const id = Math.random().toString(36).slice(2)
        setToasts(prev => [...prev, { id, message, type, duration }])
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = {
        success: (message: string, duration?: number) => addToast(message, "success", duration),
        error: (message: string, duration?: number) => addToast(message, "error", duration),
        warning: (message: string, duration?: number) => addToast(message, "warning", duration),
        info: (message: string, duration?: number) => addToast(message, "info", duration),
    }

    return { toasts, toast, removeToast }
}
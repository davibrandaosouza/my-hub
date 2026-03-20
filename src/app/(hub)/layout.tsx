"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import { createContext, useContext } from "react"
import type { ToastFunction } from "@/types/toast"

// Context para qualquer componente acessar o toast
export const ToastContext = createContext<ToastFunction | null>(null)

export function useToastContext() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("useToastContext deve ser usado dentro do HubLayout")
    return ctx
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
    const { toasts, toast, removeToast } = useToast()

    return (
        <ToastContext.Provider value={toast}>
            <div className="flex h-screen bg-background overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
                <ToastContainer toasts={toasts} onRemove={removeToast} />
            </div>
        </ToastContext.Provider>
    )
}
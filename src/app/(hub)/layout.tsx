"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import { createContext, useContext, useEffect } from "react"
import type { ToastFunction } from "@/types/toast"
import { useAuth } from "@/hooks/useAuth"
import { useSettings } from "@/hooks/useSettings"
import { usePomodoroStore } from "@/hooks/usePomodoroStore"

// Context para qualquer componente acessar o toast
export const ToastContext = createContext<ToastFunction | null>(null)

export function useToastContext() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("useToastContext deve ser usado dentro do HubLayout")
    return ctx
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
    const { toasts, toast, removeToast } = useToast()
    const { user } = useAuth()
    const { loadSettings, settings } = useSettings()

    useEffect(() => {
        if (user?.uid) {
            loadSettings(user.uid)
        }
    }, [user?.uid, loadSettings])

    // Aplicar variáveis de estilo ao tema (Theme Mode e Primary Color)
    useEffect(() => {
        const root = document.documentElement
        root.setAttribute("data-theme", settings.appearance.theme === "system" 
            ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
            : settings.appearance.theme)
            
        root.style.setProperty("--primary", settings.appearance.primaryColor)
    }, [settings.appearance.theme, settings.appearance.primaryColor])

    // Sincronizar Pomodoro settings
    useEffect(() => {
        usePomodoroStore.getState().setSettings({
            focusDuration: settings.pomodoro.workTime,
            breakDuration: settings.pomodoro.breakTime
        })
    }, [settings.pomodoro.workTime, settings.pomodoro.breakTime])

    return (
        <ToastContext.Provider value={toast}>
            <div className="flex h-screen bg-background overflow-hidden relative">
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
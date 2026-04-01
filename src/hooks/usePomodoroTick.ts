"use client"

import { useEffect } from "react"
import { usePomodoroStore } from "@/hooks/usePomodoroStore"
import { useAppEffects } from "@/hooks/useAppEffects"

export function usePomodoroTick() {
    const { status, tick, mode } = usePomodoroStore()
    const { playSound, sendNotification } = useAppEffects()

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (status === "running") {
            interval = setInterval(() => {
                tick()
            }, 1000)
        } else if (interval) {
            clearInterval(interval)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [status, tick])

    // Detectar quando a sessão termina (mudança de modo)
    useEffect(() => {
        if (status === "running") {
            const label = mode === "focus" ? "Descanso encerrado! Hora de focar." : "Sessão focada concluída! Hora do descanso."
            const body = mode === "focus" ? "Bora continuar os estudos?" : "Você merece uma pausa."
            
            playSound("alert")
            sendNotification(label, body)
        }
    }, [mode, status, playSound, sendNotification])
}

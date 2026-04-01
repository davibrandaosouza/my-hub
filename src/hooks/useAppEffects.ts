"use client"

import { useCallback } from "react"
import { useSettings } from "@/hooks/useSettings"

const SUCCESS_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
const ALERT_SOUND = "https://assets.mixkit.co/active_storage/sfx/2861/2861-preview.mp3"

export function useAppEffects() {
    const { settings } = useSettings()

    const playSound = useCallback((type: "success" | "alert" = "success") => {
        if (!settings.behavior.soundEffects) return

        const audio = new Audio(type === "success" ? SUCCESS_SOUND : ALERT_SOUND)
        audio.volume = 0.5
        audio.play().catch(err => console.warn("Erro ao reproduzir som:", err))
    }, [settings.behavior.soundEffects])

    const sendNotification = useCallback((title: string, body?: string) => {
        if (!settings.behavior.notifications) return

        if (!("Notification" in window)) {
            console.warn("Este navegador não suporta notificações de desktop.")
            return
        }

        if (Notification.permission === "granted") {
            new Notification(title, { body, icon: "/favicon.ico" })
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body, icon: "/favicon.ico" })
                }
            })
        }
    }, [settings.behavior.notifications])

    return { playSound, sendNotification }
}

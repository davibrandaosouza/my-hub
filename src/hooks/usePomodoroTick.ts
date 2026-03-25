"use client"

import { useEffect } from "react"
import { usePomodoroStore } from "@/hooks/usePomodoroStore"

export function usePomodoroTick() {
    const { status, tick } = usePomodoroStore()

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
}

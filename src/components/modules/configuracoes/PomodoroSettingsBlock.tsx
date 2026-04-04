"use client"

import { useSettings } from "@/hooks/useSettings"
import { useAuth } from "@/hooks/useAuth"
import { Timer } from "lucide-react"
import { useToastContext } from "@/app/(hub)/layout"

export function PomodoroSettingsBlock() {
    const { user } = useAuth()
    const { settings, updatePomodoro } = useSettings()
    const toast = useToastContext()

    const handlePomodoroChange = async (type: "workTime" | "breakTime", value: string) => {
        if (!user?.uid) return
        const numValue = parseInt(value, 10)
        if (isNaN(numValue) || numValue < 1 || numValue > 120) {
            toast.error("O tempo deve estar entre 1 e 120 minutos.")
            return
        }

        await updatePomodoro(user.uid, { [type]: numValue })
    }

    return (
        <div className="rounded-xl border border-border bg-card-background p-6">
            <div className="flex items-center gap-2 mb-6 text-foreground font-medium">
                <Timer className="w-5 h-5 text-primary" />
                <h2>Pomodoro Padrão</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Tempo de Trabalho (min)</label>
                    <input
                        type="number"
                        min="1"
                        max="120"
                        value={settings.pomodoro.workTime}
                        onChange={(e) => handlePomodoroChange("workTime", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Tempo de Descanso (min)</label>
                    <input
                        type="number"
                        min="1"
                        max="120"
                        value={settings.pomodoro.breakTime}
                        onChange={(e) => handlePomodoroChange("breakTime", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            <p className="text-xs text-muted mt-4">
                Lembre-se: mudar os tempos padrões entra em vigor para as próximas sessões, e não para as que já estão ativas.
            </p>
        </div>
    )
}

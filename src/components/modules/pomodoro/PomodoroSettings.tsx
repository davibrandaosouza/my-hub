"use client"

import { usePomodoroStore } from "@/hooks/usePomodoroStore"
import { useState } from "react"
import { Check } from "lucide-react"

interface PomodoroSettingsProps {
    onClose: () => void
}

export function PomodoroSettings({ onClose }: PomodoroSettingsProps) {
    const { settings, setSettings } = usePomodoroStore()

    const [focus, setFocus] = useState(settings.focusDuration)
    const [breakDuration, setBreakDuration] = useState(settings.breakDuration)
    const [sessions, setSessions] = useState(settings.sessionsUntilLongBreak)

    const handleApply = () => {
        setSettings({
            focusDuration: focus,
            breakDuration: breakDuration,
            sessionsUntilLongBreak: sessions,
        })
        onClose()
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="grid grid-cols-3 items-center gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted font-semibold">Trabalho</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={focus}
                            onChange={(e) => setFocus(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary/50 transition-colors"
                        />
                        <span className="text-xs text-muted">min</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted font-semibold">Descanso</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={breakDuration}
                            onChange={(e) => setBreakDuration(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary/50 transition-colors"
                        />
                        <span className="text-xs text-muted">min</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted font-semibold">Sessões</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={sessions}
                            onChange={(e) => setSessions(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    onClick={handleApply}
                    className="bg-primary/20 text-primary hover:bg-primary/30 px-6 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                >
                    <Check className="w-4 h-4" />
                    <span>Aplicar Alterações</span>
                </button>
            </div>
        </div>
    )
}

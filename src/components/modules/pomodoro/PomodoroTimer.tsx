"use client"

import { usePomodoroStore } from "@/hooks/usePomodoroStore"
import { Play, Pause, RotateCcw, SkipForward, Settings as SettingsIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { PomodoroSettings } from "./PomodoroSettings"

export function PomodoroTimer() {
    const {
        timeLeft,
        status,
        mode,
        settings,
        startTimer,
        pauseTimer,
        resetTimer,
        skipSession,
        sessionsInCycle,
        activeTaskId,
        tasks
    } = usePomodoroStore()

    const [showSettings, setShowSettings] = useState(false)

    const activeTask = tasks.find(t => t.id === activeTaskId)

    const getTotalTime = () => {
        if (mode === "focus") return settings.focusDuration * 60
        return settings.breakDuration * 60
    }

    const totalTime = getTotalTime()
    const progress = (timeLeft / totalTime) * 100
    const circumference = 2 * Math.PI * 140 // radius = 140
    const offset = circumference - (progress / 100) * circumference

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getModeLabel = () => {
        if (mode === "focus") return `Sessão ${sessionsInCycle + 1} de ${settings.sessionsUntilLongBreak}`
        return "Descanso"
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-10">
            {/* Tarefa atual */}
            <div className="text-center h-6">
                {activeTask ? (
                    <p className="text-muted text-sm animate-in fade-in slide-in-from-bottom-2">
                        {activeTask.text}
                    </p>
                ) : (
                    <p className="text-muted/40 text-sm">Nenhuma tarefa selecionada</p>
                )}
            </div>

            {/* Circulo do timer */}
            <div className="relative flex items-center justify-center">
                <svg className="w-80 h-80 -rotate-90 transform">
                    {/* Circulo de fundo */}
                    <circle
                        cx="160"
                        cy="160"
                        r="140"
                        className="stroke-white/5 fill-none"
                        strokeWidth="8"
                    />
                    {/* Circulo de progresso */}
                    <circle
                        cx="160"
                        cy="160"
                        r="140"
                        className={cn(
                            "fill-none transition-all duration-1000 ease-linear",
                            mode === "focus" ? "stroke-primary" : "stroke-amber-500"
                        )}
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Exibição do tempo */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-6xl font-bold tracking-tighter text-white tabular-nums">
                        {formatTime(timeLeft)}
                    </span>
                    <span className="text-sm text-muted mt-1 font-medium">
                        {getModeLabel()}
                    </span>
                </div>
            </div>

            {/* Botões de controle */}
            <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={resetTimer}
                        className="p-3 rounded-2xl bg-white/5 text-muted hover:text-white transition-colors"
                        title="Reiniciar"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>

                    <button
                        onClick={status === "running" ? pauseTimer : startTimer}
                        className={cn(
                            "flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg active:scale-95",
                            status === "running"
                                ? "bg-white/10 text-white hover:bg-white/20"
                                : "bg-primary text-white hover:bg-primary-active shadow-primary/20"
                        )}
                    >
                        {status === "running" ? (
                            <>
                                <Pause className="w-6 h-6 fill-current" />
                                <span>Pausar</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-6 h-6 fill-current" />
                                <span>Iniciar</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={skipSession}
                        className="p-3 rounded-2xl bg-white/5 text-muted hover:text-white transition-colors"
                        title="Pular"
                    >
                        <SkipForward className="w-5 h-5" />
                    </button>
                </div>

                {/* Botão de configurações */}
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 text-xs text-muted hover:text-white transition-colors group"
                >
                    <SettingsIcon className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span>Ajustar timer</span>
                </button>

                {/* Painel de configurações */}
                <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out w-full max-w-md",
                    showSettings ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
                )}>
                    <PomodoroSettings onClose={() => setShowSettings(false)} />
                </div>
            </div>
        </div>
    )
}

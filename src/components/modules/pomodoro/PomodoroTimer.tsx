"use client"

import { usePomodoroStore } from "@/hooks/usePomodoroStore"
import { Play, Pause, RotateCcw, SkipForward, Settings as SettingsIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { PomodoroSettings } from "./PomodoroSettings"
import { AnimatePresence, motion } from "framer-motion"

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
    const circumference = 2 * Math.PI * 140 // Raio = 140
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
                <svg viewBox="0 0 320 320" className="w-full max-w-[240px] sm:max-w-80 aspect-square -rotate-90 transform">
                     {/* Circulo de fundo */}
                     <circle
                         cx="160"
                         cy="160"
                         r="140"
                         className="stroke-foreground/5 fill-none"
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
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-foreground">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={mode}
                            className="text-5xl sm:text-6xl font-bold tracking-tighter tabular-nums leading-none"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            {formatTime(timeLeft)}
                        </motion.span>
                    </AnimatePresence>
                    <span className="text-sm text-muted mt-1 font-medium">
                        {getModeLabel()}
                    </span>
                </div>
            </div>

            {/* Botões de controle */}
            <div className="flex flex-col items-center gap-6 w-full px-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4 w-full sm:w-auto">
                    {/* Botão Principal: Iniciar/Pausar */}
                    <motion.button
                        onClick={status === "running" ? pauseTimer : startTimer}
                        whileTap={{ scale: 0.96 }}
                        className={cn(
                            "order-1 sm:order-2 flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-semibold transition-colors shadow-lg w-full sm:w-auto",
                            status === "running"
                                ? "bg-foreground/10 text-foreground hover:bg-foreground/20"
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
                    </motion.button>

                    {/* Botões Secundários: Reiniciar e Pular */}
                    <div className="order-2 sm:order-1 flex items-center justify-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={resetTimer}
                            className="p-4 rounded-2xl bg-foreground/5 text-muted hover:text-foreground transition-colors flex-1 sm:flex-none flex justify-center"
                            title="Reiniciar"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>

                        <button
                            onClick={skipSession}
                            className="p-4 rounded-2xl bg-foreground/5 text-muted hover:text-foreground transition-colors flex-1 sm:flex-none flex justify-center sm:order-3"
                            title="Pular"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Botão de configurações */}
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 text-xs text-muted hover:text-foreground transition-colors group mt-2"
                >
                    <SettingsIcon className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span>Ajustar timer</span>
                </button>

                {/* Painel de configurações */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            className="overflow-hidden w-full max-w-[340px] sm:max-w-md mx-auto"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                            <div className="mt-4">
                                <PomodoroSettings onClose={() => setShowSettings(false)} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

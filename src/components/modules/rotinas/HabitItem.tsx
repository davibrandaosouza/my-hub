"use client"

import { Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import type { Habit, HabitLog } from "@/types/habit"
import { AnimatePresence, motion } from "framer-motion"

interface Props {
    habit: Habit
    log: HabitLog | undefined
    onToggle: (habitId: string, current: boolean) => Promise<void>
    onDelete: (habitId: string) => Promise<void>
}

export function HabitItem({ habit, log, onToggle, onDelete }: Props) {
    const [isToggling, setIsToggling] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const completed = log?.completed ?? false

    async function handleToggle() {
        if (isToggling) return
        setIsToggling(true)
        await onToggle(habit.id, completed)
        setIsToggling(false)
    }

    return (
        <motion.div
            layout
            className={`
                flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border transition-colors duration-200 group
                ${completed
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card-background hover:border-border/80 hover:bg-foreground/2"
                }
            `}
        >
            {/* Checkbox */}
            <button
                onClick={handleToggle}
                disabled={isToggling}
                className="shrink-0 focus:outline-none disabled:opacity-50"
                role="checkbox"
                aria-checked={completed}
                aria-label={completed ? "Desmarcar hábito" : "Marcar hábito como completo"}
            >
                <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                    ${completed
                        ? "border-primary bg-primary"
                        : "border-muted/50 hover:border-primary/60"
                    }
                `}>
                    {isToggling ? (
                        <Loader2 className="w-3 h-3 text-white animate-spin" />
                    ) : completed && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none">
                            <path
                                d="M1 5l3.5 3.5L11 1"
                                stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </div>
            </button>

            {/* Emoji */}
            <span className="text-lg select-none shrink-0">{habit.emoji}</span>

            {/* Nome */}
            <span className={`flex-1 text-xs sm:text-sm font-medium transition-all duration-200 ${completed ? "line-through text-muted" : "text-foreground"}`}>
                {habit.name}
            </span>

            {/* XP */}
            <span className="text-xs text-orange-400 font-semibold shrink-0 flex items-center gap-1">
                🔥 {habit.xp}
            </span>

            {/* Ações / Confirmação */}
            <div className="flex items-center gap-2 ml-1">
                <AnimatePresence mode="wait">
                    {showConfirm ? (
                        <motion.div
                            key="confirm"
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ duration: 0.15 }}
                        >
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="text-[10px] font-bold text-muted hover:text-foreground uppercase tracking-wider"
                            >
                                Não
                            </button>
                            <button
                                onClick={() => onDelete(habit.id)}
                                className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider"
                            >
                                Sim, excluir
                            </button>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="delete"
                            onClick={() => setShowConfirm(true)}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-400"
                            aria-label="Excluir hábito"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

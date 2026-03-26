"use client"

import { Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import type { Habit, HabitLog } from "@/types/habit"

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
        <div
            className={`
                flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 group
                ${completed
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card-background hover:border-border/80 hover:bg-white/2"
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
            <span className="text-xl select-none">{habit.emoji}</span>

            {/* Nome */}
            <span className={`flex-1 text-sm font-medium transition-all duration-200 ${completed ? "line-through text-muted" : "text-white"}`}>
                {habit.name}
            </span>

            {/* XP */}
            <span className="text-xs text-orange-400 font-semibold shrink-0 flex items-center gap-1">
                🔥 {habit.xp}
            </span>

            {/* Ações / Confirmação */}
            <div className="flex items-center gap-2 ml-1">
                {showConfirm ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="text-[10px] font-bold text-muted hover:text-white uppercase tracking-wider"
                        >
                            Não
                        </button>
                        <button
                            onClick={() => onDelete(habit.id)}
                            className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider"
                        >
                            Sim, excluir
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-400"
                        aria-label="Excluir hábito"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}

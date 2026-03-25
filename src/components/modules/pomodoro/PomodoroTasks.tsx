"use client"

import { usePomodoroStore } from "@/hooks/usePomodoroStore"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function PomodoroTasks() {
    const { tasks, activeTaskId, addTask, removeTask, toggleTask, setActiveTask } = usePomodoroStore()
    const [newTaskText, setNewTaskText] = useState("")

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault()
        if (newTaskText.trim()) {
            addTask(newTaskText.trim())
            setNewTaskText("")
        }
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center gap-2 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fila de Tarefas</h3>
            </div>

            {/* Adicionar tarefa */}
            <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Adicionar tarefa..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-hidden focus:border-primary/50 transition-colors"
                />
                <button
                    type="submit"
                    className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>

            {/* Lista de tarefas */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-40">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                            <Plus className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-muted max-w-[150px]">
                            Clique no + para adicionar sua primeira tarefa
                        </p>
                    </div>
                ) : (
                    tasks.map((task) => {
                        const isActive = task.id === activeTaskId

                        return (
                            <div
                                key={task.id}
                                className={cn(
                                    "group relative flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer",
                                    isActive
                                        ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                                        : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
                                )}
                                onClick={() => setActiveTask(task.id)}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleTask(task.id)
                                    }}
                                    className={cn(
                                        "shrink-0 transition-colors",
                                        task.completed ? "text-primary" : "text-muted group-hover:text-white/60"
                                    )}
                                >
                                    {task.completed ? (
                                        <CheckCircle2 className="w-5 h-5 fill-primary/20" />
                                    ) : (
                                        <Circle className="w-5 h-5" />
                                    )}
                                </button>

                                <span className={cn(
                                    "flex-1 text-sm transition-all",
                                    task.completed ? "text-muted line-through" : "text-white/90",
                                    isActive && !task.completed && "font-medium"
                                )}>
                                    {task.text}
                                </span>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeTask(task.id)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-red-400 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {isActive && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

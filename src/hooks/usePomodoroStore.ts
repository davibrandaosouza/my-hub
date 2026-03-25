"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type PomodoroMode = "focus" | "break"

export interface Task {
    id: string
    text: string
    completed: boolean
    createdAt: number
}

interface PomodoroSettings {
    focusDuration: number // in minutes
    breakDuration: number
    sessionsUntilLongBreak: number // Still used to track cycle reset
}

interface PomodoroStats {
    totalFocusMinutes: number
    sessionsCompleted: number
    tasksCompleted: number
    lastUpdated: string // YYYY-MM-DD
}

interface PomodoroState {
    // Timer State
    mode: PomodoroMode
    status: "idle" | "running" | "paused"
    timeLeft: number // in seconds
    sessionsInCycle: number // resets after long break or goal reached
    
    // Tasks State
    tasks: Task[]
    activeTaskId: string | null
    
    // Settings
    settings: PomodoroSettings
    
    // Stats
    stats: PomodoroStats
    
    // Actions
    startTimer: () => void
    pauseTimer: () => void
    resetTimer: () => void
    skipSession: () => void
    tick: () => void
    
    setSettings: (settings: Partial<PomodoroSettings>) => void
    setMode: (mode: PomodoroMode) => void
    
    addTask: (text: string) => void
    removeTask: (id: string) => void
    toggleTask: (id: string) => void
    setActiveTask: (id: string | null) => void
    
    updateStats: (focusMinutes: number) => void
}

const DEFAULT_SETTINGS: PomodoroSettings = {
    focusDuration: 25,
    breakDuration: 5,
    sessionsUntilLongBreak: 4,
}

const getTodayStr = () => new Date().toISOString().split('T')[0]

export const usePomodoroStore = create<PomodoroState>()(
    persist(
        (set, get) => ({
            mode: "focus",
            status: "idle",
            timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
            sessionsInCycle: 0,
            tasks: [],
            activeTaskId: null,
            settings: DEFAULT_SETTINGS,
            stats: {
                totalFocusMinutes: 0,
                sessionsCompleted: 0,
                tasksCompleted: 0,
                lastUpdated: getTodayStr(),
            },

            startTimer: () => set({ status: "running" }),
            pauseTimer: () => set({ status: "paused" }),
            
            resetTimer: () => {
                const { mode, settings } = get()
                const duration = mode === "focus" ? settings.focusDuration : settings.breakDuration
                set({ status: "idle", timeLeft: duration * 60 })
            },

            skipSession: () => {
                const { mode, sessionsInCycle, settings } = get()
                let nextMode: PomodoroMode = "focus"
                let nextSessionsInCycle = sessionsInCycle

                if (mode === "focus") {
                    nextSessionsInCycle += 1
                    nextMode = "break"
                } else {
                    if (sessionsInCycle >= settings.sessionsUntilLongBreak) {
                        nextSessionsInCycle = 0
                    }
                    nextMode = "focus"
                }

                const nextDuration = nextMode === "focus" 
                    ? settings.focusDuration 
                    : settings.breakDuration

                set({
                    mode: nextMode,
                    sessionsInCycle: nextSessionsInCycle,
                    timeLeft: nextDuration * 60,
                    status: "idle"
                })
            },

            tick: () => {
                const { timeLeft, status, mode, settings, sessionsInCycle, updateStats } = get()
                if (status !== "running") return

                if (timeLeft > 0) {
                    set({ timeLeft: timeLeft - 1 })
                } else {
                    // Timer finished
                    let nextMode: PomodoroMode = "focus"
                    let nextSessionsInCycle = sessionsInCycle

                    if (mode === "focus") {
                        updateStats(settings.focusDuration)
                        nextSessionsInCycle += 1
                        nextMode = "break"
                    } else {
                        if (sessionsInCycle >= settings.sessionsUntilLongBreak) {
                            nextSessionsInCycle = 0
                        }
                        nextMode = "focus"
                    }

                    const nextDuration = nextMode === "focus" 
                        ? settings.focusDuration 
                        : settings.breakDuration

                    set({
                        mode: nextMode,
                        sessionsInCycle: nextSessionsInCycle,
                        timeLeft: nextDuration * 60,
                        status: "running" // Auto-start next session
                    })
                }
            },

            setSettings: (newSettings) => {
                const updatedSettings = { ...get().settings, ...newSettings }
                set({ settings: updatedSettings })
                // If idle, update timeLeft to match new duration
                if (get().status === "idle") {
                    const { mode } = get()
                    const duration = mode === "focus" ? updatedSettings.focusDuration : updatedSettings.breakDuration
                    set({ timeLeft: duration * 60 })
                }
            },

            setMode: (mode) => {
                const { settings } = get()
                const duration = mode === "focus" ? settings.focusDuration : settings.breakDuration
                set({ mode, timeLeft: duration * 60, status: "idle" })
            },

            addTask: (text) => set((state) => ({
                tasks: [
                    ...state.tasks,
                    { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() }
                ]
            })),

            removeTask: (id) => set((state) => ({
                tasks: state.tasks.filter(t => t.id !== id),
                activeTaskId: state.activeTaskId === id ? null : state.activeTaskId
            })),

            toggleTask: (id) => set((state) => {
                const newTasks = state.tasks.map(t => 
                    t.id === id ? { ...t, completed: !t.completed } : t
                )
                const completedCount = newTasks.filter(t => t.completed).length
                const oldCompletedCount = state.tasks.filter(t => t.completed).length
                
                return {
                    tasks: newTasks,
                    stats: {
                        ...state.stats,
                        tasksCompleted: state.stats.tasksCompleted + (completedCount - oldCompletedCount)
                    }
                }
            }),

            setActiveTask: (id) => set({ activeTaskId: id }),

            updateStats: (focusMinutes) => set((state) => {
                const today = getTodayStr()
                const resetStats = state.stats.lastUpdated !== today
                
                return {
                    stats: {
                        totalFocusMinutes: (resetStats ? 0 : state.stats.totalFocusMinutes) + focusMinutes,
                        sessionsCompleted: (resetStats ? 0 : state.stats.sessionsCompleted) + 1,
                        tasksCompleted: resetStats ? 0 : state.stats.tasksCompleted,
                        lastUpdated: today
                    }
                }
            })
        }),
        {
            name: "pomodoro-storage",
        }
    )
)

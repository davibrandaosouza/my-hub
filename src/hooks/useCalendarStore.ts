import { create } from "zustand"
import type {
    CalendarEvent,
    CalendarTask,
    CalendarCategory,
    CalendarViewMode,
} from "@/types/calendario"
import {
    getCalendarEvents,
    saveCalendarEvent,
    deleteCalendarEvent as fbDeleteEvent,
    getCalendarTasks,
    saveCalendarTask,
    deleteCalendarTask as fbDeleteTask,
    getCalendarCategories,
    saveCalendarCategory,
    deleteCalendarCategory,
} from "@/lib/firebase/calendario"

type WeeklyTab = "eventos" | "planejamentos" | "tarefas"

interface CalendarState {
    // ── Data ──
    events: CalendarEvent[]
    tasks: CalendarTask[]
    categories: CalendarCategory[]
    loading: boolean

    // ── UI state ──
    viewMode: CalendarViewMode
    currentDate: Date
    activeTab: WeeklyTab
    categoryFilter: string[] // IDs of visible categories (empty = all)
    modalOpen: boolean
    editingEvent: CalendarEvent | null
    selectedEvent: CalendarEvent | null

    // ── Actions ──
    setViewMode: (mode: CalendarViewMode) => void
    setCurrentDate: (date: Date) => void
    navigateForward: () => void
    navigateBackward: () => void
    goToToday: () => void
    setActiveTab: (tab: WeeklyTab) => void
    toggleCategoryFilter: (categoryId: string) => void
    setModalOpen: (open: boolean) => void
    setEditingEvent: (event: CalendarEvent | null) => void
    setSelectedEvent: (event: CalendarEvent | null) => void

    // ── Data operations ──
    loadData: (userId: string) => Promise<void>
    addEvent: (userId: string, event: CalendarEvent) => Promise<{ error: string | null }>
    updateEvent: (userId: string, event: CalendarEvent) => Promise<{ error: string | null }>
    deleteEvent: (userId: string, eventId: string) => Promise<{ error: string | null }>
    duplicateEvent: (userId: string, event: CalendarEvent) => Promise<{ error: string | null }>
    moveEvent: (userId: string, eventId: string, newStart: string, newEnd: string) => Promise<{ error: string | null }>
    addTask: (userId: string, task: CalendarTask) => Promise<{ error: string | null }>
    deleteTask: (userId: string, taskId: string) => Promise<{ error: string | null }>
    markTaskScheduled: (taskId: string) => void
    addCategory: (userId: string, category: CalendarCategory) => Promise<{ error: string | null }>
    updateCategory: (userId: string, category: CalendarCategory) => Promise<{ error: string | null }>
    deleteCategory: (userId: string, categoryId: string) => Promise<{ error: string | null }>
}

export const useCalendarStore = create<CalendarState>()((set, get) => ({
    events: [],
    tasks: [],
    categories: [],
    loading: true,

    viewMode: "week",
    currentDate: new Date(),
    activeTab: "eventos",
    categoryFilter: [],
    modalOpen: false,
    editingEvent: null,
    selectedEvent: null,

    setViewMode: (mode) => set({ viewMode: mode }),
    setCurrentDate: (date) => set({ currentDate: date }),

    navigateForward: () => {
        const { currentDate, viewMode } = get()
        const next = new Date(currentDate)
        if (viewMode === "month") next.setMonth(next.getMonth() + 1)
        else if (viewMode === "week") next.setDate(next.getDate() + 7)
        else next.setDate(next.getDate() + 1)
        set({ currentDate: next })
    },

    navigateBackward: () => {
        const { currentDate, viewMode } = get()
        const prev = new Date(currentDate)
        if (viewMode === "month") prev.setMonth(prev.getMonth() - 1)
        else if (viewMode === "week") prev.setDate(prev.getDate() - 7)
        else prev.setDate(prev.getDate() - 1)
        set({ currentDate: prev })
    },

    goToToday: () => set({ currentDate: new Date() }),

    setActiveTab: (tab) => set({ activeTab: tab }),

    toggleCategoryFilter: (categoryId) => {
        const { categoryFilter } = get()
        if (categoryFilter.includes(categoryId)) {
            set({ categoryFilter: categoryFilter.filter(id => id !== categoryId) })
        } else {
            set({ categoryFilter: [...categoryFilter, categoryId] })
        }
    },

    setModalOpen: (open) => set({ modalOpen: open }),
    setEditingEvent: (event) => set({ editingEvent: event }),
    setSelectedEvent: (event) => set({ selectedEvent: event }),

    // ── DATA ──

    loadData: async (userId) => {
        set({ loading: true })
        const [events, tasks, categories] = await Promise.all([
            getCalendarEvents(userId),
            getCalendarTasks(userId),
            getCalendarCategories(userId),
        ])
        set({
            events,
            tasks,
            categories,
            loading: false,
        })
    },

    addEvent: async (userId, event) => {
        // Optimistic
        set(s => ({ events: [event, ...s.events] }))
        const { error } = await saveCalendarEvent(userId, event)
        if (error) {
            set(s => ({ events: s.events.filter(e => e.id !== event.id) }))
        }
        return { error }
    },

    updateEvent: async (userId, event) => {
        const prev = get().events
        set(s => ({ events: s.events.map(e => e.id === event.id ? event : e) }))
        const { error } = await saveCalendarEvent(userId, event)
        if (error) {
            set({ events: prev })
        }
        return { error }
    },

    deleteEvent: async (userId, eventId) => {
        const prev = get().events
        set(s => ({ events: s.events.filter(e => e.id !== eventId) }))
        const { error } = await fbDeleteEvent(userId, eventId)
        if (error) {
            set({ events: prev })
        }
        return { error }
    },

    duplicateEvent: async (userId, event) => {
        const newEvent: CalendarEvent = {
            ...event,
            id: crypto.randomUUID(),
            title: `${event.title} (cópia)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        return get().addEvent(userId, newEvent)
    },

    moveEvent: async (userId, eventId, newStart, newEnd) => {
        const event = get().events.find(e => e.id === eventId)
        if (!event) return { error: "Evento não encontrado." }
        const updated = { ...event, start: newStart, end: newEnd, updatedAt: Date.now() }
        return get().updateEvent(userId, updated)
    },

    addTask: async (userId, task) => {
        set(s => ({ tasks: [task, ...s.tasks] }))
        const { error } = await saveCalendarTask(userId, task)
        if (error) {
            set(s => ({ tasks: s.tasks.filter(t => t.id !== task.id) }))
        }
        return { error }
    },

    deleteTask: async (userId, taskId) => {
        const prev = get().tasks
        set(s => ({ tasks: s.tasks.filter(t => t.id !== taskId) }))
        const { error } = await fbDeleteTask(userId, taskId)
        if (error) {
            set({ tasks: prev })
        }
        return { error }
    },

    markTaskScheduled: (taskId) => {
        set(s => ({
            tasks: s.tasks.map(t => t.id === taskId ? { ...t, scheduled: true } : t),
        }))
    },

    addCategory: async (userId, category) => {
        set(s => ({ categories: [...s.categories, category] }))
        const { error } = await saveCalendarCategory(userId, category)
        if (error) {
            set(s => ({ categories: s.categories.filter(c => c.id !== category.id) }))
        }
        return { error }
    },

    updateCategory: async (userId, category) => {
        const prev = get().categories
        set(s => ({ categories: s.categories.map(c => c.id === category.id ? category : c) }))
        const { error } = await saveCalendarCategory(userId, category)
        if (error) {
            set({ categories: prev })
        }
        return { error }
    },

    deleteCategory: async (userId, categoryId) => {
        const prev = get().categories
        set(s => ({ categories: s.categories.filter(c => c.id !== categoryId) }))
        const { error } = await deleteCalendarCategory(userId, categoryId)
        if (error) {
            set({ categories: prev })
        }
        return { error }
    },
}))

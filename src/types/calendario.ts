export type CalendarViewMode = "month" | "week" | "day"

export type CalendarCategory = {
    id: string
    name: string
    color: string // hex color
}

export type EventRepeat = "never" | "daily" | "weekly" | "monthly" | "yearly"

export type CalendarEvent = {
    id: string
    userId: string
    title: string
    start: string       // ISO datetime "YYYY-MM-DDTHH:mm"
    end: string         // ISO datetime "YYYY-MM-DDTHH:mm"
    allDay: boolean
    repeat: EventRepeat
    categoryId: string
    description?: string
    linkUrl?: string
    createdAt: number
    updatedAt: number
}

export type CalendarTask = {
    id: string
    userId: string
    title: string
    categoryId: string
    scheduled: boolean
    createdAt: number
}

export const DEFAULT_CATEGORIES: CalendarCategory[] = []

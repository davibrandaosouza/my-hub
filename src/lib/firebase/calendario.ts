import {
    doc,
    setDoc,
    deleteDoc,
    collection,
    query,
    getDocs,
    orderBy,
} from "firebase/firestore"
import { db } from "./config"
import type { CalendarEvent, CalendarTask, CalendarCategory } from "@/types/calendario"

// ══════════════════════════════════════════════
// ESTRUTURA DO FIRESTORE
//
// calendario/{userId}/events/{eventId}       → eventos do calendário
// calendario/{userId}/tasks/{taskId}         → tarefas manuais do painel
// calendario/{userId}/categories/{catId}     → categorias personalizadas
// ══════════════════════════════════════════════

// ── EVENTOS ─────────────────────────────────

export async function getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    try {
        const ref = collection(db, "calendario", userId, "events")
        const q = query(ref, orderBy("createdAt", "desc"))
        const snap = await getDocs(q)
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as CalendarEvent))
    } catch {
        return []
    }
}

export async function saveCalendarEvent(
    userId: string,
    event: CalendarEvent
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "calendario", userId, "events", event.id)
        await setDoc(ref, event, { merge: true })
        return { error: null }
    } catch {
        return { error: "Erro ao salvar evento." }
    }
}

export async function deleteCalendarEvent(
    userId: string,
    eventId: string
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "calendario", userId, "events", eventId)
        await deleteDoc(ref)
        return { error: null }
    } catch {
        return { error: "Erro ao deletar evento." }
    }
}

// ── TAREFAS ─────────────────────────────────

export async function getCalendarTasks(userId: string): Promise<CalendarTask[]> {
    try {
        const ref = collection(db, "calendario", userId, "tasks")
        const q = query(ref, orderBy("createdAt", "desc"))
        const snap = await getDocs(q)
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as CalendarTask))
    } catch {
        return []
    }
}

export async function saveCalendarTask(
    userId: string,
    task: CalendarTask
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "calendario", userId, "tasks", task.id)
        await setDoc(ref, task, { merge: true })
        return { error: null }
    } catch {
        return { error: "Erro ao salvar tarefa." }
    }
}

export async function deleteCalendarTask(
    userId: string,
    taskId: string
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "calendario", userId, "tasks", taskId)
        await deleteDoc(ref)
        return { error: null }
    } catch {
        return { error: "Erro ao deletar tarefa." }
    }
}

// ── CATEGORIAS ─────────────────────────────

export async function getCalendarCategories(userId: string): Promise<CalendarCategory[]> {
    try {
        const ref = collection(db, "calendario", userId, "categories")
        const snap = await getDocs(ref)
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as CalendarCategory))
    } catch {
        return []
    }
}

export async function saveCalendarCategory(
    userId: string,
    category: CalendarCategory
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "calendario", userId, "categories", category.id)
        await setDoc(ref, category, { merge: true })
        return { error: null }
    } catch {
        return { error: "Erro ao salvar categoria." }
    }
}

export async function deleteCalendarCategory(
    userId: string,
    categoryId: string
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "calendario", userId, "categories", categoryId)
        await deleteDoc(ref)
        return { error: null }
    } catch {
        return { error: "Erro ao deletar categoria." }
    }
}

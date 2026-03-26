import {
    doc,
    setDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
} from "firebase/firestore"
import { db } from "./config"
import type { Habit, HabitLog } from "@/types/habit"

// ══════════════════════════════════════════════
// ESTRUTURA DO FIRESTORE
//
// habitos/{userId}/items/{habitId}       → configuração do hábito
// habitos/{userId}/logs/{logId}          → log de execução por dia
//   logId = "{userId}_{date}_{habitId}"
// ══════════════════════════════════════════════

function getLogId(userId: string, date: string, habitId: string): string {
    return `${userId}_${date}_${habitId}`
}

// ── HÁBITOS ─────────────────────────────────

export async function getHabits(userId: string): Promise<Habit[]> {
    try {
        const ref = collection(db, "habitos", userId, "items")
        const q = query(ref, orderBy("createdAt", "asc"))
        const snap = await getDocs(q)
        return snap.docs.map(d => d.data() as Habit)
    } catch {
        return []
    }
}

export async function saveHabit(
    userId: string,
    habit: Habit
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "habitos", userId, "items", habit.id)
        await setDoc(ref, habit, { merge: true })
        return { error: null }
    } catch {
        return { error: "Erro ao salvar hábito." }
    }
}

export async function deleteHabit(
    userId: string,
    habitId: string
): Promise<{ error: string | null }> {
    try {
        // 1. Deletar todos os logs associados a este hábito
        const logsRef = collection(db, "habitos", userId, "logs")
        const q = query(logsRef, where("habitId", "==", habitId))
        const snap = await getDocs(q)
        
        const deletePromises = snap.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)

        // 2. Deletar a configuração do hábito
        const ref = doc(db, "habitos", userId, "items", habitId)
        await deleteDoc(ref)
        
        return { error: null }
    } catch {
        return { error: "Erro ao deletar hábito e seus registros." }
    }
}

// ── LOGS ────────────────────────────────────

export async function getTodayLogs(
    userId: string,
    date: string
): Promise<HabitLog[]> {
    try {
        const ref = collection(db, "habitos", userId, "logs")
        const q = query(ref, where("date", "==", date))
        const snap = await getDocs(q)
        return snap.docs.map(d => d.data() as HabitLog)
    } catch {
        return []
    }
}

export async function toggleHabitLog(
    userId: string,
    habitId: string,
    date: string,
    completed: boolean
): Promise<{ error: string | null }> {
    try {
        const id = getLogId(userId, date, habitId)
        const ref = doc(db, "habitos", userId, "logs", id)
        const log: HabitLog = {
            id,
            userId,
            habitId,
            date,
            completed,
            completedAt: completed ? Date.now() : null,
        }
        await setDoc(ref, log)
        return { error: null }
    } catch {
        return { error: "Erro ao atualizar hábito." }
    }
}

export async function getLogsByYear(
    userId: string,
    year: number
): Promise<HabitLog[]> {
    try {
        const ref = collection(db, "habitos", userId, "logs")
        const q = query(
            ref,
            where("date", ">=", `${year}-01-01`),
            where("date", "<=", `${year}-12-31`),
            where("completed", "==", true)
        )
        const snap = await getDocs(q)
        return snap.docs.map(d => d.data() as HabitLog)
    } catch {
        return []
    }
}

// Streak: dias consecutivos com ao menos 1 hábito concluído
export function calculateStreak(logs: HabitLog[]): number {
    const completedDates = new Set(
        logs.filter(l => l.completed).map(l => l.date)
    )

    let streak = 0
    const today = new Date()

    for (let i = 0; i < 365; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        if (completedDates.has(dateStr)) {
            streak++
        } else if (i > 0) {
            break
        }
    }

    return streak
}

// Maior sequência já alcançada (recorde histórico)
export function calculateBestStreak(logs: HabitLog[]): number {
    const sortedDates = [...new Set(
        logs.filter(l => l.completed).map(l => l.date)
    )].sort()

    let best = 0
    let current = 0
    let prevTime: number | null = null

    for (const dateStr of sortedDates) {
        const time = new Date(dateStr).getTime()
        if (prevTime !== null && time - prevTime === 86400000) {
            current++
        } else {
            current = 1
        }
        best = Math.max(best, current)
        prevTime = time
    }

    return best
}

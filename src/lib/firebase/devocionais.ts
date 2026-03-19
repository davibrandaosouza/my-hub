import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore"
import { db } from "./config"
import type { Devocional } from "@/types/devocional"

// ══════════════════════════════════════════════
// CONCEITO: ESTRUTURA DO FIRESTORE
//
// Coleção: "devocionais"
// Documento ID: "{userId}_{date}"  ex: "abc123_2026-03-19"
//
// Usar userId + date como ID garante:
// 1. Um documento por usuário por dia
// 2. Busca direta sem query
// ══════════════════════════════════════════════

function getDocId(userId: string, date: string): string {
    return `${userId}_${date}`
}

// Busca o devocional de uma data específica
export async function getDevocional(
    userId: string,
    date: string
): Promise<Devocional | null> {
    try {
        const ref = doc(db, "devocionais", getDocId(userId, date))
        const snap = await getDoc(ref)
        return snap.exists() ? (snap.data() as Devocional) : null
    } catch {
        return null
    }
}

// Salva ou atualiza o devocional do dia
// setDoc com merge:true → cria se não existe, atualiza se existe
export async function saveDevocional(
    userId: string,
    date: string,
    reading: string,
    reflection: string,
    completed: boolean
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "devocionais", getDocId(userId, date))
        const data: Devocional = {
            id: getDocId(userId, date),
            userId,
            date,
            reading,
            reflection,
            completed,
            createdAt: Date.now(),
        }
        await setDoc(ref, data, { merge: true })
        return { error: null }
    } catch {
        return { error: "Erro ao salvar devocional." }
    }
}

// Busca todos os devocionais do usuário em um ano
export async function getDevocionalsByYear(
    userId: string,
    year: number
): Promise<Devocional[]> {
    try {
        const ref = collection(db, "devocionais")
        const q = query(
            ref,
            where("userId", "==", userId),
            where("date", ">=", `${year}-01-01`),
            where("date", "<=", `${year}-12-31`)
        )
        const snap = await getDocs(q)
        return snap.docs.map(d => d.data() as Devocional)
    } catch {
        return []
    }
}

// Busca devocionais de um mês específico
export async function getDevocionalsByMonth(
    userId: string,
    year: number,
    month: number
): Promise<Devocional[]> {
    const pad = String(month).padStart(2, "0")
    const lastDay = new Date(year, month, 0).getDate()
    try {
        const ref = collection(db, "devocionais")
        const q = query(
            ref,
            where("userId", "==", userId),
            where("date", ">=", `${year}-${pad}-01`),
            where("date", "<=", `${year}-${pad}-${lastDay}`),
        )
        const snap = await getDocs(q)
        return snap.docs.map(d => d.data() as Devocional)
    } catch {
        return []
    }
}

// Calcula streak atual — conta dias consecutivos até hoje
export function calculateStreak(devocionais: Devocional[]): number {
    const completedDates = new Set(
        devocionais.filter(d => d.completed).map(d => d.date)
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
            // Para no primeiro dia não concluído (exceto hoje)
            break
        }
    }

    return streak
}
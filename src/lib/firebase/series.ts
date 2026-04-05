import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore"
import { db } from "./config"
import type { Serie } from "@/types/serie"

// ══════════════════════════════════════════════
// ESTRUTURA DO FIRESTORE
//
// series/{serieId}        → registro de série individual
//   (cada documento contém o campo userId)
// ══════════════════════════════════════════════

export async function getSeries(userId: string): Promise<Serie[]> {
    try {
        const ref = collection(db, "series")
        const q = query(ref, where("userId", "==", userId))
        const snap = await getDocs(q)
        const series = snap.docs.map(d => ({ id: d.id, ...d.data() } as Serie))
        return series.sort((a, b) => b.createdAt - a.createdAt)
    } catch {
        return []
    }
}

export async function addSerie(
    userId: string,
    data: Omit<Serie, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<{ id: string | null; error: string | null }> {
    try {
        // Verificar duplicata
        const ref = collection(db, "series")
        const dupQ = query(ref, where("userId", "==", userId), where("apiId", "==", data.apiId))
        const dupSnap = await getDocs(dupQ)
        if (!dupSnap.empty) {
            return { id: null, error: "Esta série já está na sua lista!" }
        }

        const docRef = await addDoc(collection(db, "series"), {
            ...data,
            userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })
        return { id: docRef.id, error: null }
    } catch {
        return { id: null, error: "Erro ao adicionar série." }
    }
}


export async function updateSerie(
    id: string,
    updates: Partial<Serie>
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "series", id)
        await updateDoc(ref, {
            ...updates,
            updatedAt: Date.now()
        })
        return { error: null }
    } catch {
        return { error: "Erro ao atualizar série." }
    }
}

export async function deleteSerie(id: string): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "series", id)
        await deleteDoc(ref)
        return { error: null }
    } catch {
        return { error: "Erro ao deletar série." }
    }
}

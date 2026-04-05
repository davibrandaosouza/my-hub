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
import type { Anime } from "@/types/anime"

// ══════════════════════════════════════════════
// ESTRUTURA DO FIRESTORE
//
// animes/{animeId}        → registro de anime individual
//   (cada documento contém o campo userId)
// ══════════════════════════════════════════════

export async function getAnimes(userId: string): Promise<Anime[]> {
    try {
        const ref = collection(db, "animes")
        const q = query(ref, where("userId", "==", userId))
        const snap = await getDocs(q)
        const animes = snap.docs.map(d => ({ id: d.id, ...d.data() } as Anime))
        return animes.sort((a, b) => b.createdAt - a.createdAt)
    } catch {
        return []
    }
}

export async function addAnime(
    userId: string,
    data: Omit<Anime, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<{ id: string | null; error: string | null }> {
    try {
        // Verificar duplicata
        const ref = collection(db, "animes")
        const dupQ = query(ref, where("userId", "==", userId), where("apiId", "==", data.apiId))
        const dupSnap = await getDocs(dupQ)
        if (!dupSnap.empty) {
            return { id: null, error: "Este anime já está na sua lista!" }
        }

        const docRef = await addDoc(collection(db, "animes"), {
            ...data,
            userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })
        return { id: docRef.id, error: null }
    } catch {
        return { id: null, error: "Erro ao adicionar anime." }
    }
}


export async function updateAnime(
    id: string,
    updates: Partial<Anime>
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "animes", id)
        await updateDoc(ref, {
            ...updates,
            updatedAt: Date.now()
        })
        return { error: null }
    } catch {
        return { error: "Erro ao atualizar anime." }
    }
}

export async function deleteAnime(id: string): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "animes", id)
        await deleteDoc(ref)
        return { error: null }
    } catch {
        return { error: "Erro ao deletar anime." }
    }
}

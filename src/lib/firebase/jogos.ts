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
import type { Jogo, JogoStatus } from "@/types/jogo"

export async function getJogos(userId: string): Promise<Jogo[]> {
    try {
        const ref = collection(db, "jogos")
        const q = query(ref, where("userId", "==", userId))
        const snap = await getDocs(q)
        const jogos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Jogo))
        // ordena no cliente para evitar exigência de índice composto
        return jogos.sort((a, b) => b.createdAt - a.createdAt)
    } catch {
        return []
    }
}

export async function addJogo(
    userId: string,
    data: Omit<Jogo, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<{ id: string | null; error: string | null }> {
    try {
        const ref = await addDoc(collection(db, "jogos"), {
            ...data,
            userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })
        return { id: ref.id, error: null }
    } catch {
        return { id: null, error: "Erro ao adicionar jogo." }
    }
}

export async function updateJogo(
    id: string,
    data: Partial<Omit<Jogo, "id" | "userId" | "createdAt">>
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "jogos", id)
        await updateDoc(ref, { ...data, updatedAt: Date.now() })
        return { error: null }
    } catch {
        return { error: "Erro ao atualizar jogo." }
    }
}

export async function updateJogoStatus(
    id: string,
    status: JogoStatus
): Promise<{ error: string | null }> {
    return updateJogo(id, { status })
}

export async function deleteJogo(
    id: string
): Promise<{ error: string | null }> {
    try {
        await deleteDoc(doc(db, "jogos", id))
        return { error: null }
    } catch {
        return { error: "Erro ao remover jogo." }
    }
}

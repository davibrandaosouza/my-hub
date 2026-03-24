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
import type { Filme } from "@/types/filme"

export async function getFilmes(userId: string): Promise<Filme[]> {
    try {
        const ref = collection(db, "filmes")
        const q = query(ref, where("userId", "==", userId))
        const snap = await getDocs(q)
        const filmes = snap.docs.map(d => ({ id: d.id, ...d.data() } as Filme))
        return filmes.sort((a, b) => b.createdAt - a.createdAt)
    } catch {
        return []
    }
}

export async function addFilme(
    userId: string,
    data: Omit<Filme, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<{ id: string | null; error: string | null }> {
    try {
        const ref = await addDoc(collection(db, "filmes"), {
            ...data,
            userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })
        return { id: ref.id, error: null }
    } catch {
        return { id: null, error: "Erro ao adicionar filme." }
    }
}

export async function updateFilme(
    id: string,
    updates: Partial<Filme>
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "filmes", id)
        await updateDoc(ref, {
            ...updates,
            updatedAt: Date.now()
        })
        return { error: null }
    } catch {
        return { error: "Erro ao atualizar filme." }
    }
}

export async function deleteFilme(id: string): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "filmes", id)
        await deleteDoc(ref)
        return { error: null }
    } catch {
        return { error: "Erro ao deletar filme." }
    }
}

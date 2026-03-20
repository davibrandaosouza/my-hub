import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
} from "firebase/firestore"
import { db } from "./config"
import type { Planejamento, PlanejamentoStatus } from "@/types/planejamento"

// Busca todos os planejamentos do usuário
export async function getPlanejamentos(userId: string): Promise<Planejamento[]> {
    try {
        const ref = collection(db, "planejamentos")
        const q = query(
            ref,
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        )
        const snap = await getDocs(q)
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Planejamento))
    } catch {
        return []
    }
}

// Cria um novo planejamento
export async function createPlanejamento(
    userId: string,
    data: Omit<Planejamento, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<{ id: string | null; error: string | null }> {
    try {
        const ref = await addDoc(collection(db, "planejamentos"), {
            ...data,
            userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })
        return { id: ref.id, error: null }
    } catch {
        return { id: null, error: "Erro ao criar planejamento." }
    }
}

// Atualiza um planejamento existente
export async function updatePlanejamento(
    id: string,
    data: Partial<Omit<Planejamento, "id" | "userId" | "createdAt">>
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "planejamentos", id)
        await updateDoc(ref, { ...data, updatedAt: Date.now() })
        return { error: null }
    } catch {
        return { error: "Erro ao atualizar planejamento." }
    }
}

// Atualiza só o status (usado no kanban)
export async function updatePlanejamentoStatus(
    id: string,
    status: PlanejamentoStatus
): Promise<{ error: string | null }> {
    return updatePlanejamento(id, { status })
}

// Deleta um planejamento
export async function deletePlanejamento(
    id: string
): Promise<{ error: string | null }> {
    try {
        await deleteDoc(doc(db, "planejamentos", id))
        return { error: null }
    } catch {
        return { error: "Erro ao deletar planejamento." }
    }
}
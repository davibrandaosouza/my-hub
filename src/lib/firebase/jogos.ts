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

// ══════════════════════════════════════════════
// ESTRUTURA DO FIRESTORE
//
// jogos/{jogoId}          → registro de jogo individual
//   (cada documento contém o campo userId)
// ══════════════════════════════════════════════

export async function getJogos(userId: string): Promise<Jogo[]> {
    try {
        const ref = collection(db, "jogos")
        const q = query(ref, where("userId", "==", userId))
        const snap = await getDocs(q)
        const jogos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Jogo))
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
        // Verificar duplicata
        const ref = collection(db, "jogos")
        const dupQ = query(ref, where("userId", "==", userId), where("rawgId", "==", data.rawgId))
        const dupSnap = await getDocs(dupQ)
        if (!dupSnap.empty) {
            return { id: null, error: "Este jogo já está na sua lista!" }
        }

        const docRef = await addDoc(collection(db, "jogos"), {
            ...data,
            userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })
        return { id: docRef.id, error: null }
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

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore"
import { db } from "./config"
import type { Colecao, MediaTipo } from "@/types/colecao"

// ══════════════════════════════════════════════
// ESTRUTURA DO FIRESTORE
//
// colecoes/{colecaoId}    → coleção criada pelo usuário
//   userId: string
//   nome: string
//   tipo: "jogos" | "animes" | "filmes" | "series"
//   itemIds: string[]     // IDs dos docs no Firestore
//   capaUrl: string | null
//   createdAt: number
//   updatedAt: number
// ══════════════════════════════════════════════

export async function getColecoes(userId: string, tipo: MediaTipo): Promise<Colecao[]> {
    try {
        const ref = collection(db, "colecoes")
        const q = query(ref, where("userId", "==", userId), where("tipo", "==", tipo))
        const snap = await getDocs(q)
        const colecoes = snap.docs.map(d => ({ id: d.id, ...d.data() } as Colecao))
        return colecoes.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    } catch {
        return []
    }
}

export async function addColecao(
    userId: string,
    data: { nome: string; tipo: MediaTipo }
): Promise<{ id: string | null; error: string | null }> {
    try {
        const docRef = await addDoc(collection(db, "colecoes"), {
            userId,
            nome: data.nome,
            tipo: data.tipo,
            itemIds: [],
            capaUrl: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })
        return { id: docRef.id, error: null }
    } catch {
        return { id: null, error: "Erro ao criar coleção." }
    }
}

export async function updateColecao(
    id: string,
    data: Partial<Pick<Colecao, "nome" | "itemIds" | "capaUrl">>
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "colecoes", id)
        await updateDoc(ref, { ...data, updatedAt: Date.now() })
        return { error: null }
    } catch {
        return { error: "Erro ao atualizar coleção." }
    }
}

export async function addItemToColecao(
    colecaoId: string,
    itemId: string,
    capaUrl: string | null
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "colecoes", colecaoId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const update: any = { itemIds: arrayUnion(itemId), updatedAt: Date.now() }
        // Define capaUrl apenas se a coleção ainda não tiver uma (gerenciado no hook)
        if (capaUrl) update.capaUrl = capaUrl
        await updateDoc(ref, update)
        return { error: null }
    } catch {
        return { error: "Erro ao adicionar item à coleção." }
    }
}

export async function removeItemFromColecao(
    colecaoId: string,
    itemId: string
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "colecoes", colecaoId)
        await updateDoc(ref, { itemIds: arrayRemove(itemId), updatedAt: Date.now() })
        return { error: null }
    } catch {
        return { error: "Erro ao remover item da coleção." }
    }
}

export async function deleteColecao(id: string): Promise<{ error: string | null }> {
    try {
        await deleteDoc(doc(db, "colecoes", id))
        return { error: null }
    } catch {
        return { error: "Erro ao deletar coleção." }
    }
}

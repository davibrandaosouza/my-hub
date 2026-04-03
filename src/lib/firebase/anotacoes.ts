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
import type { Notebook, Note } from "@/types/anotacao"

// ══════════════════════════════════════════════
// ESTRUTURA DO FIRESTORE
//
// anotacoes/{userId}/notebooks/{notebookId} → cadernos de anotações
// anotacoes/{userId}/notes/{noteId}         → notas individuais
// ══════════════════════════════════════════════

// ── NOTEBOOKS ───────────────────────────────
export async function getNotebooks(userId: string): Promise<Notebook[]> {
    try {
        const ref = collection(db, "anotacoes", userId, "notebooks")
        const q = query(ref, orderBy("createdAt", "asc"))
        const snap = await getDocs(q)
        return snap.docs.map(d => d.data() as Notebook)
    } catch {
        return []
    }
}

export async function saveNotebook(
    userId: string,
    notebook: Notebook
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "anotacoes", userId, "notebooks", notebook.id)
        await setDoc(ref, notebook, { merge: true })
        return { error: null }
    } catch {
        return { error: "Erro ao salvar caderno." }
    }
}

export async function deleteNotebook(
    userId: string,
    notebookId: string
): Promise<{ error: string | null }> {
    try {
        const notesRef = collection(db, "anotacoes", userId, "notes")
        const q = query(notesRef, where("notebookId", "==", notebookId))
        const snap = await getDocs(q)
        await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))

        const ref = doc(db, "anotacoes", userId, "notebooks", notebookId)
        await deleteDoc(ref)
        return { error: null }
    } catch {
        return { error: "Erro ao deletar caderno." }
    }
}

// ── NOTAS ────────────────────────────────────

export async function getNotes(
    userId: string,
    notebookId?: string
): Promise<Note[]> {
    try {
        const ref = collection(db, "anotacoes", userId, "notes")
        const q = notebookId
            ? query(ref, where("notebookId", "==", notebookId), orderBy("updatedAt", "desc"))
            : query(ref, orderBy("updatedAt", "desc"))
        const snap = await getDocs(q)
        return snap.docs.map(d => d.data() as Note)
    } catch {
        return []
    }
}

export async function saveNote(
    userId: string,
    note: Note
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "anotacoes", userId, "notes", note.id)
        await setDoc(ref, note, { merge: true })
        return { error: null }
    } catch {
        return { error: "Erro ao salvar nota." }
    }
}

export async function deleteNote(
    userId: string,
    noteId: string
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "anotacoes", userId, "notes", noteId)
        await deleteDoc(ref)
        return { error: null }
    } catch {
        return { error: "Erro ao deletar nota." }
    }
}

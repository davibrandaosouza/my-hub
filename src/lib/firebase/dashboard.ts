import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    getDocs,
    orderBy,
    deleteDoc,
} from "firebase/firestore"
import { db } from "./config"
import type { DashboardEvent } from "@/types/dashboard"

export async function getDashboardImage(userId: string): Promise<string | null> {
    const userDocRef = doc(db, "dashboard", userId)
    const snapshot = await getDoc(userDocRef)

    if (snapshot.exists()) {
        return snapshot.data().imageUrl || null
    }

    return null
}

export async function getDashboardEvents(userId: string): Promise<DashboardEvent[]> {
    try {
        const ref = collection(db, "dashboard", userId, "events")
        const q = query(ref, orderBy("createdAt", "asc"))
        const snap = await getDocs(q)
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as DashboardEvent))
    } catch {
        return []
    }
}

export async function saveDashboardEvent(
    userId: string,
    event: DashboardEvent
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "dashboard", userId, "events", event.id)
        await setDoc(ref, event, { merge: true })
        return { error: null }
    } catch {
        return { error: "Erro ao salvar evento." }
    }
}

export async function deleteDashboardEvent(
    userId: string,
    eventId: string
): Promise<{ error: string | null }> {
    try {
        const ref = doc(db, "dashboard", userId, "events", eventId)
        await deleteDoc(ref)
        return { error: null }
    } catch {
        return { error: "Erro ao deletar evento." }
    }
}

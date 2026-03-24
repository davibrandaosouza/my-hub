import { doc, getDoc } from "firebase/firestore"
import { db } from "./config"

export async function getDashboardImage(userId: string): Promise<string | null> {
    const userDocRef = doc(db, "dashboard", userId)
    const snapshot = await getDoc(userDocRef)
    
    if (snapshot.exists()) {
        return snapshot.data().imageUrl || null
    }
    
    return null
}

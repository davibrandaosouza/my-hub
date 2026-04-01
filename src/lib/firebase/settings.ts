import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./config"
import { UserSettings, DEFAULT_USER_SETTINGS } from "@/types/settings"

const COLLECTION = "settings"

export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const docRef = doc(db, COLLECTION, userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      // Mesclar defaults com as settings existentes do banco
      return { ...DEFAULT_USER_SETTINGS, ...(docSnap.data() as Partial<UserSettings>) }
    } else {
      // Se não existir, retorna as configurações padrão
      return DEFAULT_USER_SETTINGS
    }
  } catch (error) {
    console.error("Erro ao buscar configurações no Firebase:", error)
    return DEFAULT_USER_SETTINGS
  }
}

export async function saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<{ error?: string }> {
  try {
    const docRef = doc(db, COLLECTION, userId)
    await setDoc(docRef, settings, { merge: true })
    return {}
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Não foi possível salvar as configurações"
    console.error("Erro ao salvar configurações:", error)
    return { error: errorMessage }
  }
}

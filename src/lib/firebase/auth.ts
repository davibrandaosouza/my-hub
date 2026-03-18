import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    type User,
    updateProfile
} from "firebase/auth"
import { auth } from "./config"

const authErrorMessages: Record<string, string> = {
    "auth/user-not-found": "Nenhuma conta encontrada com esse e-mail.",
    "auth/wrong-password": "Senha incorreta. Tente novamente.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/email-already-in-use": "Já existe uma conta com esse e-mail.",
    "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
    "auth/invalid-email": "Formato de e-mail inválido.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/user-disabled": "Essa conta foi desativada.",
    "auth/popup-closed-by-user": "",
    "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
}

function getAuthErrorMessage(error: unknown): string {
    if (typeof error === "object" && error !== null && "code" in error) {
        const code = (error as { code: string }).code
        return authErrorMessages[code] ?? "Ocorreu um erro inesperado. Tente novamente."
    }
    return "Ocorreu um erro inesperado. Tente novamente."
}

type AuthResult = {
    user: User | null
    error: string | null
}

export async function loginWithEmail(
    email: string,
    password: string
): Promise<AuthResult> {
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        return { user: credential.user, error: null }
    } catch (error) {
        return { user: null, error: getAuthErrorMessage(error) }
    }
}

export async function registerWithEmail(
    email: string,
    password: string,
    name: string
): Promise<AuthResult> {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(credential.user, { displayName: name })
        return { user: credential.user, error: null }
    } catch (error) {
        return { user: null, error: getAuthErrorMessage(error) }
    }
}

export async function loginWithGoogle(): Promise<AuthResult> {
    try {
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ prompt: "select_account" })
        const credential = await signInWithPopup(auth, provider)
        return { user: credential.user, error: null }
    } catch (error) {
        const message = getAuthErrorMessage(error)
        return { user: null, error: message || null }
    }
}

export async function logout(): Promise<{ error: string | null }> {
    try {
        await signOut(auth)
        return { error: null }
    } catch (error) {
        return { error: getAuthErrorMessage(error) }
    }
}

export async function resetPassword(
    email: string
): Promise<{ error: string | null }> {
    try {
        await sendPasswordResetEmail(auth, email)
        return { error: null }
    } catch (error) {
        return { error: getAuthErrorMessage(error) }
    }
}

export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
}
import { useState, useEffect } from "react"
import { type User } from "firebase/auth"
import { onAuthChange } from "@/lib/firebase/auth"

type AuthState = {
    user: User | null
    loading: boolean
}

export function useAuth(): AuthState {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthChange((firebaseUser) => {
            setUser(firebaseUser)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    return { user, loading }
}
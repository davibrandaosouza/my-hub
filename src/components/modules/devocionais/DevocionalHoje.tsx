"use client"

import { useState, useEffect } from "react"
import { BookOpen, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { getTodayReading } from "@/lib/data/bible-reading-plan"
import { getDevocional, saveDevocional } from "@/lib/firebase/devocionais"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
    onSaved: () => void
}

export function DevocionalHoje({ onSaved }: Props) {
    const { user } = useAuth()
    const [reflection, setReflection] = useState("")
    const [completed, setCompleted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const today = new Date().toISOString().split("T")[0]
    const reading = getTodayReading()

    // Carrega devocional já salvo do dia
    useEffect(() => {
        if (!user) return
        getDevocional(user.uid, today).then((data) => {
            if (data) {
                setReflection(data.reflection)
                setCompleted(data.completed)
            }
            setLoading(false)
        })
    }, [user, today])

    const handleSave = async () => {
        if (!user || !reading) return
        setSaving(true)

        const { error } = await saveDevocional(
            user.uid,
            today,
            reading,
            reflection,
            true
        )

        if (!error) {
            setCompleted(true)
            setSaved(true)
            onSaved()
            setTimeout(() => setSaved(false), 3000)
        }

        setSaving(false)
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-white">Devocional de Hoje</h3>
            </div>

            {/* LEITURA DO DIA */}
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                <p className="text-xs text-muted mb-1">Leitura de hoje</p>
                <p className="text-base font-semibold text-white">
                    {reading ?? "Nenhuma leitura para hoje"}
                </p>
            </div>

            {/* REFLEXÃO */}
            <div>
                <label className="text-xs text-muted mb-2 block">Sua Reflexão</label>
                <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Escreva seus pensamentos..."
                    rows={6}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                />
            </div>

            {/* BOTÃO SALVAR */}
            <Button
                onClick={handleSave}
                disabled={saving || !reading}
                className="w-full"
            >
                {saving ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                    </>
                ) : saved ? (
                    <>
                        <Check className="w-4 h-4 mr-2" />
                        Salvo!
                    </>
                ) : (
                    "Salvar Devocional"
                )}
            </Button>

            {completed && !saving && (
                <p className="text-center text-xs text-emerald-400">
                    ✓ Devocional de hoje concluído
                </p>
            )}
        </div>
    )
}
"use client"

import { useState, useEffect } from "react"
import { BookOpen, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { getDevocional, saveDevocional } from "@/lib/firebase/devocionais"
import { getReadingForDate } from "@/lib/data/bible-reading-plan"
import { Skeleton } from "@/components/ui/skeleton"
import { useToastContext } from "@/app/(hub)/layout"
import { cn } from "@/lib/utils"
import type { Devocional } from "@/types/devocional"

type Props = {
    date: string
    onSaved: () => void
}

export function DevocionalHoje({ date, onSaved }: Props) {
    const { user } = useAuth()
    const [reflection, setReflection] = useState("")
    const [completed, setCompleted] = useState(false)
    const [devocional, setDevocional] = useState<Devocional | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const toast = useToastContext()

    const today = new Date().toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).split("/").reverse().join("-")
    const reading = getReadingForDate(date)

    const isLate = (dev: Devocional | null) => {
        if (!dev) return date < today
        const createdStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: "America/Sao_Paulo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date(dev.createdAt))

        return dev.date < createdStr
    }

    const wasLate = isLate(devocional)

    const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    })

    // Carrega devocional já salvo do dia
    useEffect(() => {
        if (!user) return
        
        let isMounted = true

        getDevocional(user.uid, date).then((data) => {
            if (!isMounted) return
            setDevocional(data)
            if (data) {
                setReflection(data.reflection)
                setCompleted(data.completed)
            } else {
                setReflection("")
                setCompleted(false)
            }
            setLoading(false)
        })

        return () => { isMounted = false }
    }, [user, date])

    const handleSave = async () => {
        if (!user || !reading) return
        setSaving(true)

        const { error } = await saveDevocional(
            user.uid,
            date,
            reading,
            reflection,
            true
        )

        if (error) {
            toast.error("Erro ao salvar devocional. Tente novamente.")
        } else {
            setCompleted(true)
            setSaved(true)
            onSaved()
            toast.success("Devocional salvo com sucesso!")
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
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <BookOpen className={cn("w-4 h-4", wasLate ? "text-amber-400" : "text-primary")} />
                    <h3 className="text-sm font-semibold text-foreground">
                        {wasLate ? "Devocional Atrasado" : "Devocional no Prazo"}
                    </h3>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                    {formattedDate}
                </span>
            </div>

            {/* LEITURA DO DIA */}
            <div className={cn(
                "rounded-lg border p-4 transition-colors",
                wasLate ? "bg-amber-500/10 border-amber-500/20" : "bg-primary/10 border-primary/20"
            )}>
                <p className="text-xs text-muted mb-1">Leitura do dia</p>
                <p className="text-base font-semibold text-foreground">
                    {reading ?? "Nenhuma leitura disponível"}
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
                    className={cn(
                        "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 resize-none",
                        wasLate ? "focus-visible:ring-amber-500" : "focus-visible:ring-primary"
                    )}
                />
            </div>

            {/* BOTÃO SALVAR */}
            <Button
                onClick={handleSave}
                disabled={saving || !reading}
                className={cn(
                    "w-full transition-all",
                    wasLate && !saved && "bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shadow-amber-900/20"
                )}
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
                    wasLate ? "Salvar Devocional Atrasado" : "Salvar Devocional"
                )}
            </Button>

            {completed && !saving && (
                <p className={cn(
                    "text-center text-xs font-medium",
                    wasLate ? "text-amber-400" : "text-emerald-400"
                )}>
                    ✓ Devocional {wasLate ? "registrado como atrasado" : "concluído no prazo"}
                </p>
            )}
        </div>
    )
}
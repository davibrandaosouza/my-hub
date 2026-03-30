"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TagInput } from "@/components/ui/tag-input"
import { Clock, Loader2 } from "lucide-react"
import type { DashboardEvent } from "@/types/dashboard"

type Props = {
    open: boolean
    onClose: () => void
    onSave: (event: Omit<DashboardEvent, "id" | "userId" | "createdAt">) => Promise<void>
    editingEvent?: DashboardEvent | null
    tagSuggestions: string[]
}

export function EventModal({ open, onClose, onSave, editingEvent, tagSuggestions }: Props) {
    const [title, setTitle] = useState("")
    const [time, setTime] = useState("")
    const [tagName, setTagName] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (editingEvent) {
            setTitle(editingEvent.title)
            setTime(editingEvent.time)
            setTagName(editingEvent.tag)
        } else {
            setTitle("")
            setTime("")
            setTagName("")
        }
    }, [editingEvent, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !time || !tagName) return

        setSaving(true)
        try {
            await onSave({ title, time, tag: tagName })
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editingEvent ? "Editar Evento" : "Novo Evento"}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                        Título do Evento
                    </label>
                    <Input
                        placeholder="Ex: Reunião de Trabalho"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted uppercase tracking-wider">
                            Horário
                        </label>
                        <div className="relative">
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="pl-9"
                                required
                            />
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted uppercase tracking-wider">
                            Tag / Categoria
                        </label>
                        <TagInput
                            value={tagName}
                            onChange={setTagName}
                            suggestions={tagSuggestions}
                            placeholder="Ex: Trabalho"
                            className="bg-background"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <Button type="submit" disabled={saving || !title || !time || !tagName} className="px-6">
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            editingEvent ? "Salvar Alterações" : "Criar Evento"
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Link as LinkIcon, MapPin, AlignLeft, Calendar as CalendarIcon } from "lucide-react"
import { useCalendarStore } from "@/hooks/useCalendarStore"
import type { CalendarEvent, EventRepeat } from "@/types/calendario"
import { cn } from "@/lib/utils"
import {
    CategoryPicker,
    RepeatSelector,
    EndTimePicker,
    CustomDatePicker,
    CustomTimePicker,
} from "./ModalHelpers"

type Props = {
    open: boolean
    onClose: () => void
    onSave: (event: Omit<CalendarEvent, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>
    editingEvent?: CalendarEvent | null
    defaultStart?: string
}

export function EventModal({ open, onClose, onSave, editingEvent, defaultStart }: Props) {
    const { categories } = useCalendarStore()

    const [title, setTitle] = useState("")
    const [allDay, setAllDay] = useState(false)
    const [startDate, setStartDate] = useState("")
    const [startTime, setStartTime] = useState("09:00")
    const [endDate, setEndDate] = useState("")
    const [endTime, setEndTime] = useState("10:00")
    const [categoryId, setCategoryId] = useState("")
    const [repeat, setRepeat] = useState<EventRepeat>("never")
    const [description, setDescription] = useState("")
    const [linkUrl, setLinkUrl] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!open) return

        if (editingEvent) {
            // Edit Mode: Always sync with the event being edited
            setTitle(editingEvent.title)
            setAllDay(editingEvent.allDay || false)
            setRepeat(editingEvent.repeat || "never")
            setCategoryId(editingEvent.categoryId)
            setDescription(editingEvent.description || "")
            setLinkUrl(editingEvent.linkUrl || "")

            const [sD, sT] = editingEvent.start.split("T")
            const [eD, eT] = editingEvent.end.split("T")
            setStartDate(sD)
            setStartTime(sT)
            setEndDate(eD)
            setEndTime(eT)
        } else {
            // Create Mode: Only set defaults if fields are empty
            // This prevents overwriting user input when categories update
            setTitle(prev => prev || "")
            setCategoryId(prev => prev || categories[0]?.id || "")

            // Set initial dates only if not already set
            if (!startDate) {
                const base = defaultStart ? new Date(defaultStart) : new Date()
                const sD = base.toISOString().split("T")[0]
                const sT = defaultStart ? base.toTimeString().slice(0, 5) : "09:00"

                const end = new Date(base.getTime() + 60 * 60 * 1000)
                const eD = end.toISOString().split("T")[0]
                const eT = end.toTimeString().slice(0, 5)

                setStartDate(sD)
                setStartTime(sT)
                setEndDate(eD)
                setEndTime(eT)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingEvent, open, defaultStart])
    // We intentionally omit 'categories' and 'startDate' to prevent resets during typing/category management.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !startDate) return

        setSaving(true)
        try {
            const start = allDay ? `${startDate}T00:00` : `${startDate}T${startTime}`
            const end = allDay ? `${endDate || startDate}T23:59` : `${endDate || startDate}T${endTime}`

            await onSave({ title, start, end, allDay, repeat, categoryId, description, linkUrl })
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
            className="max-w-[500px] my-8"
        >
            <form onSubmit={handleSubmit}>
                {/* Área de Scroll */}
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pb-2">

                    {/* GRUPO 1: TÍTULO E LOCALIZAÇÃO */}
                    <div className="space-y-3 bg-foreground/3 p-4 rounded-xl border border-border/50 mt-1">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Título do Evento</label>
                            <Input
                                placeholder="Ex: Reunião de Design"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="bg-background/50"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" /> Localização
                            </label>
                            <Input
                                placeholder="Onde será?"
                                className="bg-background/50"
                            />
                        </div>
                    </div>

                    {/* GRUPO 2: CATEGORIA */}
                    <div className="bg-foreground/3 p-4 rounded-xl border border-border/50">
                        <CategoryPicker selectedId={categoryId} onSelect={setCategoryId} />
                    </div>

                    {/* GRUPO 3: DATAS E HORAS */}
                    <div className="bg-foreground/3 p-4 rounded-xl border border-border/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">Dia inteiro</span>
                            <button
                                type="button"
                                onClick={() => setAllDay(!allDay)}
                                className={cn(
                                    "w-10 h-5 rounded-full transition-all relative border",
                                    allDay ? "bg-primary border-primary" : "bg-foreground/10 border-border"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm",
                                    allDay ? "right-0.5" : "left-0.5"
                                )} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                    <CalendarIcon className="w-3 h-3 text-primary" /> Começa
                                </label>
                                <div className="flex flex-col gap-2">
                                    <CustomDatePicker value={startDate} onChange={setStartDate} />
                                    {!allDay && (
                                        <CustomTimePicker value={startTime} onChange={setStartTime} />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                    <CalendarIcon className="w-3 h-3 text-primary" /> Termina
                                </label>
                                <div className="flex flex-col gap-2">
                                    <CustomDatePicker value={endDate} onChange={setEndDate} align="right" />
                                    {!allDay && (
                                        <div className="h-10">
                                            <EndTimePicker
                                                startTime={startTime}
                                                value={endTime}
                                                onChange={setEndTime}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border/30">
                            <RepeatSelector value={repeat} onChange={setRepeat} />
                        </div>
                    </div>

                    {/* GRUPO 4: EXTRAS */}
                    <div className="bg-foreground/3 p-4 rounded-xl border border-border/50 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <LinkIcon className="w-3 h-3" /> Link Externo
                            </label>
                            <Input
                                placeholder="https://..."
                                value={linkUrl}
                                onChange={e => setLinkUrl(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <AlignLeft className="w-3 h-3" /> Notas
                            </label>
                            <textarea
                                placeholder="Detalhes adicionais... Use tópicos para se organizar melhor."
                                rows={6}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-background/50 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none min-h-[160px] custom-scrollbar"
                            />
                        </div>
                    </div>
                </div>


                {/* BOTÕES DE AÇÃO - Fixos no Rodapé */}
                <div className="flex items-center gap-3 pt-5 border-t border-border/30 mt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-foreground/5 transition-all"
                    >
                        Cancelar
                    </button>
                    <Button
                        type="submit"
                        disabled={saving || !title}
                        className="flex-1 h-11 text-sm font-bold shadow-lg shadow-primary/20"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingEvent ? "Salvar Alterações" : "Criar Evento")}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

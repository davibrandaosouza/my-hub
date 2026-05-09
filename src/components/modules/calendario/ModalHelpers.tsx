"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Plus, ChevronDown, Trash2, Edit2, Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/hooks/useCalendarStore"
import { useAuth } from "@/hooks/useAuth"
import { motion } from "framer-motion"
import type { CalendarCategory, EventRepeat } from "@/types/calendario"

const PRESET_COLORS = [
    "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
    "#6366f1", "#ec4899", "#f43f5e", "#64748b"
]

// ── CATEGORY PICKER ───────────────────────────
export function CategoryPicker({ selectedId, onSelect }: { selectedId: string, onSelect: (id: string) => void }) {
    const { categories, addCategory, updateCategory, deleteCategory } = useCalendarStore()
    const { user } = useAuth()
    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newCatName, setNewCatName] = useState("")
    const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0])

    const handleAddOrUpdate = async () => {
        if (!newCatName || !user) return

        if (editingId) {
            await updateCategory(user.uid, {
                id: editingId,
                name: newCatName,
                color: newCatColor,
            })
        } else {
            await addCategory(user.uid, {
                id: crypto.randomUUID(),
                name: newCatName,
                color: newCatColor,
            })
        }
        setNewCatName("")
        setIsCreating(false)
        setEditingId(null)
    }

    const startEdit = (cat: CalendarCategory) => {
        setEditingId(cat.id)
        setNewCatName(cat.name)
        setNewCatColor(cat.color)
        setIsCreating(true)
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!user) return
        await deleteCategory(user.uid, id)
    }

    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Categoria</label>
            <div className="relative">
                <div className="flex flex-wrap gap-2 items-center">
                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-all group relative",
                                selectedId === cat.id
                                    ? "bg-foreground/5 border-primary text-foreground shadow-sm"
                                    : "border-border/40 text-muted hover:border-border hover:bg-foreground/3"
                            )}
                        >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span>{cat.name}</span>
                            {selectedId === cat.id && <Check className="w-3 h-3 text-primary" />}

                            {/* Edit/Delete Actions */}
                            <div className="hidden group-hover:flex items-center gap-1 ml-1 bg-background/80 backdrop-blur-sm pl-1">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); startEdit(cat); }}
                                    className="p-1 hover:text-primary transition-colors"
                                >
                                    <Edit2 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleDelete(e, cat.id)}
                                    className="p-1 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => { setIsCreating(true); setEditingId(null); setNewCatName(""); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-border/60 text-xs text-muted hover:border-primary/50 hover:text-primary transition-all"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Nova</span>
                    </button>
                </div>

                {isCreating && (
                    <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-[#1c1c1e] border border-border rounded-xl p-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <p className="text-[10px] font-bold text-muted uppercase mb-3">{editingId ? "Editar Categoria" : "Nova Categoria"}</p>
                        <input
                            autoFocus
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            placeholder="Nome da categoria..."
                            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50 mb-3"
                        />
                        <div className="flex flex-wrap gap-2 mb-4">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setNewCatColor(c)}
                                    className={cn(
                                        "w-6 h-6 rounded-full border-2 transition-all transform hover:scale-110",
                                        newCatColor === c ? "border-white scale-110 shadow-lg" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t border-border/30 mt-1">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleAddOrUpdate}
                                className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
                            >
                                {editingId ? "Salvar" : "Criar"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── CUSTOM DATE PICKER ───────────────────────
export function CustomDatePicker({ value, onChange, align = "left" }: { value: string, onChange: (v: string) => void, align?: "left" | "right" }) {
    const [isOpen, setIsOpen] = useState(false)
    const [openUp, setOpenUp] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [viewDate, setViewDate] = useState(value ? new Date(value + "T12:00:00") : new Date())

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()
    
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"]

    const handleDateSelect = (day: number) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
        onChange(d.toISOString().split("T")[0])
        setIsOpen(false)
    }

    const changeMonth = (delta: number) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1))
    }

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            setOpenUp(spaceBelow < 320)
        }
        setIsOpen(!isOpen)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                const container = buttonRef.current.parentElement
                if (container && !container.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={toggleOpen}
                className="w-full flex items-center justify-between bg-background/50 border border-border rounded-lg px-3 h-10 text-sm hover:border-primary/50 transition-all"
            >
                <span>{value ? value.split("-").reverse().join("/") : "Selecionar data"}</span>
                <CalendarIcon className="w-4 h-4 text-muted" />
            </button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: openUp ? -4 : 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                        "absolute z-70 w-64 bg-[#1c1c1e] border border-border rounded-xl p-4 shadow-2xl",
                        openUp ? "bottom-full mb-2" : "top-full mt-2",
                        align === "right" ? "right-0" : "left-0"
                    )}
                >
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/5 rounded"><ChevronDown className="w-4 h-4 rotate-90" /></button>
                        <span className="text-xs font-bold uppercase tracking-wider">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                        <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-white/5 rounded"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(d => <span key={d} className="text-[10px] text-center font-bold text-muted">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={i} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const isSelected = value === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toISOString().split("T")[0]
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDateSelect(day)}
                                    className={cn(
                                        "h-7 text-xs rounded-lg transition-all",
                                        isSelected ? "bg-primary text-white font-bold" : "hover:bg-white/5 text-muted hover:text-foreground"
                                    )}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    )
}

// ── CUSTOM TIME PICKER ───────────────────────
export function CustomTimePicker({ value, onChange, align = "left" }: { value: string, onChange: (v: string) => void, align?: "left" | "right" }) {
    const [isOpen, setIsOpen] = useState(false)
    const [openUp, setOpenUp] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    
    const hours = Array.from({ length: 24 }).map((_, i) => String(i).padStart(2, "0"))
    const minutes = ["00", "15", "30", "45"]

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            setOpenUp(spaceBelow < 260)
        }
        setIsOpen(!isOpen)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                const container = buttonRef.current.parentElement
                if (container && !container.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={toggleOpen}
                className="w-full flex items-center justify-between bg-background/50 border border-border rounded-lg px-3 h-10 text-sm hover:border-primary/50 transition-all"
            >
                <span>{value}</span>
                <Clock className="w-4 h-4 text-muted" />
            </button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: openUp ? -4 : 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                        "absolute z-70 w-48 bg-[#1c1c1e] border border-border rounded-xl p-2 shadow-2xl max-h-64 overflow-y-auto custom-scrollbar",
                        openUp ? "bottom-full mb-2" : "top-full mt-2",
                        align === "right" ? "right-0" : "left-0"
                    )}
                >
                    <div className="grid grid-cols-2 gap-1">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted uppercase px-2 mb-1">Hora</p>
                            {hours.map(h => (
                                <button
                                    key={h}
                                    type="button"
                                    onClick={() => onChange(`${h}:${value.split(":")[1]}`)}
                                    className={cn(
                                        "w-full text-left px-3 py-1.5 text-xs rounded-lg transition-all",
                                        value.startsWith(h) ? "bg-primary/20 text-primary font-bold" : "hover:bg-white/5 text-muted hover:text-foreground"
                                    )}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted uppercase px-2 mb-1">Min</p>
                            {minutes.map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => onChange(`${value.split(":")[0]}:${m}`)}
                                    className={cn(
                                        "w-full text-left px-3 py-1.5 text-xs rounded-lg transition-all",
                                        value.endsWith(m) ? "bg-primary/20 text-primary font-bold" : "hover:bg-white/5 text-muted hover:text-foreground"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

// ── REUSABLE CUSTOM SELECT ──────────────────
function CustomDropdownSelect({
    value,
    onChange,
    options,
    label,
    align = "left"
}: {
    value: string,
    onChange: (v: string) => void,
    options: { value: string, label: string, duration?: string }[],
    label: string,
    align?: "left" | "right"
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [openUp, setOpenUp] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const selectedOption = options.find(o => o.value === value)

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            setOpenUp(spaceBelow < 260)
        }
        setIsOpen(!isOpen)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                const container = buttonRef.current.parentElement
                if (container && !container.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={toggleOpen}
                className="w-full flex items-center justify-between bg-background/50 border border-border rounded-lg px-3 h-10 text-sm hover:border-primary/50 transition-all"
            >
                <span className="truncate">{selectedOption ? `${selectedOption.label}${selectedOption.duration ? ` (${selectedOption.duration})` : ""}` : label}</span>
                <ChevronDown className={cn("w-4 h-4 text-muted transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: openUp ? -4 : 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                        "absolute z-70 min-w-[160px] bg-[#1c1c1e] border border-border rounded-xl p-1 shadow-2xl overflow-hidden",
                        openUp ? "bottom-full mb-2" : "top-full mt-2",
                        align === "right" ? "right-0" : "left-0"
                    )}
                >
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={cn(
                                    "w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center justify-between group",
                                    value === opt.value ? "bg-primary/10 text-primary font-bold" : "hover:bg-white/5 text-muted hover:text-foreground"
                                )}
                            >
                                <div className="flex flex-col">
                                    <span>{opt.label}</span>
                                    {opt.duration && <span className="text-[9px] opacity-60">{opt.duration}</span>}
                                </div>
                                {value === opt.value && <Check className="w-3.5 h-3.5" />}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    )
}

// ── REPEAT SELECTOR ───────────────────────────
export function RepeatSelector({ value, onChange }: { value: EventRepeat, onChange: (v: EventRepeat) => void }) {
    const options = [
        { value: "never", label: "Nunca" },
        { value: "daily", label: "Diariamente" },
        { value: "weekly", label: "Semanalmente" },
        { value: "monthly", label: "Mensalmente" },
        { value: "yearly", label: "Anualmente" },
    ]

    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground shrink-0">Repetir</span>
            <div className="w-36">
                <CustomDropdownSelect
                    value={value}
                    onChange={(v) => onChange(v as EventRepeat)}
                    options={options}
                    label="Repetir"
                    align="right"
                />
            </div>
        </div>
    )
}

// ── END TIME PICKER ──────────────────────────
export function EndTimePicker({ startTime, value, onChange }: { startTime: string, value: string, onChange: (v: string) => void }) {
    const [h, m] = startTime.split(":").map(Number)
    const startMinutes = h * 60 + m

    const options = []
    for (let i = 1; i <= 16; i++) {
        const currentMinutes = startMinutes + i * 30
        const hh = Math.floor(currentMinutes / 60) % 24
        const mm = currentMinutes % 60
        const timeStr = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`

        let durationLabel = ""
        const durMin = i * 30
        if (durMin < 60) durationLabel = `${durMin} min`
        else {
            const hrs = durMin / 60
            durationLabel = `${hrs % 1 === 0 ? hrs : hrs.toFixed(1).replace(".", ",")} ${hrs === 1 ? "hora" : "horas"}`
        }
        options.push({ value: timeStr, label: timeStr, duration: durationLabel })
    }

    return (
        <CustomDropdownSelect
            value={value}
            onChange={onChange}
            options={options}
            label="Escolher"
            align="right"
        />
    )
}

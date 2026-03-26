"use client"

import { useState } from "react"
import { X } from "lucide-react"

const QUICK_EMOJIS = ["✅", "💪", "📚", "🏃", "💧", "🧘", "🎸", "🥗", "😴", "🛁", "📖", "🙏", "💻", "🎯", "🌅", "🌙", "🏋️", "🍎", "🚴", "✍️"]

interface Props {
    onClose: () => void
    onSave: (name: string, emoji: string, xp: number) => Promise<void>
}

export function AddHabitModal({ onClose, onSave }: Props) {
    const [name, setName] = useState("")
    const [emoji, setEmoji] = useState("✅")
    const [xp, setXp] = useState(10)
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return
        setSaving(true)
        await onSave(name.trim(), emoji, xp)
        setSaving(false)
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#111] border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-white">Novo Hábito</h2>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Emoji picker */}
                    <div>
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                            Emoji
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_EMOJIS.map(e => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => setEmoji(e)}
                                    className={`
                                        w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all
                                        ${emoji === e
                                            ? "bg-primary/20 border border-primary ring-1 ring-primary/50"
                                            : "bg-white/5 border border-border hover:border-primary/40"
                                        }
                                    `}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nome */}
                    <div>
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                            Nome
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="ex: Acordar às 6h, Ler 30 min..."
                            maxLength={60}
                            className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors"
                        />
                    </div>

                    {/* XP */}
                    <div>
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                            XP por conclusão — <span className="text-primary">{xp} XP</span>
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={30}
                            value={xp}
                            onChange={e => setXp(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-muted mt-1">
                            <span>1 XP</span>
                            <span>30 XP</span>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-white hover:border-white/20 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || saving}
                            className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
                        >
                            {saving ? "Salvando..." : "Criar Hábito"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

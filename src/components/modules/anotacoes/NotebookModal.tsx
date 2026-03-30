"use client"

import { useState } from "react"
import { X } from "lucide-react"

const EMOJIS = ["📒", "📔", "📕", "📗", "📘", "📙", "📓", "📚", "✏️", "🖊️", "💡", "🔬", "🎨", "🎯", "🏋️", "🧘", "💻", "🎵", "🌱", "⭐"]
const COLORS = [
    "#a78bfa", "#818cf8", "#60a5fa", "#34d399", "#fbbf24",
    "#f87171", "#fb923c", "#e879f9", "#38bdf8", "#4ade80",
    "#f9a8d4", "#86efac", "#93c5fd", "#fcd34d", "#c4b5fd"
]

type Props = {
    onClose: () => void
    onSave: (nome: string, emoji: string, cor: string) => void
}

export function NotebookModal({ onClose, onSave }: Props) {
    const [nome, setNome] = useState("")
    const [emoji, setEmoji] = useState("📒")
    const [cor, setCor] = useState("#a78bfa")

    function handleSave() {
        if (!nome.trim()) return
        onSave(nome.trim(), emoji, cor)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="w-full max-w-md mx-4 bg-card-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-base font-semibold text-white">Novo Caderno</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Preview */}
                    <div className="flex items-center justify-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                            style={{ background: `${cor}20`, border: `2px solid ${cor}40` }}
                        >
                            {emoji}
                        </div>
                    </div>

                    {/* Nome */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted uppercase tracking-wider">Nome</label>
                        <input
                            type="text"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            placeholder="Meu caderno..."
                            autoFocus
                            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-primary/50 transition-colors"
                            onKeyDown={e => { if (e.key === "Enter") handleSave() }}
                        />
                    </div>

                    {/* Emoji */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted uppercase tracking-wider">Emoji</label>
                        <div className="flex flex-wrap gap-1.5">
                            {EMOJIS.map(e => (
                                <button
                                    key={e}
                                    onClick={() => setEmoji(e)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                                        emoji === e
                                            ? "bg-primary/20 ring-2 ring-primary/50"
                                            : "hover:bg-white/10"
                                    }`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cor */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted uppercase tracking-wider">Cor</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCor(c)}
                                    className={`w-6 h-6 rounded-full transition-transform ${
                                        cor === c ? "scale-125 ring-2 ring-white/50" : "hover:scale-110"
                                    }`}
                                    style={{ background: c }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-white/2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!nome.trim()}
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                    >
                        Criar Caderno
                    </button>
                </div>
            </div>
        </div>
    )
}

/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { Folder, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Colecao } from "@/types/colecao"
import { motion } from "framer-motion"

type Props = {
    colecao: Colecao
    onClick: () => void
    onEdit: () => void
    onDelete: () => void
}

export function ColecaoCard({ colecao, onClick, onEdit, onDelete }: Props) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    return (
        <motion.div
            className="relative group"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
        >
            {/* Card principal */}
            <button
                onClick={onClick}
                className="w-full aspect-3/4 rounded-xl overflow-hidden relative border border-border bg-card-background hover:border-primary/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
            >
                {colecao.capaUrl ? (
                    <img
                        src={colecao.capaUrl}
                        alt={colecao.nome}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                        <Folder className="w-10 h-10 text-primary/40" />
                    </div>
                )}

                {/* Overlay gradiente com nome */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-bold text-white leading-tight line-clamp-2 drop-shadow-md">
                        {colecao.nome}
                    </p>
                    <p className="text-[10px] text-white/60 mt-0.5">
                        {colecao.itemIds.length} {colecao.itemIds.length === 1 ? "item" : "itens"}
                    </p>
                </div>

                {/* Badge de coleção */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-primary/80 backdrop-blur-sm">
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Coleção</span>
                </div>
            </button>

            {/* Menu de contexto */}
            <div className="absolute top-2 right-2 z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); setConfirmDelete(false) }}
                    className={cn(
                        "p-1.5 rounded-lg backdrop-blur-sm transition-all",
                        menuOpen
                            ? "bg-black/60 text-white opacity-100"
                            : "bg-black/40 text-white/70 opacity-0 group-hover:opacity-100"
                    )}
                >
                    <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-border bg-card-background shadow-2xl shadow-black/40 z-50 overflow-hidden">
                        <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit() }}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground hover:bg-foreground/5 transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5 text-muted" />
                            Renomear
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (confirmDelete) {
                                    onDelete()
                                    setMenuOpen(false)
                                } else {
                                    setConfirmDelete(true)
                                }
                            }}
                            onMouseLeave={() => setConfirmDelete(false)}
                            className={cn(
                                "flex items-center gap-2 w-full px-3 py-2.5 text-sm transition-colors",
                                confirmDelete
                                    ? "bg-red-500/10 text-red-400"
                                    : "text-red-500 hover:bg-red-500/10"
                            )}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {confirmDelete ? "Tem certeza?" : "Excluir"}
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

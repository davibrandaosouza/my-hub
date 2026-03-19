"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ModalProps = {
    open: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
    // Fecha com ESC
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        if (open) document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [open, onClose])

    // Bloqueia scroll do body quando aberto
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    if (!open) return null

    return (
        // Overlay — clica fora para fechar
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Card — para propagação para não fechar ao clicar dentro */}
            <div
                className={cn(
                    "relative w-full max-w-lg rounded-2xl border border-border bg-card-background shadow-xl",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-sm font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    )
}
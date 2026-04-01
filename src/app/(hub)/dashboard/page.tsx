"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import {
    FileText, Timer, Tv, Film,
    MonitorPlay, Gamepad2, RotateCcw,
    BookHeart, Kanban,
    UploadCloud
} from "lucide-react"
import Link from "next/link"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { getDashboardImage, getDashboardEvents } from "@/lib/firebase/dashboard"
import { uploadDashboardImageAction, deleteDashboardImageAction } from "@/app/actions/dashboard"
import { ImageCropModal } from "@/components/dashboard/ImageCropModal"
import { Trash2, Check, X } from "lucide-react"
import { useToastContext } from "@/app/(hub)/layout"
import { getNotes } from "@/lib/firebase/anotacoes"
import type { Note } from "@/types/anotacao"
import type { DashboardEvent } from "@/types/dashboard"
import { RecentNotes } from "@/components/modules/dashboard/RecentNotes"
import { UpcomingEvents } from "@/components/modules/dashboard/UpcomingEvents"
import { useSettings } from "@/hooks/useSettings"

const quickAccessItems = [
    { label: "Devocionais", description: "Ver devocional", href: "/devocionais", icon: BookHeart },
    { label: "Planejamentos", description: "Ver tarefas", href: "/planejamentos", icon: Kanban },
    { label: "Anotações", description: "Ver notas", href: "/anotacoes", icon: FileText },
    { label: "Pomodoro", description: "Iniciar sessão", href: "/pomodoro", icon: Timer },
    { label: "Rotinas", description: "Ver hoje", href: "/rotinas", icon: RotateCcw },
    { label: "Animes", description: "Ver lista", href: "/animes", icon: Tv },
    { label: "Filmes", description: "Ver lista", href: "/filmes", icon: Film },
    { label: "Séries", description: "Ver lista", href: "/series", icon: MonitorPlay },
    { label: "Jogos", description: "Ver lista", href: "/jogos", icon: Gamepad2 },
]

export default function DashboardPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)
    const [recentNotes, setRecentNotes] = useState<Note[]>([])
    const [upcomingEvents, setUpcomingEvents] = useState<DashboardEvent[]>([])
    const [dataLoading, setDataLoading] = useState(true)

    const toast = useToastContext()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { settings } = useSettings()
    const firstName = settings.profile.displayName?.split(" ")[0] || "Usuário"

    const loadDashboardData = async (uid: string) => {
        try {
            const [notes, events] = await Promise.all([
                getNotes(uid),
                getDashboardEvents(uid)
            ])
            setRecentNotes(notes.slice(0, 5))
            setUpcomingEvents(events)
        } finally {
            setDataLoading(false)
        }
    }

    useEffect(() => {
        if (!user?.uid) return
        let isMounted = true

        async function load() {
            try {
                const url = await getDashboardImage(user!.uid)
                if (isMounted && url) setImageUrl(url)
                
                await loadDashboardData(user!.uid)
            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        void load()
        return () => { isMounted = false }
    }, [user])

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user?.uid) return

        const reader = new FileReader()
        reader.addEventListener("load", () => {
            setSelectedFile(reader.result as string)
            setIsCropModalOpen(true)
        })
        reader.readAsDataURL(file)

        // Limpar o input para permitir selecionar a mesma imagem se for deletada
        e.target.value = ""
    }

    const handleRemoveImage = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDeleteConfirm(true)
    }

    const cancelRemoveImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDeleteConfirm(false)
    }

    const confirmRemoveImage = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user?.uid || !imageUrl) return

        try {
            setUploading(true)
            await deleteDashboardImageAction(imageUrl)
            const userDocRef = doc(db, "dashboard", user.uid)
            await setDoc(userDocRef, { imageUrl: null }, { merge: true })
            setImageUrl(null)
            setIsDeleteConfirm(false)
            toast.success("Imagem removida com sucesso!")
        } catch (error) {
            console.error("Erro ao remover imagem:", error)
            alert("Erro ao remover imagem. Tente novamente.")
        } finally {
            setUploading(false)
        }
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        if (!user?.uid) return
        setIsCropModalOpen(false)

        try {
            setUploading(true)
            const formData = new FormData()
            // Transformar blob em File para o Server Action
            const file = new File([croppedBlob], "lembranca.jpg", { type: "image/jpeg" })
            formData.append("file", file)

            // 1. Upload para o Vercel Blob e deletar antiga (no servidor)
            const url = await uploadDashboardImageAction(user.uid, formData, imageUrl)

            // 2. Salvar link no Firestore (no cliente, onde temos Auth)
            const userDocRef = doc(db, "dashboard", user.uid)
            await setDoc(userDocRef, { imageUrl: url }, { merge: true })

            setImageUrl(url)
        } catch (error: unknown) {
            console.error("Erro ao fazer upload da imagem recortada:", error)
            const err = error as { message?: string; digest?: string }
            const isSizeError = err.message?.includes("exceeded 1 MB limit") || err.digest?.includes("2427213769")

            if (isSizeError) {
                alert("A imagem é muito grande! Tente uma imagem com menos zoom ou menor.")
            } else {
                alert("Erro ao salvar imagem. Verifique sua conexão ou se as permissões foram configuradas.")
            }
        } finally {
            setUploading(false)
            setSelectedFile(null)
        }
    }

    return (
        <div>
            <Header title="Dashboard" />

            <div className="p-6 space-y-6">

                {/* ── BANNER ── */}
                {loading ? (
                    <Skeleton className="h-[88px] w-full rounded-xl" />
                ) : (
                    <div className="rounded-xl bg-linear-to-r from-primary/20 to-primary-active/10 border border-primary/20 p-6">
                        <h2 className="text-xl font-bold text-foreground mb-1">
                            Bem-vindo de volta, {firstName}! 👋
                        </h2>
                        <p className="text-sm text-muted italic">
                            {'"Seu futuro é criado pelo que você faz hoje."'}
                        </p>
                    </div>
                )}

                {/* ── CONTEÚDO PRINCIPAL (ACESSO RÁPIDO + UPLOAD) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Acesso Rápido - 2/3 do espaço */}
                    <div className="lg:col-span-2">
                        <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-3">
                            Acesso Rápido
                        </p>
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <Skeleton key={i} className="h-[96px] rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {quickAccessItems.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="rounded-xl border border-border bg-card-background p-4 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                                        >
                                            <Icon className="w-5 h-5 text-primary mb-3" />
                                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                {item.label}
                                            </p>
                                            <p className="text-xs text-muted mt-0.5">{item.description}</p>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Upload de Imagem - 1/3 do espaço */}
                    <div className="lg:col-span-1 flex flex-col">
                        <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-3 md:mt-0 mt-4">
                            Lembrança
                        </p>
                        <div
                            className={`flex-1 w-full rounded-xl border-2 border-dashed border-border bg-card-background/40 flex flex-col items-center justify-center p-6 transition-all group relative overflow-hidden min-h-[220px] ${!uploading && !isDeleteConfirm ? "hover:border-primary/50 hover:bg-primary/5 cursor-pointer" : ""}`}
                            onClick={() => !uploading && !isDeleteConfirm && fileInputRef.current?.click()}
                        >
                            {uploading ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3"></div>
                                    <p className="text-sm font-medium text-foreground">Salvando...</p>
                                </div>
                            ) : imageUrl ? (
                                <div className="absolute inset-0 w-full h-full group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrl} alt="Lembrança do Dashboard" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                                        <div className="flex items-center gap-3">
                                            {!isDeleteConfirm ? (
                                                <button
                                                    onClick={handleRemoveImage}
                                                    className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 backdrop-blur-sm shadow-xl flex items-center justify-center transition-colors group/delete"
                                                    title="Remover Foto"
                                                >
                                                    <Trash2 className="w-5 h-5 text-red-400 group-hover/delete:text-red-300" />
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={confirmRemoveImage}
                                                        className="w-10 h-10 rounded-full bg-emerald-500/40 hover:bg-emerald-500/60 backdrop-blur-sm shadow-xl flex items-center justify-center transition-colors group/confirm"
                                                        title="Confirmar Remoção"
                                                    >
                                                        <Check className="w-5 h-5 text-emerald-100 group-hover/confirm:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={cancelRemoveImage}
                                                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm shadow-xl flex items-center justify-center transition-colors group/cancel"
                                                        title="Cancelar"
                                                    >
                                                        <X className="w-5 h-5 text-foreground group-hover/cancel:scale-110 transition-transform" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-foreground shadow-sm">
                                            {isDeleteConfirm ? "Confirmar remoção?" : "Deseja remover a imagem?"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                                        <UploadCloud className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground mb-2 text-center text-balance">
                                        Adicionar Imagem
                                    </h3>
                                    <p className="text-[11px] text-muted text-center max-w-[150px]">
                                        Clique ou arraste uma foto para destacar aqui
                                    </p>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                onChange={handleFileSelection}
                                disabled={uploading}
                            />
                        </div>
                    </div>

                </div>

                {isCropModalOpen && selectedFile && (
                    <ImageCropModal
                        image={selectedFile}
                        onClose={() => {
                            setIsCropModalOpen(false)
                            setSelectedFile(null)
                        }}
                        onCropComplete={handleCropComplete}
                    />
                )}

                {/* ── PRÓXIMOS EVENTOS + NOTAS RECENTES ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <UpcomingEvents 
                        userId={user?.uid || ""}
                        events={upcomingEvents}
                        loading={dataLoading}
                        onUpdate={() => user?.uid && loadDashboardData(user.uid)}
                    />
                    <RecentNotes 
                        notes={recentNotes}
                        loading={dataLoading}
                    />
                </div>

            </div>
        </div>
    )
}
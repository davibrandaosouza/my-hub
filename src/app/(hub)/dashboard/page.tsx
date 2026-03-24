"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import {
    FileText, Timer, Tv, Film,
    MonitorPlay, Gamepad2, Guitar, RotateCcw,
    BookHeart, Calendar, FileEdit,
    Clock, Kanban,
    GraduationCap,
    Code2,
    UploadCloud
} from "lucide-react"
import Link from "next/link"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { getDashboardImage } from "@/lib/firebase/dashboard"
import { uploadDashboardImageAction } from "@/app/actions/dashboard"
import { ImageCropModal } from "@/components/dashboard/ImageCropModal"

const quickAccessItems = [
    { label: "Devocionais", description: "Ver devocional", href: "/devocionais", icon: BookHeart },
    { label: "Planejamentos", description: "Ver tarefas", href: "/planejamentos", icon: Kanban },
    { label: "Anotações", description: "Ver notas", href: "/anotacoes", icon: FileText },
    { label: "Pomodoro", description: "Iniciar sessão", href: "/pomodoro", icon: Timer },
    { label: "Rotinas", description: "Ver hoje", href: "/rotinas", icon: RotateCcw },
    { label: "Guitarra", description: "Praticar", href: "/guitarra", icon: Guitar },
    { label: "UFES", description: "Ver matérias", href: "/ufes", icon: GraduationCap },
    { label: "Programação", description: "Estudar", href: "/programacao", icon: Code2 },
    { label: "Animes", description: "Ver lista", href: "/animes", icon: Tv },
    { label: "Filmes", description: "Ver lista", href: "/filmes", icon: Film },
    { label: "Séries", description: "Ver lista", href: "/series", icon: MonitorPlay },
    { label: "Jogos", description: "Ver lista", href: "/jogos", icon: Gamepad2 },
]

const upcomingEvents = [
    { time: "09:00", title: "Reunião da equipe", tag: "Trabalho", tagColor: "bg-blue-500/20 text-blue-400" },
    { time: "12:30", title: "Almoço com amigos", tag: "Pessoal", tagColor: "bg-purple-500/20 text-purple-400" },
    { time: "15:00", title: "Revisão de projeto", tag: "Trabalho", tagColor: "bg-blue-500/20 text-blue-400" },
    { time: "18:00", title: "Academia", tag: "Saúde", tagColor: "bg-emerald-500/20 text-emerald-400" },
]

const recentNotes = [
    { title: "Ideias de projetos para Q2", preview: "Ideias para novas funcionalidades...", when: "Hoje" },
    { title: "Notas de reunião - Cliente", preview: "Pontos-chave discutidos...", when: "Ontem" },
    { title: "Recomendações de livros", preview: "Lista de livros para ler...", when: "2 dias atrás" },
]

export default function DashboardPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)

    const firstName = user?.displayName?.split(" ")[0] ?? "de volta"

    useEffect(() => {
        if (!user?.uid) return
        let isMounted = true

        async function load() {
            try {
                const url = await getDashboardImage(user!.uid)
                if (isMounted && url) setImageUrl(url)
            } catch (error) {
                console.error("Erro ao carregar imagem:", error)
                // Even on error, we should stop the initial skeleton
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
                        <h2 className="text-xl font-bold text-white mb-1">
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
                                            <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
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
                        <label className={`flex-1 w-full rounded-xl border-2 border-dashed border-border bg-card-background/40 flex flex-col items-center justify-center p-6 transition-all group relative overflow-hidden min-h-[220px] ${!imageUrl && !uploading ? "hover:border-primary/50 hover:bg-primary/5 cursor-pointer" : "cursor-pointer"}`}>
                            {uploading ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3"></div>
                                    <p className="text-sm font-medium text-white">Salvando...</p>
                                </div>
                            ) : imageUrl ? (
                                <div className="absolute inset-0 w-full h-full group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrl} alt="Lembrança do Dashboard" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm shadow-xl flex items-center justify-center mb-2">
                                            <UploadCloud className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-white shadow-sm">Alterar Foto</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                                        <UploadCloud className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-white mb-2 text-center text-balance">
                                        Adicionar Imagem
                                    </h3>
                                    <p className="text-[11px] text-muted text-center max-w-[150px]">
                                        Clique ou arraste uma foto para destacar aqui
                                    </p>
                                </>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                onChange={handleFileSelection}
                                disabled={uploading}
                            />
                        </label>
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
                    {loading ? (
                        <>
                            <Skeleton className="h-[220px] rounded-xl" />
                            <Skeleton className="h-[220px] rounded-xl" />
                        </>
                    ) : (
                        <>
                            <div className="rounded-xl border border-border bg-card-background p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-semibold text-white">Próximos Eventos</h3>
                                </div>
                                <div className="space-y-3">
                                    {upcomingEvents.map((event) => (
                                        <div key={event.title} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-muted">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-xs font-mono">{event.time}</span>
                                                </div>
                                                <span className="text-sm text-white">{event.title}</span>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.tagColor}`}>
                                                {event.tag}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-card-background p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileEdit className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-semibold text-white">Notas Recentes</h3>
                                </div>
                                <div className="space-y-4">
                                    {recentNotes.map((note) => (
                                        <div key={note.title} className="flex items-start justify-between gap-4">
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-white truncate">{note.title}</p>
                                                <p className="text-xs text-muted truncate mt-0.5">{note.preview}</p>
                                            </div>
                                            <span className="text-xs text-muted shrink-0">{note.when}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import {
    FileText, Timer, Tv, Film,
    MonitorPlay, Gamepad2, Guitar, RotateCcw,
    BookHeart, CheckCircle, Flame, Calendar, FileEdit,
    Clock, Kanban
} from "lucide-react"
import Link from "next/link"
import { getDevocionalsByYear, getDevocionalsByMonth, calculateStreak } from "@/lib/firebase/devocionais"

const quickAccessItems = [
    { label: "Planejamentos", description: "Ver tarefas", href: "/planejamentos", icon: Kanban },
    { label: "Anotações", description: "Ver notas", href: "/anotacoes", icon: FileText },
    { label: "Pomodoro", description: "Iniciar sessão", href: "/pomodoro", icon: Timer },
    { label: "Animes", description: "Ver lista", href: "/animes", icon: Tv },
    { label: "Filmes", description: "Ver lista", href: "/filmes", icon: Film },
    { label: "Séries", description: "Ver lista", href: "/series", icon: MonitorPlay },
    { label: "Jogos", description: "Ver lista", href: "/jogos", icon: Gamepad2 },
    { label: "Guitarra", description: "Praticar", href: "/guitarra", icon: Guitar },
    { label: "Rotinas", description: "Ver hoje", href: "/rotinas", icon: RotateCcw },
    { label: "Devocionais", description: "Ver devocional", href: "/devocionais", icon: BookHeart },
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

type DashboardStats = {
    streak: number
    devocionalHoje: boolean
}

export default function DashboardPage() {
    const { user } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    const firstName = user?.displayName?.split(" ")[0] ?? "de volta"
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const today = new Date().toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).split("/").reverse().join("-")

    useEffect(() => {
        if (!user?.uid) return
        async function loadStats() {
            const [yearData, monthData] = await Promise.all([
                getDevocionalsByYear(user!.uid, currentYear),
                getDevocionalsByMonth(user!.uid, currentYear, currentMonth),
            ])
            const streak = calculateStreak(yearData)
            const devocionalHoje = yearData.some(d => d.date === today && d.completed)
            setStats({ streak, devocionalHoje })
            setLoading(false)
        }
        void loadStats()
    }, [user?.uid, currentYear, currentMonth, today])

    const statsCards = [
        { icon: CheckCircle, label: "Tarefas Feitas", value: "—", color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { icon: Timer, label: "Pomodoros", value: "—", color: "text-orange-400", bg: "bg-orange-400/10" },
        { icon: BookHeart, label: "Devocional", value: stats?.devocionalHoje ? "✓" : "—", color: "text-yellow-400", bg: "bg-yellow-400/10" },
        { icon: Flame, label: "Sequência", value: stats ? `${stats.streak}d` : "0d", color: "text-red-400", bg: "bg-red-400/10" },
    ]

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

                {/* ── CARDS DE STATS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-[74px] rounded-xl" />
                        ))
                    ) : (
                        statsCards.map((card) => {
                            const Icon = card.icon
                            return (
                                <div
                                    key={card.label}
                                    className="rounded-xl border border-border bg-card-background p-4 flex items-center gap-4"
                                >
                                    <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white leading-none mb-1">{card.value}</p>
                                        <p className="text-xs text-muted">{card.label}</p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* ── ACESSO RÁPIDO ── */}
                <div>
                    <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-3">
                        Acesso Rápido
                    </p>
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <Skeleton key={i} className="h-[96px] rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
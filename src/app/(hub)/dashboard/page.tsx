"use client"

import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/layout/Header"
import {
    LayoutDashboard, FileText, Timer, Tv, Film,
    MonitorPlay, Gamepad2, Guitar, RotateCcw,
    BookHeart, CheckCircle, Flame, Calendar, FileEdit,
    Clock, GraduationCap, CodeXml
} from "lucide-react"
import Link from "next/link"

// ── DADOS ESTÁTICOS (temporários — virão do Firestore depois) ──
const statsCards = [
    { icon: CheckCircle, label: "Tarefas Feitas", value: "7", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { icon: Timer, label: "Pomodoros", value: "4", color: "text-orange-400", bg: "bg-orange-400/10" },
    { icon: BookHeart, label: "Devocional", value: "Feito", color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { icon: Flame, label: "Sequência", value: "12d", color: "text-red-400", bg: "bg-red-400/10" },
]

const quickAccessItems = [
    { label: "Devocionais", description: "Dia 12", href: "/devocionais", icon: BookHeart },
    { label: "Planejamentos", description: "3 em progresso", href: "/planejamentos", icon: LayoutDashboard },
    { label: "Anotações", description: "12 notas", href: "/anotacoes", icon: FileText },
    { label: "Pomodoro", description: "Iniciar sessão", href: "/pomodoro", icon: Timer },
    { label: "Rotinas", description: "85% hoje", href: "/rotinas", icon: RotateCcw },
    { label: "Guitarra", description: "8d sequência", href: "/guitarra", icon: Guitar },
    { label: "UFES", description: "Cursando 4 disciplinas", href: "/ufes", icon: GraduationCap },
    { label: "Programação", description: "Estudando Next.js", href: "/programacao", icon: CodeXml },
    { label: "Animes", description: "2 assistindo", href: "/animes", icon: Tv },
    { label: "Filmes", description: "6 filmes", href: "/filmes", icon: Film },
    { label: "Séries", description: "2 assistindo", href: "/series", icon: MonitorPlay },
    { label: "Jogos", description: "2 jogando", href: "/jogos", icon: Gamepad2 },
]

const upcomingEvents = [
    { time: "09:00", title: "Reunião da equipe", tag: "Trabalho", tagColor: "bg-blue-500/20 text-blue-400" },
    { time: "12:30", title: "Almoço com amigos", tag: "Pessoal", tagColor: "bg-purple-500/20 text-purple-400" },
    { time: "15:00", title: "Revisão de projeto", tag: "Trabalho", tagColor: "bg-blue-500/20 text-blue-400" },
    { time: "18:00", title: "Academia", tag: "Saúde", tagColor: "bg-emerald-500/20 text-emerald-400" },
]

const recentNotes = [
    { title: "Ideias de projetos para Q2", preview: "Ideias para novas funcionalidades e melhorias...", when: "Hoje" },
    { title: "Notas de reunião - Cliente", preview: "Pontos-chave discutidos durante a reunião...", when: "Ontem" },
    { title: "Recomendações de livros", preview: "Lista de livros para ler este mês...", when: "2 dias atrás" },
]

export default function DashboardPage() {
    const { user } = useAuth()
    const firstName = user?.displayName?.split(" ")[0] ?? "de volta"

    return (
        <div>
            <Header title="Dashboard" />

            <div className="p-6">

                {/* ── BANNER DE BOAS-VINDAS ── */}
                <div className="rounded-xl bg-linear-to-r from-primary/20 to-primary-active/10 border border-primary/20 p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">
                        Bem-vindo de volta, {firstName}! 👋
                    </h2>
                    <p className="text-sm text-muted italic">
                        {'"Seu futuro é criado pelo que você faz hoje."'}
                    </p>
                </div>

                {/* ── CARDS DE STATS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statsCards.map((card) => {
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
                    })}
                </div>

                {/* ── ACESSO RÁPIDO ── */}
                <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-3">
                    Acesso Rápido
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
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

                {/* ── PRÓXIMOS EVENTOS + NOTAS RECENTES ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Próximos Eventos */}
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

                    {/* Notas Recentes */}
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

                </div>

            </div> {/* fim p-6 */}
        </div>
    )
}
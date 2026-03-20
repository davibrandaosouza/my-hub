"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    BookHeart, LayoutDashboard, FileText,
    Timer, Tv, Film, MonitorPlay, Gamepad2, Guitar,
    Settings, ChevronRight, ChevronDown, LogOut, RotateCcw,
    GraduationCap, Code2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/firebase/auth"
import { Modal } from "@/components/ui/modal"
import { useToastContext } from "@/app/(hub)/layout"

// ── TIPOS ──────────────────────────────────────────
type NavItem = {
    label: string
    href: string
    icon: React.ElementType
}

type NavGroup = {
    title: string
    items: NavItem[]
}

// ── ESTRUTURA DA NAVEGAÇÃO ──────────────────────────
const navGroups: NavGroup[] = [
    {
        title: "Visão Geral",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        title: "Espiritual",
        items: [
            { label: "Devocionais", href: "/devocionais", icon: BookHeart },
        ],
    },
    {
        title: "Produtividade",
        items: [
            { label: "Planejamentos", href: "/planejamentos", icon: LayoutDashboard },
            { label: "Anotações", href: "/anotacoes", icon: FileText },
            { label: "Pomodoro", href: "/pomodoro", icon: Timer },
            { label: "Rotinas", href: "/rotinas", icon: RotateCcw },
        ],
    },
    {
        title: "Estudos",
        items: [
            { label: "Guitarra", href: "/guitarra", icon: Guitar },
            { label: "UFES", href: "/ufes", icon: GraduationCap },
            { label: "Programação", href: "/programacao", icon: Code2 },
        ],
    },
    {
        title: "Entretenimento",
        items: [
            { label: "Animes", href: "/animes", icon: Tv },
            { label: "Filmes", href: "/filmes", icon: Film },
            { label: "Séries", href: "/series", icon: MonitorPlay },
            { label: "Jogos", href: "/jogos", icon: Gamepad2 },
        ],
    },
]

// ── COMPONENTE ──────────────────────────────────────
export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)
    const [closedGroups, setClosedGroups] = useState<string[]>([])
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const toast = useToastContext()

    const toggleGroup = (title: string) => {
        setClosedGroups(prev =>
            prev.includes(title)
                ? prev.filter(g => g !== title)
                : [...prev, title]
        )
    }

    const handleLogout = async () => {
        await logout()
        await fetch("/api/auth/session", { method: "DELETE" })
        toast.success("Até logo!")
        router.push("/login")
    }

    return (
        <aside
            className={cn(
                "relative z-20 flex flex-col h-screen border-r border-border bg-card-background transition-all duration-300",
                collapsed ? "w-[68px]" : "w-[260px]"
            )}
        >
            {/* ── TOPO: AVATAR + NOME ── */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
                <div className="shrink-0 w-9 h-9 rounded-full bg-linear-to-br from-primary to-primary-active flex items-center justify-center text-white font-bold text-sm">
                    M
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">MyHub</p>
                        <p className="text-xs text-muted truncate">Painel Pessoal</p>
                    </div>
                )}
            </div>

            {/* ── BOTÃO COLAPSAR ── */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-[62px] z-10 w-6 h-6 rounded-full bg-card-background border border-border flex items-center justify-center text-muted hover:text-white transition-colors"
            >
                <ChevronRight
                    className={cn("w-3 h-3 transition-transform duration-300", collapsed ? "" : "rotate-180")}
                />
            </button>

            {/* ── NAVEGAÇÃO ── */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1">
                {navGroups.map((group) => {
                    const isGroupClosed = closedGroups.includes(group.title)

                    return (
                        <div key={group.title}>
                            {/* Label do grupo — só aparece quando expandido */}
                            {!collapsed && (
                                <button
                                    onClick={() => toggleGroup(group.title)}
                                    className="w-full flex items-center justify-between px-4 py-1.5 mb-1 group"
                                >
                                    <span className="text-[11px] font-semibold tracking-wider text-muted uppercase">
                                        {group.title}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            "w-3 h-3 text-muted transition-transform",
                                            isGroupClosed ? "-rotate-90" : ""
                                        )}
                                    />
                                </button>
                            )}

                            {/* Items do grupo */}
                            {(!isGroupClosed || collapsed) && (
                                <div className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const Icon = item.icon
                                        const isActive = pathname === item.href

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-all",
                                                    isActive
                                                        ? "bg-primary/20 text-primary font-medium"
                                                        : "text-muted hover:bg-white/5 hover:text-white",
                                                    collapsed && "justify-center px-2"
                                                )}
                                                title={collapsed ? item.label : undefined}
                                            >
                                                <Icon className="w-4 h-4 shrink-0" />
                                                {!collapsed && <span>{item.label}</span>}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* ── RODAPÉ: CONFIGURAÇÕES + SAIR ── */}
            <div className="border-t border-border p-2 space-y-0.5">
                <Link
                    href="/configuracoes"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:bg-white/5 hover:text-white transition-all",
                        collapsed && "justify-center"
                    )}
                    title={collapsed ? "Configurações" : undefined}
                >
                    <Settings className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Configurações</span>}
                </Link>
                <button
                    onClick={() => setShowLogoutModal(true)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:bg-red-500/10 hover:text-red-400 transition-all",
                        collapsed && "justify-center"
                    )}
                    title={collapsed ? "Sair" : undefined}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Sair</span>}
                </button>
            </div>
            <Modal
                open={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Sair da conta"
            >
                <div className="space-y-5">
                    <p className="text-sm text-muted">
                        Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o MyHub.
                    </p>
                    <div className="flex items-center gap-3 justify-end">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="px-4 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </Modal>
        </aside>
    )
}
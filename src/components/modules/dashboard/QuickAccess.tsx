import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import {
    FileText, Timer, Tv, Film,
    MonitorPlay, Gamepad2, RotateCcw,
    BookHeart, Kanban
} from "lucide-react"

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

interface QuickAccessProps {
  loading?: boolean
}

export function QuickAccess({ loading }: QuickAccessProps) {
  return (
    <div className="lg:col-span-2">
      <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-3">
        Acesso Rápido
      </p>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
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
  )
}

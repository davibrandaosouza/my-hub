import { Skeleton } from "@/components/ui/skeleton"

interface DashboardBannerProps {
  firstName: string
  loading?: boolean
}

export function DashboardBanner({ firstName, loading }: DashboardBannerProps) {
  if (loading) {
    return <Skeleton className="h-[88px] w-full rounded-xl" />
  }

  return (
    <div className="rounded-xl bg-linear-to-r from-primary/20 to-primary-active/10 border border-primary/20 p-4 sm:p-6 transition-all">
      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
        Bem-vindo de volta, {firstName}! 👋
      </h2>
      <p className="text-xs sm:text-sm text-muted italic">
        {'"Seu futuro é criado pelo que você faz hoje."'}
      </p>
    </div>
  )
}

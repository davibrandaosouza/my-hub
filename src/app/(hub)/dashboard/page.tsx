"use client"

import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/layout/Header"
import { useDashboardData } from "@/hooks/useDashboardData"
import { RecentNotes } from "@/components/modules/dashboard/RecentNotes"
import { UpcomingEvents } from "@/components/modules/dashboard/UpcomingEvents"
import { useSettings } from "@/hooks/useSettings"
import { DashboardBanner } from "@/components/modules/dashboard/DashboardBanner"
import { QuickAccess } from "@/components/modules/dashboard/QuickAccess"
import { MemoryUpload } from "@/components/modules/dashboard/MemoryUpload"

export default function DashboardPage() {
    const { user } = useAuth()
    const { settings } = useSettings()

    const {
        events,
        notes,
        isLoading: dataLoading,
        refetch: refetchDashboard
    } = useDashboardData(user?.uid)

    const firstName = settings.profile.displayName?.split(" ")[0] || "Usuário"

    return (
        <div>
            <Header title="Dashboard" />

            <div className="p-6 space-y-6">
                {/* ── BANNER ── */}
                <DashboardBanner
                    firstName={firstName}
                    loading={!user}
                />

                {/* ── CONTEÚDO PRINCIPAL (ACESSO RÁPIDO + UPLOAD) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <QuickAccess loading={!user} />
                    <MemoryUpload userId={user?.uid} />
                </div>

                {/* ── PRÓXIMOS EVENTOS + NOTAS RECENTES ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <UpcomingEvents
                        userId={user?.uid || ""}
                        events={events}
                        loading={dataLoading}
                        onUpdate={refetchDashboard}
                    />
                    <RecentNotes
                        notes={notes}
                        loading={dataLoading}
                    />
                </div>
            </div>
        </div>
    )
}
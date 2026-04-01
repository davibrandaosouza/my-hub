"use client"

import { Header } from "@/components/layout/Header"
import { ProfileSettings } from "@/components/modules/configuracoes/ProfileSettings"
import { AppearanceSettings } from "@/components/modules/configuracoes/AppearanceSettings"
import { PomodoroSettingsBlock } from "@/components/modules/configuracoes/PomodoroSettingsBlock"
import { EntertainmentSettings } from "@/components/modules/configuracoes/EntertainmentSettings"
import { BehaviorSettings } from "@/components/modules/configuracoes/BehaviorSettings"
import { useSettings } from "@/hooks/useSettings"

export default function ConfiguracoesPage() {
    const { loading } = useSettings()

    return (
        <div className="flex flex-col min-h-full">
            <Header title="Configurações" />
            
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
            ) : (
                <div className="p-6 max-w-4xl mx-auto w-full space-y-8 pb-20">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">Preferências</h1>
                            <p className="text-sm text-muted">Ajuste o MyHub de acordo com o seu estilo.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <ProfileSettings />
                        <AppearanceSettings />
                        <PomodoroSettingsBlock />
                        <EntertainmentSettings />
                        <BehaviorSettings />
                    </div>
                </div>
            )}
        </div>
    )
}

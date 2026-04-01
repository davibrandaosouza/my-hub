"use client"

import { useSettings } from "@/hooks/useSettings"
import { useAuth } from "@/hooks/useAuth"
import { Bell } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function BehaviorSettings() {
    const { user } = useAuth()
    const { settings, updateBehavior } = useSettings()

    const handleToggle = async (key: keyof typeof settings.behavior) => {
        if (!user?.uid) return
        const newValue = !settings.behavior[key]
        await updateBehavior(user.uid, { [key]: newValue })
    }

    return (
        <div className="rounded-xl border border-border bg-card-background p-6">
            <div className="flex items-center gap-2 mb-6 text-foreground font-medium">
                <Bell className="w-5 h-5 text-primary" />
                <h2>Notificações e Comportamento</h2>
            </div>
            
            <div className="flex flex-col space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
                        <p className="text-xs text-muted">Receber lembretes de rotinas e pomodoro</p>
                    </div>
                    <Switch 
                        checked={settings.behavior.notifications}
                        onCheckedChange={() => handleToggle("notifications")}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Efeitos Sonoros</h3>
                        <p className="text-xs text-muted">Sons ao completar tarefas e sessões</p>
                    </div>
                    <Switch 
                        checked={settings.behavior.soundEffects}
                        onCheckedChange={() => handleToggle("soundEffects")}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Salvar Notas Automaticamente</h3>
                        <p className="text-xs text-muted">Auto-salvar anotações enquanto digita</p>
                    </div>
                    <Switch 
                        checked={settings.behavior.autoSaveNotes}
                        onCheckedChange={() => handleToggle("autoSaveNotes")}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Mostrar Sequências</h3>
                        <p className="text-xs text-muted">Exibir contadores de sequência nas rotinas</p>
                    </div>
                    <Switch 
                        checked={settings.behavior.showStreaks}
                        onCheckedChange={() => handleToggle("showStreaks")}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
            </div>
        </div>
    )
}

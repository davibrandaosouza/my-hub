"use client"

import { useSettings } from "@/hooks/useSettings"
import { useAuth } from "@/hooks/useAuth"
import { Palette, Moon, Sun, Monitor } from "lucide-react"

const PRIMARY_COLORS = [
    { label: "Roxo", value: "#600dbf" },
    { label: "Ciano", value: "#06b6d4" },
    { label: "Esmeralda", value: "#10b981" },
    { label: "Laranja", value: "#f97316" },
    { label: "Rosa", value: "#ec4899" },
    { label: "Vermelho", value: "#ef4444" },
    { label: "Amarelo", value: "#eab308" },
    { label: "Azul", value: "#3b82f6" },
]

export function AppearanceSettings() {
    const { user } = useAuth()
    const { settings, updateAppearance } = useSettings()

    const handleThemeChange = async (theme: "dark" | "light" | "system") => {
        if (!user?.uid) return
        await updateAppearance(user.uid, { theme })
    }

    const handleColorChange = async (color: string) => {
        if (!user?.uid) return
        await updateAppearance(user.uid, { primaryColor: color })
    }



    return (
        <div className="rounded-xl border border-border bg-card-background p-6">
            <div className="flex items-center gap-2 mb-6 text-foreground font-medium">
                <Palette className="w-5 h-5 text-primary" />
                <h2>Aparência</h2>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-sm font-medium text-foreground block mb-3">Tema</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            onClick={() => handleThemeChange("dark")}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${settings.appearance.theme === "dark" ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-background text-muted hover:text-foreground"}`}
                        >
                            <Moon className="w-4 h-4" />
                            Escuro
                        </button>
                        <button
                            onClick={() => handleThemeChange("light")}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${settings.appearance.theme === "light" ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-background text-muted hover:text-foreground"}`}
                        >
                            <Sun className="w-4 h-4" />
                            Claro
                        </button>
                        <button
                            onClick={() => handleThemeChange("system")}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${settings.appearance.theme === "system" ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-background text-muted hover:text-foreground"}`}
                        >
                            <Monitor className="w-4 h-4" />
                            Sistema
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-foreground block mb-3">Cor Primária</label>
                    <div className="flex flex-wrap gap-3">
                        {PRIMARY_COLORS.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => handleColorChange(color.value)}
                                title={color.label}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${settings.appearance.primaryColor === color.value ? "border-white" : "border-transparent"}`}
                                style={{ backgroundColor: color.value }}
                            >
                                {settings.appearance.primaryColor === color.value && (
                                    <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}

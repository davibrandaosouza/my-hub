"use client"

import { useSettings } from "@/hooks/useSettings"
import { useAuth } from "@/hooks/useAuth"
import { Star, Smile } from "lucide-react"

export function EntertainmentSettings() {
    const { user } = useAuth()
    const { settings, updateEntertainment } = useSettings()

    const handleFormatChange = async (format: "default" | "integers" | "stars" | "emojis") => {
        if (!user?.uid) return
        await updateEntertainment(user.uid, { ratingFormat: format })
    }

    const currentFormat = settings.entertainment.ratingFormat || "default"

    return (
        <div className="rounded-xl border border-border bg-card-background p-6">
            <div className="flex items-center gap-2 mb-6 text-foreground font-medium">
                <Star className="w-5 h-5 text-primary" />
                <h2>Avaliações de Entretenimento</h2>
            </div>
            
            <p className="text-sm text-muted mb-4">
                Escolha o formato padrão que será usado ao dar nota para Animes, Filmes, Séries e Jogos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => handleFormatChange("default")}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${currentFormat === "default" ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/50"}`}
                >
                    <span className={`font-semibold mb-1 ${currentFormat === "default" ? "text-primary" : "text-foreground"}`}>Classificação Padrão (Decimais)</span>
                    <span className="text-xs text-muted block">0.0, 0.5, 1.0, 1.5 ... 9.5, 10.0</span>
                    <div className="mt-3 text-sm text-muted w-full px-3 py-1.5 rounded bg-foreground/5 flex gap-2">Ex: <span className="text-foreground">9.5</span></div>
                </button>

                <button
                    onClick={() => handleFormatChange("integers")}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${currentFormat === "integers" ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/50"}`}
                >
                    <span className={`font-semibold mb-1 ${currentFormat === "integers" ? "text-primary" : "text-foreground"}`}>Números Inteiros</span>
                    <span className="text-xs text-muted block">0, 1, 2, 3 ... 9, 10</span>
                    <div className="mt-3 text-sm text-muted w-full px-3 py-1.5 rounded bg-foreground/5 flex gap-2">Ex: <span className="text-foreground">8</span></div>
                </button>

                <button
                    onClick={() => handleFormatChange("stars")}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${currentFormat === "stars" ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/50"}`}
                >
                    <span className={`font-semibold mb-1 ${currentFormat === "stars" ? "text-primary" : "text-foreground"}`}>Estrelas (1 a 5)</span>
                    <span className="text-xs text-muted block">Uma a Cinco Estrelas ⭐</span>
                    <div className="mt-3 text-sm text-muted w-full px-3 py-1.5 rounded bg-foreground/5 flex gap-2">
                        Ex: <div className="flex text-yellow-500 fill-yellow-500"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 text-muted fill-transparent"/></div>
                    </div>
                </button>

                <button
                    onClick={() => handleFormatChange("emojis")}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${currentFormat === "emojis" ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/50"}`}
                >
                    <span className={`font-semibold mb-1 ${currentFormat === "emojis" ? "text-primary" : "text-foreground"}`}>Reações (Emojis)</span>
                    <span className="text-xs text-muted block">Triste, Neutro, Feliz</span>
                    <div className="mt-3 text-sm text-muted w-full px-3 py-1.5 rounded bg-foreground/5 flex gap-2 items-center">
                        Ex: <Smile className="w-5 h-5 text-green-500 fill-green-500/20" />
                    </div>
                </button>
            </div>
            
            <p className="text-xs text-muted mt-5">
                <strong>Atenção:</strong> Alterar o formato de notas mudará apenas a forma como as notas são selecionadas e exibidas a partir de agora. As configurações e dados brutos do sistema não são perdidos em caso de troca.
            </p>
        </div>
    )
}

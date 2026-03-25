"use client"

import { Header } from "@/components/layout/Header"
import { PomodoroTimer } from "@/components/modules/pomodoro/PomodoroTimer"
import { PomodoroTasks } from "@/components/modules/pomodoro/PomodoroTasks"
import { PomodoroStats } from "@/components/modules/pomodoro/PomodoroStats"
import { usePomodoroTick } from "@/hooks/usePomodoroTick"

export default function PomodoroPage() {
    // Inicia o hook que faz a contagem regressiva
    usePomodoroTick()

    return (
        <div className="flex flex-col min-h-full bg-background pb-10">
            {/* Header */}
            <Header title="Pomodoro" />

            <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna do Timer */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card-background border border-border rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/5">
                            <PomodoroTimer />
                        </div>

                        {/* Linha de Estatísticas (Desktop) */}
                        <div className="hidden lg:block">
                            <PomodoroStats />
                        </div>
                    </div>

                    {/* Coluna de Tarefas */}
                    <div className="lg:col-span-1">
                        <div className="bg-card-background border border-border rounded-3xl p-6 h-full flex flex-col shadow-2xl shadow-indigo-500/5 min-h-[600px]">
                            <PomodoroTasks />
                        </div>
                    </div>

                    {/* Linha de Estatísticas (Mobile/Tablet) */}
                    <div className="lg:hidden">
                        <PomodoroStats />
                    </div>
                </div>
            </main>
        </div>
    )
}

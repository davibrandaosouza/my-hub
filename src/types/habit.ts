// Configuração de um hábito do usuário
export interface Habit {
    id: string
    userId: string
    name: string
    emoji: string
    xp: number
    createdAt: number
}

// Registro de execução de um hábito em um dia específico
export interface HabitLog {
    id: string          // "{userId}_{date}_{habitId}"
    userId: string
    habitId: string
    date: string        // "YYYY-MM-DD"
    completed: boolean
    completedAt: number | null
}

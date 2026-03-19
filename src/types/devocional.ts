export type Devocional = {
    id: string
    userId: string
    date: string        // "YYYY-MM-DD"
    reading: string     // "Gênesis 1-3"
    reflection: string  // Texto escrito pelo usuário
    completed: boolean
    createdAt: number   // Timestamp
}

export type DevocionalStreak = {
    current: number     // Sequência atual
    thisMonth: number   // Concluídos no mês
    total: number       // Total histórico
}
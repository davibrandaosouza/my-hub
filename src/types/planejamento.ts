export type PlanejamentoStatus = "pendente" | "em_progresso" | "concluido"
export type PlanejamentoPrioridade = "alta" | "media" | "baixa"

export type Planejamento = {
    id: string
    userId: string
    titulo: string
    descricao?: string
    status: PlanejamentoStatus
    prioridade: PlanejamentoPrioridade
    categoria: string
    data?: string       // "YYYY-MM-DD"
    createdAt: number
    updatedAt: number
}
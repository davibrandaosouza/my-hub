export type FilmeStatus = "concluido" | "assistindo" | "abandonado" | "quero_assistir"

export interface Filme {
    id: string
    apiId: string
    titulo: string
    capaUrl: string
    categoria: string
    status: FilmeStatus
    nota: number | null
    userId: string
    createdAt: number
    updatedAt: number
}

export type SerieStatus = "concluido" | "assistindo" | "abandonado" | "quero_assistir"

export interface Serie {
    id: string
    apiId: string
    titulo: string
    capaUrl: string
    categoria: string
    status: SerieStatus
    nota: number | null
    userId: string
    createdAt: number
    updatedAt: number
}

export type AnimeStatus = "concluido" | "assistindo" | "abandonado" | "quero_assistir"

export interface Anime {
    id: string
    apiId: string
    titulo: string
    capaUrl: string
    categoria: string
    status: AnimeStatus
    nota: number | null
    userId: string
    createdAt: number
    updatedAt: number
}

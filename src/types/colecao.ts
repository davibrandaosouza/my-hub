export type MediaTipo = "jogos" | "animes" | "filmes" | "series"

export interface Colecao {
    id: string
    userId: string
    nome: string
    tipo: MediaTipo
    itemIds: string[]       // IDs dos documentos no Firestore
    capaUrl: string | null  // Capa do primeiro item adicionado
    createdAt: number
    updatedAt: number
}

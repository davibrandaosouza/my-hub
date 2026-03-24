export type JogoStatus = "jogando" | "zerado" | "abandonado" | "quero_jogar"

export type Jogo = {
    id: string
    userId: string
    rawgId: number
    titulo: string
    coverUrl: string
    categoria: string
    status: JogoStatus
    nota: number | null     // 0–10
    createdAt: number
    updatedAt: number
}

// Resposta da RAWG
export type RawgGame = {
    id: number
    name: string
    background_image: string | null
    genres: { id: number; name: string }[]
}

export type RawgSearchResponse = {
    count: number
    results: RawgGame[]
}

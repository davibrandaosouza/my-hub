export type JogoStatus = "jogando" | "zerado" | "abandonado" | "quero_jogar"

export type Jogo = {
    id: string
    userId: string
    rawgId: number
    titulo: string
    coverUrl: string
    categoria: string
    status: JogoStatus
    nota: number | null
    anoLancamento: number | null
    createdAt: number
    updatedAt: number
}

export type RawgGame = {
    id: number
    name: string
    background_image: string | null
    genres: { id: number; name: string }[]
    released: string | null
}

export type RawgSearchResponse = {
    count: number
    results: RawgGame[]
}

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

export type TMDBMovieResponse = {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    genre_ids?: number[];
}

export type TMDBSearchResponse = {
    results: TMDBMovieResponse[];
}

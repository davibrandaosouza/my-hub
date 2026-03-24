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

export type JikanAnimeResponse = {
    mal_id: number;
    title: string;
    title_english?: string;
    images: {
        webp?: {
            large_image_url?: string;
        };
        jpg?: {
            large_image_url?: string;
        };
    };
    genres?: Array<{
        name: string;
    }>;
}

export type JikanSearchResponse = {
    data: JikanAnimeResponse[];
}

import { JikanAnimeResponse, JikanSearchResponse } from "@/types/anime";

export type AnimeResult = {
    apiId: string;
    titulo: string;
    capaUrl: string;
    categoria: string;
}

export async function searchAnimes(query: string): Promise<AnimeResult[]> {
    if (!query) return []
    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`)
        if (!res.ok) return []
        const data: JikanSearchResponse = await res.json()
        
        return data.data.map((item: JikanAnimeResponse) => ({
            apiId: String(item.mal_id),
            titulo: item.title_english || item.title,
            capaUrl: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "",
            categoria: item.genres?.[0]?.name || "Anime"
        }))
    } catch {
        return []
    }
}

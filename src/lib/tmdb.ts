"use server"

export type TMDBResult = {
    apiId: string;
    titulo: string;
    capaUrl: string;
    categoria: string;
}

const GENRE_MAP: Record<number, string> = {
    28: "Ação", 12: "Aventura", 16: "Animação", 35: "Comédia", 80: "Crime",
    99: "Documentário", 18: "Drama", 10751: "Família", 14: "Fantasia", 36: "História",
    27: "Terror", 10402: "Música", 9648: "Mistério", 10749: "Romance", 878: "Ficção Científica",
    10770: "Cinema TV", 53: "Thriller", 10752: "Guerra", 37: "Faroeste",
    10759: "Ação/Aventura", 10762: "Kids", 10765: "Sci-Fi/Fants", 10766: "Novela",
    10767: "Talk Show", 10768: "Política"
}

 

export async function searchFilmes(query: string): Promise<TMDBResult[]> {
    if (!query) return []
    try {
        const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY
        if (!TMDB_KEY) console.error("TMDB_KEY is missing!")
        
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`, {
            headers: {
                accept: 'application/json'
            }
        })

        if (!res.ok) return []
        const data = await res.json()

        return data.results.map((item: any) => ({
            apiId: String(item.id),
            titulo: item.title,
            capaUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
            categoria: item.genre_ids?.[0] ? GENRE_MAP[item.genre_ids[0]] || "Filme" : "Filme"
        }))
    } catch {
        return []
    }
}

export async function searchSeries(query: string): Promise<TMDBResult[]> {
    if (!query) return []
    try {
        const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY
        const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`, {
            headers: {
                accept: 'application/json'
            }
        })
        if (!res.ok) return []
        const data = await res.json()

        return data.results.map((item: any) => ({
            apiId: String(item.id),
            titulo: item.name,
            capaUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
            categoria: item.genre_ids?.[0] ? GENRE_MAP[item.genre_ids[0]] || "Série" : "Série"
        }))
    } catch {
        return []
    }
}

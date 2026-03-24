"use server"

import type { RawgGame, RawgSearchResponse } from "@/types/jogo"

 
const BASE_URL = "https://api.rawg.io/api"

export async function searchGames(query: string): Promise<RawgGame[]> {
    if (!query.trim()) return []
    try {
        const API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY || process.env.RAWG_API_KEY
        if (!API_KEY) console.error("RAWG_API_KEY is missing!")
        
        const url = `${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page_size=8&search_precise=true`
        const res = await fetch(url)
        if (!res.ok) return []
        const data: RawgSearchResponse = await res.json()
        return data.results ?? []
    } catch {
        return []
    }
}

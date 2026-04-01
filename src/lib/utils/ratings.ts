import { RatingFormat } from "@/types/settings"

/**
 * Mapeamento de 21 passos (0.0 a 10.0 com intervalo de 0.5)
 * conforme especificado pelo usuário.
 */
const DECIMAL_STEPS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]

const INTEGER_MAPPING = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10]

const STAR_MAPPING = [
    0, 0, 0, 0, // 0.0 - 1.5 -> 0 estrelas
    1, 1, 1, 1, // 2.0 - 3.5 -> 1 estrela
    2, 2, 2, 2, // 4.0 - 5.5 -> 2 estrelas
    3, 3, 3, 3, // 6.0 - 7.5 -> 3 estrelas
    4, 4, 4, 4, // 8.0 - 9.5 -> 4 estrelas
    5           // 10.0      -> 5 estrelas
]

// Triste (0-4.5), Normal (5.0-7.5), Feliz (8.0-10.0)
// 10 vezes triste, 6 vezes normal, 5 vezes feliz
const EMOJI_MAPPING: ("sad" | "neutral" | "happy")[] = [
    "sad", "sad", "sad", "sad", "sad", "sad", "sad", "sad", "sad", "sad",
    "neutral", "neutral", "neutral", "neutral", "neutral", "neutral",
    "happy", "happy", "happy", "happy", "happy"
]

export function getFormattedRating(value: number | null, format: RatingFormat): string | number | null {
    if (value === null) return null

    // Encontra o índice mais próximo no sistema de 21 passos
    const stepIndex = Math.min(Math.max(Math.round(value * 2), 0), 20)

    switch (format) {
        case "integers":
            return INTEGER_MAPPING[stepIndex]
        case "stars":
            return STAR_MAPPING[stepIndex]
        case "emojis":
            return EMOJI_MAPPING[stepIndex]
        case "default":
        default:
            return value.toFixed(1).replace(".0", "")
    }
}

export { DECIMAL_STEPS, INTEGER_MAPPING, STAR_MAPPING, EMOJI_MAPPING }

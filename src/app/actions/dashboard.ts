"use server"

import { put, del } from "@vercel/blob"

export async function uploadDashboardImageAction(
    userId: string, 
    formData: FormData, 
    oldImageUrl?: string | null
) {
    const file = formData.get("file") as File
    if (!file || !userId) {
        throw new Error("Arquivo ou ID do usuário não fornecido")
    }

    // 1. Se existir uma imagem antiga, deletar do Vercel Blob para economizar espaço
    if (oldImageUrl) {
        try {
            await del(oldImageUrl)
        } catch (error) {
            console.error("Erro ao deletar imagem antiga do Blob:", error)
        }
    }

    // 2. Upload da nova imagem
    const filename = `dashboard/${userId}-${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true
    })

    return blob.url
}

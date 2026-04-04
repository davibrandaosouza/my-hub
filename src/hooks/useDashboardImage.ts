import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getDashboardImage } from "@/lib/firebase/dashboard"
import { uploadDashboardImageAction, deleteDashboardImageAction } from "@/app/actions/dashboard"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useToastContext } from "@/app/(hub)/layout"

export function useDashboardImage(userId: string | undefined) {
    const queryClient = useQueryClient()
    const toast = useToastContext()

    // Query para buscar a imagem
    const imageQuery = useQuery({
        queryKey: ["dashboard", "image", userId],
        queryFn: () => getDashboardImage(userId!),
        enabled: !!userId,
    })

    // Mutation para upload (e atualização da antiga)
    const uploadMutation = useMutation({
        mutationFn: async ({ formData, currentUrl }: { formData: FormData; currentUrl: string | null }) => {
            if (!userId) throw new Error("Usuário não autenticado")

            // Upload para Vercel Blob via Server Action
            const url = await uploadDashboardImageAction(userId, formData, currentUrl)

            // Salvar no Firestore
            const userDocRef = doc(db, "dashboard", userId)
            await setDoc(userDocRef, { imageUrl: url }, { merge: true })

            return url
        },
        onSuccess: (url) => {
            queryClient.setQueryData(["dashboard", "image", userId], url)
            toast.success("Imagem salva com sucesso!")
        },
        onError: (error) => {
            console.error("Erro ao fazer upload da imagem:", error)
            toast.error("Erro ao salvar imagem. Tente novamente.")
        }
    })

    // Mutation para deletar
    const deleteMutation = useMutation({
        mutationFn: async (currentUrl: string) => {
            if (!userId) throw new Error("Usuário não autenticado")

            // Deletar do Vercel Blob
            await deleteDashboardImageAction(currentUrl)

            // Limpar no Firestore
            const userDocRef = doc(db, "dashboard", userId)
            await setDoc(userDocRef, { imageUrl: null }, { merge: true })
        },
        onSuccess: () => {
            queryClient.setQueryData(["dashboard", "image", userId], null)
            toast.success("Imagem removida com sucesso!")
        },
        onError: (error) => {
            console.error("Erro ao remover imagem:", error)
            toast.error("Erro ao remover imagem.")
        }
    })

    return {
        imageUrl: imageQuery.data || null,
        loading: imageQuery.isLoading,
        uploading: uploadMutation.isPending,
        uploadImage: uploadMutation.mutateAsync,
        deleteImage: deleteMutation.mutateAsync,
        deleting: deleteMutation.isPending,
    }
}

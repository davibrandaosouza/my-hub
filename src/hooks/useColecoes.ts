import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToastContext } from "@/app/(hub)/layout"
import {
    getColecoes,
    addColecao,
    updateColecao,
    deleteColecao,
    addItemToColecao,
    removeItemFromColecao,
} from "@/lib/firebase/colecoes"
import type { MediaTipo, Colecao } from "@/types/colecao"

export function useColecoes(userId: string | undefined, tipo: MediaTipo) {
    const queryClient = useQueryClient()
    const toast = useToastContext()
    const queryKey = ["colecoes", tipo, userId]

    const listQuery = useQuery({
        queryKey,
        queryFn: () => getColecoes(userId!, tipo),
        enabled: !!userId,
    })

    const addMutation = useMutation({
        mutationFn: (nome: string) => addColecao(userId!, { nome, tipo }),
        onSuccess: (res) => {
            if (res.error) toast.error(res.error)
            else {
                queryClient.invalidateQueries({ queryKey })
                toast.success("Coleção criada!")
            }
        },
        onError: () => toast.error("Erro ao criar coleção.")
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Colecao, "nome" | "itemIds" | "capaUrl">> }) =>
            updateColecao(id, data),
        onSuccess: (res) => {
            if (res.error) toast.error(res.error)
            else queryClient.invalidateQueries({ queryKey })
        },
        onError: () => toast.error("Erro ao atualizar coleção.")
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteColecao(id),
        onSuccess: (res) => {
            if (res.error) toast.error(res.error)
            else {
                queryClient.invalidateQueries({ queryKey })
                toast.success("Coleção removida!")
            }
        },
        onError: () => toast.error("Erro ao remover coleção.")
    })

    const addItemMutation = useMutation({
        mutationFn: ({ colecaoId, itemId, capaUrl }: { colecaoId: string; itemId: string; capaUrl: string | null }) =>
            addItemToColecao(colecaoId, itemId, capaUrl),
        onSuccess: (res) => {
            if (res.error) toast.error(res.error)
            else queryClient.invalidateQueries({ queryKey })
        },
        onError: () => toast.error("Erro ao adicionar à coleção.")
    })

    const removeItemMutation = useMutation({
        mutationFn: ({ colecaoId, itemId }: { colecaoId: string; itemId: string }) =>
            removeItemFromColecao(colecaoId, itemId),
        onSuccess: (res) => {
            if (res.error) toast.error(res.error)
            else queryClient.invalidateQueries({ queryKey })
        },
        onError: () => toast.error("Erro ao remover da coleção.")
    })

    return {
        colecoes: listQuery.data ?? [],
        loading: listQuery.isLoading,
        createColecao: addMutation.mutateAsync,
        updateColecao: updateMutation.mutateAsync,
        deleteColecao: deleteMutation.mutateAsync,
        addItem: addItemMutation.mutateAsync,
        removeItem: removeItemMutation.mutateAsync,
        isCreating: addMutation.isPending,
    }
}

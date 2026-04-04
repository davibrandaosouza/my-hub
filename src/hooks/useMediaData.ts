import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToastContext } from "@/app/(hub)/layout"

interface MediaService<T> {
    getAll: (userId: string) => Promise<T[]>
    add: (userId: string, data: Omit<T, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<{ id: string | null; error: string | null }>
    update: (id: string, updates: Partial<T>) => Promise<{ error: string | null }>
    delete: (id: string) => Promise<{ error: string | null }>
}

export function useMediaData<T extends { id: string }>(
    userId: string | undefined,
    type: string,
    service: MediaService<T>
) {
    const queryClient = useQueryClient()
    const toast = useToastContext()
    const queryKey = ["media", type, userId]

    // Query para buscar a lista
    const listQuery = useQuery({
        queryKey,
        queryFn: () => service.getAll(userId!),
        enabled: !!userId,
    })

    // Mutation para adicionar
    const addMutation = useMutation({
        mutationFn: (data: Omit<T, "id" | "userId" | "createdAt" | "updatedAt">) => service.add(userId!, data),
        onSuccess: (res) => {
            if (res.error) {
                toast.error(res.error)
            } else {
                queryClient.invalidateQueries({ queryKey })
                toast.success("Adicionado com sucesso!")
            }
        },
        onError: () => toast.error("Erro ao adicionar.")
    })

    // Mutation para atualizar
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<T> }) =>
            service.update(id, updates),
        onSuccess: (res) => {
            if (res.error) {
                toast.error(res.error)
            } else {
                queryClient.invalidateQueries({ queryKey })
            }
        },
        onError: () => toast.error("Erro ao atualizar.")
    })

    // Mutation para deletar
    const deleteMutation = useMutation({
        mutationFn: (id: string) => service.delete(id),
        onSuccess: (res) => {
            if (res.error) {
                toast.error(res.error)
            } else {
                queryClient.invalidateQueries({ queryKey })
                toast.success("Removido da coleção")
            }
        },
        onError: () => toast.error("Erro ao remover.")
    })

    return {
        data: listQuery.data || [],
        loading: listQuery.isLoading,
        isError: listQuery.isError,
        addItem: addMutation.mutateAsync,
        updateItem: updateMutation.mutateAsync,
        deleteItem: deleteMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        refetch: listQuery.refetch
    }
}

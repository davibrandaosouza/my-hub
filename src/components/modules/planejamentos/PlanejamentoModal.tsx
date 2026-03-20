"use client"

import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { planejamentoSchema, type PlanejamentoFormData } from "@/lib/validations/planejamento"
import type { Planejamento } from "@/types/planejamento"
import { Select } from "@/components/ui/select"
import { TagInput } from "@/components/ui/tag-input"

type Props = {
    open: boolean
    onClose: () => void
    onSave: (data: PlanejamentoFormData) => Promise<void>
    editingItem?: Planejamento | null
    categoriaSugestoes: string[]
}

export function PlanejamentoModal({ open, onClose, onSave, editingItem, categoriaSugestoes }: Props) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<PlanejamentoFormData>({
        resolver: zodResolver(planejamentoSchema),
        defaultValues: {
            titulo: "",
            descricao: "",
            status: "pendente",
            prioridade: "media",
            categoria: "",
            data: "",
        },
    })

    const categoriaValue = useWatch({ control, name: "categoria" })

    // Preenche o formulário ao editar
    useEffect(() => {
        if (editingItem) {
            reset({
                titulo: editingItem.titulo,
                descricao: editingItem.descricao ?? "",
                status: editingItem.status,
                prioridade: editingItem.prioridade,
                categoria: editingItem.categoria,
                data: editingItem.data ?? "",
            })
        } else {
            reset({
                titulo: "",
                descricao: "",
                status: "pendente",
                prioridade: "media",
                categoria: "",
                data: "",
            })
        }
    }, [editingItem, reset, open])

    const onSubmit = async (data: PlanejamentoFormData) => {
        await onSave(data)
        onClose()
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editingItem ? "Editar Plano" : "Novo Plano"}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* TÍTULO */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                        Título
                    </label>
                    <Input
                        placeholder="Ex: Criar landing page"
                        {...register("titulo")}
                    />
                    {errors.titulo && (
                        <p className="text-xs text-red-400">{errors.titulo.message}</p>
                    )}
                </div>

                {/* DESCRIÇÃO */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                        Descrição <span className="normal-case text-muted/60">(opcional)</span>
                    </label>
                    <textarea
                        placeholder="Detalhes do plano..."
                        rows={3}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                        {...register("descricao")}
                    />
                </div>

                {/* PRIORIDADE + STATUS */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted uppercase tracking-wider">
                            Prioridade
                        </label>
                        <Select
                            options={[
                                { value: "alta", label: "Alta" },
                                { value: "media", label: "Média" },
                                { value: "baixa", label: "Baixa" },
                            ]}
                            {...register("prioridade")}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted uppercase tracking-wider">
                            Status
                        </label>
                        <Select
                            options={[
                                { value: "pendente", label: "Pendente" },
                                { value: "em_progresso", label: "Em Progresso" },
                                { value: "concluido", label: "Concluído" },
                            ]}
                            {...register("status")}
                        />
                    </div>
                </div>

                {/* CATEGORIA + DATA */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted uppercase tracking-wider">
                            Categoria
                        </label>
                        <TagInput
                            value={categoriaValue}
                            onChange={(v) => setValue("categoria", v)}
                            suggestions={categoriaSugestoes}
                            placeholder="Ex: Design, Dev"
                        />
                        {errors.categoria && (
                            <p className="text-xs text-red-400">{errors.categoria.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted uppercase tracking-wider">
                            Data <span className="normal-case text-muted/60">(opcional)</span>
                        </label>
                        <div className="relative">
                            <Input
                                type="date"
                                className="scheme-dark [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer pr-9"
                                {...register("data")}
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* BOTÕES */}
                <div className="flex items-center gap-3 justify-end pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <Button type="submit" disabled={isSubmitting} className="px-6">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            editingItem ? "Salvar alterações" : "Criar plano"
                        )}
                    </Button>
                </div>

            </form>
        </Modal>
    )
}
"use client"

import { useRef, useState } from "react"
import { UploadCloud, Trash2, Check, X } from "lucide-react"
import { useDashboardImage } from "@/hooks/useDashboardImage"
import { ImageCropModal } from "@/components/dashboard/ImageCropModal"
import { Skeleton } from "@/components/ui/skeleton"

interface MemoryUploadProps {
  userId: string | undefined
}

export function MemoryUpload({ userId }: MemoryUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false)

    const { 
        imageUrl, 
        loading, 
        uploading, 
        uploadImage, 
        deleteImage, 
        deleting 
    } = useDashboardImage(userId)

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !userId) return

        const reader = new FileReader()
        reader.addEventListener("load", () => {
            setSelectedFile(reader.result as string)
            setIsCropModalOpen(true)
        })
        reader.readAsDataURL(file)
        e.target.value = ""
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        setIsCropModalOpen(false)
        const formData = new FormData()
        const file = new File([croppedBlob], "lembranca.jpg", { type: "image/jpeg" })
        formData.append("file", file)

        await uploadImage({ formData, currentUrl: imageUrl })
        setSelectedFile(null)
    }

    const isActionLoading = uploading || deleting

    if (loading) {
        return <Skeleton className="h-[220px] w-full rounded-xl" />
    }

    return (
        <div className="lg:col-span-1 flex flex-col">
            <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-3 md:mt-0 mt-4">
                Lembrança
            </p>
            <div
                className={`flex-1 w-full rounded-xl border-2 border-dashed border-border bg-card-background/40 flex flex-col items-center justify-center p-6 transition-all group relative overflow-hidden min-h-[220px] ${!isActionLoading && !isDeleteConfirm ? "hover:border-primary/50 hover:bg-primary/5 cursor-pointer" : ""}`}
                onClick={() => !isActionLoading && !isDeleteConfirm && fileInputRef.current?.click()}
            >
                {isActionLoading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3"></div>
                        <p className="text-sm font-medium text-foreground">Salvando...</p>
                    </div>
                ) : imageUrl ? (
                    <div className="absolute inset-0 w-full h-full group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Lembrança do Dashboard" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                            <div className="flex items-center gap-3">
                                {!isDeleteConfirm ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsDeleteConfirm(true); }}
                                        className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 backdrop-blur-sm shadow-xl flex items-center justify-center transition-colors group/delete"
                                        title="Remover Foto"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-400 group-hover/delete:text-red-300" />
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteImage(imageUrl); setIsDeleteConfirm(false); }}
                                            className="w-10 h-10 rounded-full bg-emerald-500/40 hover:bg-emerald-500/60 backdrop-blur-sm shadow-xl flex items-center justify-center transition-colors group/confirm"
                                            title="Confirmar Remoção"
                                        >
                                            <Check className="w-5 h-5 text-emerald-100 group-hover/confirm:scale-110 transition-transform" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsDeleteConfirm(false); }}
                                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm shadow-xl flex items-center justify-center transition-colors group/cancel"
                                            title="Cancelar"
                                        >
                                            <X className="w-5 h-5 text-foreground group-hover/cancel:scale-110 transition-transform" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <span className="text-xs font-medium text-foreground shadow-sm">
                                {isDeleteConfirm ? "Confirmar remoção?" : "Deseja remover a imagem?"}
                            </span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                            <UploadCloud className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-2 text-center text-balance">
                            Adicionar Imagem
                        </h3>
                        <p className="text-[11px] text-muted text-center max-w-[150px]">
                            Clique ou arraste uma foto para destacar aqui
                        </p>
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={handleFileSelection}
                    disabled={isActionLoading}
                />
            </div>

            {isCropModalOpen && selectedFile && (
                <ImageCropModal
                    image={selectedFile}
                    onClose={() => {
                        setIsCropModalOpen(false)
                        setSelectedFile(null)
                    }}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    )
}

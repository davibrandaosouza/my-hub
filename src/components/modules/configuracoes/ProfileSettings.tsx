"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useSettings } from "@/hooks/useSettings"
import { User, UploadCloud } from "lucide-react"
import { ImageCropModal } from "@/components/dashboard/ImageCropModal"
import { useToastContext } from "@/app/(hub)/layout"
import { uploadDashboardImageAction } from "@/app/actions/dashboard"
import { MyHubLogo } from "@/components/shared/MyHubLogo"

export function ProfileSettings() {
    const { user } = useAuth()
    const { settings, updateProfile } = useSettings()
    const toast = useToastContext()

    const [isEditingName, setIsEditingName] = useState(false)
    const [nameInput, setNameInput] = useState(settings.profile.displayName)

    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSaveName = async () => {
        if (!user?.uid) return
        if (nameInput.trim() === "") {
            toast.error("O nome não pode ser vazio")
            return
        }
        await updateProfile(user.uid, { displayName: nameInput })
        setIsEditingName(false)
        toast.success("Nome atualizado")
    }

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user?.uid) return

        const reader = new FileReader()
        reader.addEventListener("load", () => {
            setSelectedFile(reader.result as string)
            setIsCropModalOpen(true)
        })
        reader.readAsDataURL(file)
        e.target.value = ""
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        if (!user?.uid) return
        setIsCropModalOpen(false)

        try {
            setUploading(true)
            const formData = new FormData()
            const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })
            formData.append("file", file)

            const url = await uploadDashboardImageAction(user.uid, formData, settings.profile.avatarUrl)

            await updateProfile(user.uid, { avatarUrl: url })
            toast.success("Foto de perfil atualizada")
        } catch (error) {
            console.error(error)
            toast.error("Erro ao fazer upload da imagem")
        } finally {
            setUploading(false)
            setSelectedFile(null)
        }
    }

    return (
        <div className="rounded-xl border border-border bg-card-background p-6">
            <div className="flex items-center gap-2 mb-6 text-foreground font-medium">
                <User className="w-5 h-5 text-primary" />
                <h2>Perfil</h2>
            </div>

            <div className="flex items-center gap-6 mb-6">
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden group border-2 border-dashed shrink-0 ${uploading ? 'border-primary opacity-50 cursor-not-allowed' : 'border-border cursor-pointer hover:border-primary/50'}`}
                >
                    {settings.profile.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={settings.profile.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <MyHubLogo className="w-full h-full text-3xl shadow-none" />
                    )}

                    {!uploading && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <UploadCloud className="w-6 h-6 text-foreground" />
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-card-background/50 backdrop-blur-sm">
                            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{settings.profile.displayName || "MyHub"}</h3>
                    <p className="text-sm text-muted">{user?.email}</p>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileSelection}
                disabled={uploading}
            />

            <div className="space-y-4">
                <div>
                    <label className="text-sm text-muted mb-1 block">Nome</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            disabled={!isEditingName}
                            className={`flex-1 bg-background border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors ${!isEditingName ? 'border-border opacity-70' : 'border-primary/30'}`}
                        />
                        {isEditingName ? (
                            <button
                                onClick={handleSaveName}
                                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Salvar
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditingName(true)}
                                className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground text-sm font-medium rounded-lg transition-colors border border-border"
                            >
                                Editar
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label className="text-sm text-muted mb-1 block">Email</label>
                    <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full bg-background border border-border opacity-70 cursor-not-allowed rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
                    />
                </div>
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

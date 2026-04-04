"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import { NotebookList } from "@/components/modules/anotacoes/NotebookList"
import { NoteEditor } from "@/components/modules/anotacoes/NoteEditor"
import { NotebookModal } from "@/components/modules/anotacoes/NotebookModal"
import { EmptyState } from "@/components/modules/anotacoes/EmptyState"
import {
    getNotebooks,
    saveNotebook,
    deleteNotebook,
    getNotes,
    saveNote,
    deleteNote,
} from "@/lib/firebase/anotacoes"
import type { Notebook, Note } from "@/types/anotacao"

export default function AnotacoesPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const userId = user?.uid

    const [notebooks, setNotebooks] = useState<Notebook[]>([])
    const [notes, setNotes] = useState<Note[]>([])
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [pageLoading, setPageLoading] = useState(true)
    const [showNotebookModal, setShowNotebookModal] = useState(false)

    // ── Load data ──────────────────────────────────
    const loadData = useCallback(async () => {
        if (!userId) return
        const [nbs, nts] = await Promise.all([
            getNotebooks(userId),
            getNotes(userId),
        ])
        setNotebooks(nbs)
        setNotes(nts)
    }, [userId])

    useEffect(() => {
        if (!userId) return
        async function init() {
            await loadData()
            setPageLoading(false)
        }
        void init()
    }, [userId, loadData])

    // ── Notebooks CRUD ──────────────────────────────
    async function handleCreateNotebook(nome: string, emoji: string, cor: string) {
        if (!userId) return
        const nb: Notebook = {
            id: crypto.randomUUID(),
            userId,
            nome,
            emoji,
            cor,
            createdAt: Date.now(),
        }
        setNotebooks(prev => [...prev, nb])
        setShowNotebookModal(false)
        const { error } = await saveNotebook(userId, nb)
        if (error) {
            toast.error(error)
            setNotebooks(prev => prev.filter(n => n.id !== nb.id))
        }
    }

    async function handleDeleteNotebook(notebookId: string) {
        if (!userId) return
        // Remove notebook e suas notas
        setNotebooks(prev => prev.filter(n => n.id !== notebookId))
        setNotes(prev => prev.filter(n => n.notebookId !== notebookId))
        if (selectedNote?.notebookId === notebookId) setSelectedNote(null)

        const { error } = await deleteNotebook(userId, notebookId)
        if (error) {
            toast.error(error)
            await loadData()
        }
    }

    // ── Notas CRUD ─────────────────────────────────
    async function handleNewNote(notebookId: string) {
        if (!userId) return
        const now = Date.now()
        const note: Note = {
            id: crypto.randomUUID(),
            userId,
            notebookId,
            titulo: "",
            content: "",
            tags: [],
            fontFamily: "Inter, sans-serif",
            fontSize: 15,
            createdAt: now,
            updatedAt: now,
        }
        setNotes(prev => [note, ...prev])
        setSelectedNote(note)

        const { error } = await saveNote(userId, note)
        if (error) {
            toast.error(error)
            setNotes(prev => prev.filter(n => n.id !== note.id))
            setSelectedNote(null)
        }
    }

    async function handleDeleteNote(noteId: string) {
        if (!userId) return
        setNotes(prev => prev.filter(n => n.id !== noteId))
        if (selectedNote?.id === noteId) setSelectedNote(null)

        const { error } = await deleteNote(userId, noteId)
        if (error) {
            toast.error(error)
            await loadData()
        }
    }

    const handleSaveNote = useCallback(
        async (updates: Partial<Note>) => {
            if (!userId || !selectedNote) return
            const updated: Note = { ...selectedNote, ...updates, updatedAt: Date.now() }

            setSelectedNote(updated)
            setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))

            const { error } = await saveNote(userId, updated)
            if (error) toast.error(error)
        },
        [userId, selectedNote, toast]
    )

    // Primeiro caderno → abrir primeira nota
    function handleFirstNote() {
        if (notebooks.length > 0) {
            void handleNewNote(notebooks[0].id)
        } else {
            setShowNotebookModal(true)
        }
    }

    return (
        <div className="flex flex-col h-screen">
            <Header title="Anotações" />

            {pageLoading ? (
                <div className="flex flex-1 gap-0 overflow-hidden">
                    <Skeleton className="w-64 h-full rounded-none" />
                    <Skeleton className="flex-1 h-full rounded-none" />
                </div>
            ) : (
                <div className="flex flex-1 overflow-hidden">
                    {/* ── Sidebar ── */}
                    <aside className="w-64 shrink-0 border-r border-border flex flex-col overflow-hidden bg-card-background">
                        <NotebookList
                            notebooks={notebooks}
                            notes={notes}
                            selectedNoteId={selectedNote?.id ?? null}
                            onSelectNote={setSelectedNote}
                            onNewNote={handleNewNote}
                            onNewNotebook={() => setShowNotebookModal(true)}
                            onDeleteNote={handleDeleteNote}
                            onDeleteNotebook={handleDeleteNotebook}
                        />
                    </aside>

                    {/* ── Editor panel ── */}
                    <main className="flex-1 overflow-hidden">
                        {selectedNote ? (
                            <NoteEditor
                                key={selectedNote.id}
                                note={selectedNote}
                                onSave={handleSaveNote}
                            />
                        ) : (
                            <EmptyState
                                hasNotebooks={notebooks.length > 0}
                                onNewNotebook={() => setShowNotebookModal(true)}
                                onNewNote={handleFirstNote}
                            />
                        )}
                    </main>
                </div>
            )}

            {showNotebookModal && (
                <NotebookModal
                    onClose={() => setShowNotebookModal(false)}
                    onSave={handleCreateNotebook}
                />
            )}
        </div>
    )
}

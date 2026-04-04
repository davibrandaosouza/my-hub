"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import {
    Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, CheckSquare,
    Code, Minus, Save, Eye, Pencil,
    ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Note } from "@/types/anotacao"

const FONT_FAMILIES = [
    { label: "Inter", value: "Inter, sans-serif" },
    { label: "Roboto", value: "Roboto, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Mono", value: "'Fira Code', 'Courier New', monospace" },
    { label: "Outfit", value: "Outfit, sans-serif" },
]

const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32]

const TEXT_COLORS = [
    "#ffffff", "#e2e8f0", "#94a3b8",
    "#a78bfa", "#818cf8", "#60a5fa",
    "#34d399", "#4ade80", "#86efac",
    "#fbbf24", "#fb923c", "#f87171",
    "#f9a8d4", "#e879f9", "#38bdf8",
]

type SaveStatus = "idle" | "saving" | "saved"

type Props = {
    note: Note
    onSave: (updates: Partial<Note>) => void
}

export function NoteEditor({ note, onSave }: Props) {
    const editorRef = useRef<HTMLDivElement>(null)
    const [titulo, setTitulo] = useState(note.titulo)
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
    const [fontFamily, setFontFamily] = useState(note.fontFamily || FONT_FAMILIES[0].value)
    const [fontSize, setFontSize] = useState(note.fontSize || 15)
    const [isReadOnly, setIsReadOnly] = useState(false)
    const [activeStyles, setActiveStyles] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        heading1: false,
        heading2: false,
        heading3: false,
    })
    const [showFontPicker, setShowFontPicker] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showSizePicker, setShowSizePicker] = useState(false)
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Sincroniza o conteúdo do editor com a nota selecionada
    useEffect(() => {
        if (editorRef.current && !isReadOnly) {
            editorRef.current.innerHTML = note.content || ""
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [note.id])

    const prevNoteIdRef = useRef(note.id)
    if (prevNoteIdRef.current !== note.id) {
        prevNoteIdRef.current = note.id
        setTitulo(note.titulo)
        setFontFamily(note.fontFamily || FONT_FAMILIES[0].value)
        setFontSize(note.fontSize || 15)
        setSaveStatus("idle")
    }

    // Atualiza os estilos ativos
    const updateActiveStyles = useCallback(() => {
        setActiveStyles({
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
            strikeThrough: document.queryCommandState("strikeThrough"),
            heading1: document.queryCommandValue("formatBlock") === "h1",
            heading2: document.queryCommandValue("formatBlock") === "h2",
            heading3: document.queryCommandValue("formatBlock") === "h3",
        })
    }, [])

    useEffect(() => {
        document.addEventListener("selectionchange", updateActiveStyles)
        return () => document.removeEventListener("selectionchange", updateActiveStyles)
    }, [updateActiveStyles])

    // Auto-save debounce
    const triggerSave = useCallback(
        (getUpdates: () => Partial<Note>) => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
            setSaveStatus("saving")
            saveTimeoutRef.current = setTimeout(() => {
                onSave(getUpdates())
                setSaveStatus("saved")
                setTimeout(() => setSaveStatus("idle"), 2000)
            }, 1000)
        },
        [onSave]
    )

    const handleEditorInput = useCallback(() => {
        if (!editorRef.current) return
        const html = editorRef.current.innerHTML
        triggerSave(() => ({ content: html, updatedAt: Date.now() }))
    }, [triggerSave])

    // Lida com cliques em checkboxes
    useEffect(() => {
        const editor = editorRef.current
        if (!editor) return

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "checkbox") {
                const isChecked = (target as HTMLInputElement).checked
                if (isChecked) {
                    target.setAttribute("checked", "checked")
                } else {
                    target.removeAttribute("checked")
                }
                handleEditorInput()
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Backspace") {
                const selection = window.getSelection()
                if (!selection || !selection.rangeCount) return

                const node = selection.anchorNode
                const taskSpan = node?.parentElement?.closest(".nota-task-item span")

                if (taskSpan && taskSpan.textContent === "") {
                    const taskItem = taskSpan.parentElement
                    if (taskItem) {
                        e.preventDefault()
                        taskItem.remove()
                        handleEditorInput()
                    }
                }
            }
        }

        editor.addEventListener("click", handleClick)
        editor.addEventListener("keydown", handleKeyDown)
        return () => {
            editor.removeEventListener("click", handleClick)
            editor.removeEventListener("keydown", handleKeyDown)
        }
    }, [handleEditorInput])

    const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setTitulo(val)
        triggerSave(() => ({ titulo: val, updatedAt: Date.now() }))
    }

    const exec = (cmd: string, value?: string) => {
        document.execCommand(cmd, false, value)
        editorRef.current?.focus()
        handleEditorInput()
    }

    const insertCodeBlock = () => {
        const pre = `<pre class="nota-code"><code>// código aqui</code></pre><p><br></p>`
        document.execCommand("insertHTML", false, pre)
        editorRef.current?.focus()
        handleEditorInput()
    }

    const insertDivider = () => {
        document.execCommand("insertHTML", false, "<hr/><p><br></p>")
        editorRef.current?.focus()
        handleEditorInput()
    }

    const insertTaskpoint = () => {
        const selection = window.getSelection()
        const selectedText = selection ? selection.toString() : ""

        const html = `
            <div class="nota-task-item" contenteditable="false">
                <input type="checkbox" />
                <span contenteditable="true" style="outline: none;">${selectedText}</span>
            </div>
            <p><br></p>
        `
        document.execCommand("insertHTML", false, html)
        editorRef.current?.focus()
        handleEditorInput()
    }

    const applyFontFamily = (ff: string) => {
        setFontFamily(ff)
        setShowFontPicker(false)
        if (editorRef.current) {
            editorRef.current.style.fontFamily = ff
        }
        triggerSave(() => ({ fontFamily: ff, updatedAt: Date.now() }))
    }

    const applyFontSize = (size: number) => {
        setFontSize(size)
        setShowSizePicker(false)
        if (editorRef.current) {
            editorRef.current.style.fontSize = `${size}px`
        }
        triggerSave(() => ({ fontSize: size, updatedAt: Date.now() }))
    }

    const applyColor = (color: string) => {
        exec("foreColor", color)
        setShowColorPicker(false)
    }

    const statusLabel: Record<SaveStatus, string> = {
        idle: "",
        saving: "Salvando...",
        saved: "✓ Salvo",
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* ── Título da nota ── */}
            <div className="px-6 pt-5 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={titulo}
                        onChange={handleTituloChange}
                        placeholder="Sem título"
                        className="flex-1 bg-transparent text-xl font-bold text-white placeholder-muted/50 outline-none disabled:opacity-80"
                        disabled={isReadOnly}
                    />
                    <div className="flex items-center gap-2 shrink-0">
                        {saveStatus !== "idle" && (
                            <span
                                className={cn(
                                    "flex items-center gap-1 text-xs transition-opacity",
                                    saveStatus === "saved" ? "text-green-400" : "text-muted"
                                )}
                            >
                                {saveStatus === "saving" && <Save className="w-3 h-3 animate-pulse" />}
                                {statusLabel[saveStatus]}
                            </span>
                        )}
                        <button
                            onClick={() => setIsReadOnly(!isReadOnly)}
                            className={cn(
                                "p-2 rounded-xl transition-all",
                                isReadOnly ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:text-foreground hover:bg-foreground/5"
                            )}
                            title={isReadOnly ? "Voltar a Editar" : "Visualizar (Read Mode)"}
                        >
                            {isReadOnly ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ── */}
            {!isReadOnly && (
                <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-card-background/50 nota-toolbar">

                    {/* Font family */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowFontPicker(!showFontPicker); setShowSizePicker(false); setShowColorPicker(false) }}
                            className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-muted hover:text-foreground hover:bg-foreground/10 transition-colors min-w-[70px]"
                            title="Fonte"
                        >
                            <span className="truncate max-w-[60px]">{FONT_FAMILIES.find(f => f.value === fontFamily)?.label ?? "Fonte"}</span>
                            <ChevronDown className="w-3 h-3 shrink-0" />
                        </button>
                        {showFontPicker && (
                            <div className="absolute top-full left-0 nota-toolbar-dropdown mt-1 w-40 bg-card-background border border-border rounded-xl shadow-xl overflow-hidden">
                                {FONT_FAMILIES.map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => applyFontFamily(f.value)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-xs transition-colors hover:bg-foreground/10",
                                            fontFamily === f.value ? "text-primary font-semibold" : "text-muted hover:text-foreground"
                                        )}
                                        style={{ fontFamily: f.value }}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Font size */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowSizePicker(!showSizePicker); setShowFontPicker(false); setShowColorPicker(false) }}
                            className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
                            title="Tamanho"
                        >
                            <span>{fontSize}px</span>
                            <ChevronDown className="w-3 h-3 shrink-0" />
                        </button>
                        {showSizePicker && (
                            <div className="absolute top-full left-0 nota-toolbar-dropdown mt-1 w-24 bg-card-background border border-border rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                                {FONT_SIZES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => applyFontSize(s)}
                                        className={cn(
                                            "w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-foreground/10",
                                            fontSize === s ? "text-primary font-semibold" : "text-muted hover:text-foreground"
                                        )}
                                    >
                                        {s}px
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Text color */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowColorPicker(!showColorPicker); setShowFontPicker(false); setShowSizePicker(false) }}
                            className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
                            title="Cor do texto"
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold leading-none mb-0.5">A</span>
                                <div className="w-3 h-0.5 rounded-full" style={{ background: "#a78bfa" }} />
                            </div>
                            <ChevronDown className="w-3 h-3 shrink-0" />
                        </button>
                        {showColorPicker && (
                            <div className="absolute top-full right-0 nota-toolbar-dropdown mt-1 p-2 bg-card-background border border-border rounded-xl shadow-xl">
                                <div className="grid grid-cols-5 gap-1.5">
                                    {TEXT_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => applyColor(c)}
                                            className="w-5 h-5 rounded-full hover:scale-125 transition-transform ring-1 ring-white/10"
                                            style={{ background: c }}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <ToolbarDivider />

                    {/* Bold / Italic / Underline / Strike */}
                    <ToolbarBtn onClick={() => exec("bold")} active={activeStyles.bold} title="Negrito (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("italic")} active={activeStyles.italic} title="Itálico (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("underline")} active={activeStyles.underline} title="Sublinhado (Ctrl+U)"><Underline className="w-3.5 h-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("strikeThrough")} active={activeStyles.strikeThrough} title="Tachado"><Strikethrough className="w-3.5 h-3.5" /></ToolbarBtn>

                    <ToolbarDivider />

                    {/* Headings */}
                    <ToolbarBtn onClick={() => exec("formatBlock", "<h1>")} active={activeStyles.heading1} title="Título 1" className="text-xs font-bold w-7">H1</ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("formatBlock", "<h2>")} active={activeStyles.heading2} title="Título 2" className="text-xs font-bold w-7">H2</ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("formatBlock", "<h3>")} active={activeStyles.heading3} title="Título 3" className="text-xs font-bold w-7">H3</ToolbarBtn>

                    <ToolbarDivider />

                    {/* Align */}
                    <ToolbarBtn onClick={() => exec("justifyLeft")} title="Alinhar esquerda"><AlignLeft className="w-3.5 h-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("justifyCenter")} title="Centralizar"><AlignCenter className="w-3.5 h-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("justifyRight")} title="Alinhar direita"><AlignRight className="w-3.5 h-3.5" /></ToolbarBtn>

                    <ToolbarDivider />

                    {/* Lists */}
                    <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Lista com marcadores"><List className="w-3.5 h-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Lista numerada"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={insertTaskpoint} title="Tarefa (Checkout)"><CheckSquare className="w-3.5 h-3.5" /></ToolbarBtn>

                    <ToolbarDivider />

                    {/* Code block */}
                    <ToolbarBtn onClick={insertCodeBlock} title="Bloco de código"><Code className="w-3.5 h-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={insertDivider} title="Separador"><Minus className="w-3.5 h-3.5" /></ToolbarBtn>

                    <ToolbarDivider />
                </div>
            )}

            {/* ── Editor ── */}
            <div className="flex-1 overflow-y-auto">
                <div
                    ref={editorRef}
                    contentEditable={!isReadOnly}
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    className={cn(
                        "nota-editor h-full min-h-full p-6 outline-none text-foreground leading-relaxed",
                        isReadOnly ? "cursor-default" : "cursor-text"
                    )}
                    style={{ fontFamily, fontSize: `${fontSize}px` }}
                    data-placeholder="Comece a escrever sua nota..."
                    onClick={() => { setShowFontPicker(false); setShowColorPicker(false); setShowSizePicker(false) }}
                />
            </div>

            {/* Overlay para fechar os dropdowns */}
            {(showFontPicker || showColorPicker || showSizePicker) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => { setShowFontPicker(false); setShowColorPicker(false); setShowSizePicker(false) }}
                />
            )}
        </div>
    )
}

function ToolbarBtn({
    onClick,
    title,
    children,
    className,
    active = false,
}: {
    onClick: () => void
    title: string
    children: React.ReactNode
    className?: string
    active?: boolean
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                "flex items-center justify-center w-7 h-7 rounded transition-all",
                active
                    ? "text-primary bg-primary/20 font-bold"
                    : "text-muted hover:text-foreground hover:bg-foreground/10",
                className
            )}
        >
            {children}
        </button>
    )
}

function ToolbarDivider() {
    return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />
}

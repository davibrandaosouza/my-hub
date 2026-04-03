export type Notebook = {
    id: string
    userId: string
    nome: string
    emoji: string
    cor: string
    createdAt: number
}

export type Note = {
    id: string
    userId: string
    notebookId: string
    titulo: string
    content: string
    tags: string[]
    fontFamily: string
    fontSize: number
    createdAt: number
    updatedAt: number
}

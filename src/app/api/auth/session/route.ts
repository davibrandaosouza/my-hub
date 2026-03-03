import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json(
                { error: "Token não fornecido" },
                { status: 400 }
            )
        }

        const response = NextResponse.json({ success: true })

        response.cookies.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60,
            path: "/",
        })

        return response
    } catch {
        return NextResponse.json(
            { error: "Erro ao criar sessão" },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true })

    response.cookies.delete("session")

    return response
}
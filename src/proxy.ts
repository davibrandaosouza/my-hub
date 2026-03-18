import { NextRequest, NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/login", "/register", "/reset-password", "/auth/action"]
const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard"
const DEFAULT_UNAUTHENTICATED_ROUTE = "/login"

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const sessionCookie = request.cookies.get("session")?.value
    const isAuthenticated = Boolean(sessionCookie)
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

    if (!isAuthenticated && !isPublicRoute) {
        const loginUrl = new URL(DEFAULT_UNAUTHENTICATED_ROUTE, request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (isAuthenticated && isPublicRoute) {
        return NextResponse.redirect(new URL(DEFAULT_AUTHENTICATED_ROUTE, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
    ],
}
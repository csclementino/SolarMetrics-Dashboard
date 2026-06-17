import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value

  // Verificar se o usuário está acessando uma rota protegida
  const isLoginPage = pathname === "/login"
  const isApiRoute = pathname.startsWith("/api")
  const isStaticRoute = pathname.startsWith("/_next") || pathname === "/favicon.ico"

  if (isStaticRoute || isApiRoute) {
    return NextResponse.next()
  }

  // Se não tem token e não está no login, redireciona para login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (token) {
    // Decodificar o JWT para verificar se está expirado
    const decoded = parseJwt(token)
    
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      // Token expirado ou inválido
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("access_token")
      return response
    }

    // Se tem token e está no login, redireciona para a raiz (dashboard)
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

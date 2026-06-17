"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const API_URL = "https://solarmetrics-api.grouparc.com.br"

export type AuthState = {
  error?: string
}

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

export async function loginAction(prevState: AuthState | undefined, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const basicAuth = btoa(`${email}:${password}`)

    const response = await fetch(`${API_URL}/auth`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorMessage = await response.text()
      
      if (errorMessage.includes("Bad credentials")) {
        return { error: "E-mail ou senha incorretos." }
      }
      
      return { error: errorMessage || "Erro ao realizar o login" }
    }

    const data = await response.json()

    if (data.access_token) {
      const decoded = parseJwt(data.access_token)
      const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : undefined

      const cookieStore = await cookies()
      cookieStore.set({
        name: "access_token",
        value: data.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      })
    } else {
      return { error: "Token não recebido da API" }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { error: "O servidor demorou muito para responder. Tente novamente." }
    }
    return { error: "Erro de conexão com o servidor de autenticação" }
  } finally {
    clearTimeout(timeoutId)
  }

  // Redireciona após salvar o cookie
  redirect("/")
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("access_token")
  redirect("/login")
}

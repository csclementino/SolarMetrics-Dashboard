"use server"

import { cookies } from "next/headers"

const API_URL = process.env.API_URL || "https://solarmetrics-api.grouparc.com.br"

export async function getMetrics() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) {
    return { __error: "Não autorizado" }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${API_URL}/dash/metrics`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.mensagem || `Erro na requisição: ${response.status}`)
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { __error: "O servidor demorou muito para responder. Tente novamente." }
    }
    return { __error: error instanceof Error ? error.message : String(error) }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function getDashKpis() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) {
    return { __error: "Não autorizado" }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${API_URL}/dash`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.mensagem || `Erro na requisição: ${response.status}`)
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { __error: "O servidor demorou muito para responder. Tente novamente." }
    }
    return { __error: error instanceof Error ? error.message : String(error) }
  } finally {
    clearTimeout(timeoutId)
  }
}

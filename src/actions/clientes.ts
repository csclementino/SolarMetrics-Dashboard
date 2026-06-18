"use server"

import { cookies } from "next/headers"

const API_URL = process.env.API_URL || "https://solarmetrics-api.grouparc.com.br"

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) {
    throw new Error("Não autorizado")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
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
      throw new Error("O servidor demorou muito para responder. Tente novamente.")
    }
    return { __error: error instanceof Error ? error.message : String(error) }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function getClientes() {
  try {
    return await fetchApi("/cliente")
  } catch (error) {
    console.error("Erro em getClientes:", error)
    return { __error: error instanceof Error ? error.message : String(error) }
  }
}

export async function getClienteById(id: string) {
  try {
    return await fetchApi(`/cliente/${id}`)
  } catch (error) {
    console.error(`Erro em getClienteById (${id}):`, error)
    return { __error: error instanceof Error ? error.message : String(error) }
  }
}

export async function updateCliente(data: any) {
  try {
    return await fetchApi("/cliente", {
      method: "PUT",
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.error("Erro em updateCliente:", error)
    return { __error: error instanceof Error ? error.message : String(error) }
  }
}

export async function deleteCliente(email: string) {
  try {
    return await fetchApi(`/cliente?email=${encodeURIComponent(email)}`, {
      method: "DELETE"
    })
  } catch (error) {
    console.error(`Erro em deleteCliente (${email}):`, error)
    return { __error: error instanceof Error ? error.message : String(error) }
  }
}

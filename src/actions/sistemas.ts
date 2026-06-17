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
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function getSistemas() {
  try {
    return await fetchApi("/sistema")
  } catch (error) {
    console.error("Erro em getSistemas:", error)
    throw error
  }
}

export async function getSistemaById(id: string) {
  try {
    return await fetchApi(`/sistema/${id}`)
  } catch (error) {
    console.error(`Erro em getSistemaById (${id}):`, error)
    throw error
  }
}

export async function updateSistema(data: any) {
  try {
    return await fetchApi("/sistema", {
      method: "PUT",
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.error("Erro em updateSistema:", error)
    throw error
  }
}

export async function updateSistemaStatus(id: string, status: string) {
  try {
    return await fetchApi(`/sistema/${id}/status/${status}`, {
      method: "PUT"
    })
  } catch (error) {
    console.error(`Erro em updateSistemaStatus (${id}):`, error)
    throw error
  }
}

export async function deleteSistema(id: string) {
  try {
    return await fetchApi(`/sistema/${id}`, {
      method: "DELETE"
    })
  } catch (error) {
    console.error(`Erro em deleteSistema (${id}):`, error)
    throw error
  }
}

export async function createSistema(data: any) {
  try {
    return await fetchApi("/sistema", {
      method: "POST",
      body: JSON.stringify(data)
    })
    
    
  } catch (error) {
    console.error("Erro em createSistema:", error)
    throw error
  }
  
}

export async function getClienteByEmail(email: string) {
  try {
    return await fetchApi(`/cliente/email?email=${encodeURIComponent(email)}`)
  } catch (error) {
    console.error(`Erro em getClienteByEmail (${email}):`, error)
    throw error
  }
}

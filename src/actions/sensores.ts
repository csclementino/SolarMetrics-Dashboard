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

    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("O servidor demorou muito para responder. Tente novamente.")
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function getSensores() {
  try {
    return await fetchApi("/sensor")
  } catch (error) {
    console.error("Erro em getSensores:", error)
    throw error
  }
}

export async function getSensorInfo(macAddress: string) {
  try {
    return await fetchApi(`/sensor/info?macAddress=${encodeURIComponent(macAddress)}`)
  } catch (error) {
    console.error(`Erro em getSensorInfo (${macAddress}):`, error)
    throw error
  }
}

export async function updateSensorStatus(macAddress: string, status: string) {
  try {
    return await fetchApi("/sensor/status", {
      method: "PUT",
      body: JSON.stringify({ macAddress, status })
    })
  } catch (error) {
    console.error(`Erro em updateSensorStatus (${macAddress}):`, error)
    throw error
  }
}

export async function deleteSensor(macAddress: string) {
  try {
    return await fetchApi(`/sensor?macAddress=${encodeURIComponent(macAddress)}`, {
      method: "DELETE"
    })
  } catch (error) {
    console.error(`Erro em deleteSensor (${macAddress}):`, error)
    throw error
  }
}

export async function desvincularSensor(sistemaId: string) {
  try {
    // Usando endpoint genérico de desvinculação, sujeito a ajuste da API
    return await fetchApi(`/sensor-sync/${sistemaId}`, {
      method: "DELETE"
    })
  } catch (error) {
    console.error(`Erro em desvincularSensor (${sistemaId}):`, error)
    throw error
  }
}

export async function createSensor(data: { macAddress: string; modelo: string }) {
  try {
    return await fetchApi("/sensor", {
      method: "POST",
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.error("Erro em createSensor:", error)
    throw error
  }
}

export async function createSensorSync(data: { macAddress: string; sistemaId: string }) {
  try {
    return await fetchApi("/sensor-sync", {
      method: "POST",
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.error("Erro em createSensorSync:", error)
    throw error
  }
}

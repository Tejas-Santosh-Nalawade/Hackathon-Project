import type { Bot, ChatMessage, ChatResponse } from "./types"

// Use import.meta.env for Vite or fallback to "http://localhost:8000"
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function fetchBots(): Promise<Bot[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/bots`)
  if (!response.ok) {
    throw new Error("Failed to fetch bots")
  }
  return response.json()
}

export async function sendChatMessage(
  botId: string,
  message: string,
  history: ChatMessage[]
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bot_id: botId,
      message,
      history,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to send message")
  }

  return response.json()
}

// localStorage helpers for chat history
export function saveChatHistory(botId: string, history: ChatMessage[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(`chat_history_${botId}`, JSON.stringify(history))
  }
}

export function loadChatHistory(botId: string): ChatMessage[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`chat_history_${botId}`)
    return stored ? JSON.parse(stored) : []
  }
  return []
}

export function clearChatHistory(botId: string): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(`chat_history_${botId}`)
  }
}

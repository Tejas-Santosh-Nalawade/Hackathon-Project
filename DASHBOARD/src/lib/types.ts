export interface Bot {
  bot_id: string
  title: string
  description: string
  icon_emoji: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface SearchResult {
  title: string
  url: string
  snippet: string
}

export interface ChatResponse {
  reply: string
  bot_id: string
  search_results: SearchResult[] | null
}

export interface ChatRequest {
  bot_id: string
  message: string
  history: ChatMessage[]
}

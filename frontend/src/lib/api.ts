import type { Bot, ChatMessage, ChatResponse } from "./types"

// Use import.meta.env for Vite or fallback to "http://localhost:8000"
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

// ============================================================================
// Authentication Types & Utilities
// ============================================================================

export interface UserProfile {
  user_id: string
  email: string
  name: string
  auth_provider: string
  created_at: string
  preferences?: Record<string, any>
  agent_interactions?: Record<string, number>
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: UserProfile
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface SocialAuthRequest {
  id_token: string
}

// Token management
const TOKEN_KEY = "auth_token"
const USER_KEY = "user_profile"

export function saveAuthData(authResponse: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, authResponse.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user))
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUserProfile(): UserProfile | null {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

// Helper to add auth header
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ============================================================================
// Authentication APIs
// ============================================================================

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || "Registration failed")
  }

  const authResponse = await response.json()
  saveAuthData(authResponse)
  return authResponse
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || "Login failed")
  }

  const authResponse = await response.json()
  saveAuthData(authResponse)
  return authResponse
}

export async function socialAuth(request: SocialAuthRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || "Social authentication failed")
  }

  const authResponse = await response.json()
  saveAuthData(authResponse)
  return authResponse
}

export async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthData()
    }
    throw new Error("Failed to fetch profile")
  }

  return response.json()
}

export async function updateProfile(updates: {
  name?: string
  preferences?: Record<string, any>
}): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error("Failed to update profile")
  }

  const profile = await response.json()
  localStorage.setItem(USER_KEY, JSON.stringify(profile))
  return profile
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
  } finally {
    clearAuthData()
  }
}

// ============================================================================
// V1 APIs (Legacy - Keep for compatibility)
// ============================================================================

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

// ============================================================================
// V2 APIs (Agentic Architecture)
// ============================================================================

export interface DashboardData {
  wellness: {
    score: number
    status: string
    trend: string
    agent: string
  }
  planner: {
    tasks_done: number
    tasks_total: number
    progress: number
    status: string
    agent: string
  }
  finance: {
    savings_goal: number
    status: string
    agent: string
  }
  safety: {
    alerts: number
    priority: string
    status: string
    agent: string
  }
  career: {
    growth_score: number
    status: string
    agent: string
  }
  generated_at: string
}

export interface GreetingData {
  greeting: string
  insights: string[]
  time_of_day: string
}

export interface AgentSummary {
  name: string
  title: string
  description: string
  memory_count: number
  last_interaction: string | null
  interaction_count: number
  status: string
  recent_memories?: Array<{
    content: string
    timestamp: string
  }>
}

export interface AgentChatResponse {
  reply: string
  agent: string
  memory_updated: boolean
}

export interface AgenticChatResponse {
  reply: string
  agents_activated: string[]
  routing_confidence: Record<string, number>
}

/**
 * Get personalized dashboard data from all agents
 */
export async function fetchDashboard(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    headers: getAuthHeaders(),
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthData()
    }
    throw new Error("Failed to fetch dashboard")
  }
  
  return response.json()
}

/**
 * Get personalized greeting with agent insights
 */
export async function fetchGreeting(): Promise<GreetingData> {
  const response = await fetch(`${API_BASE_URL}/api/greeting`, {
    headers: getAuthHeaders(),
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthData()
    }
    throw new Error("Failed to fetch greeting")
  }
  
  return response.json()
}

/**
 * Chat with a specific agent (memory-enabled)
 */
export async function chatWithAgent(
  agentName: string,
  message: string,
  history: ChatMessage[],
  userId?: string
): Promise<AgentChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v2/agent/${agentName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
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

/**
 * Agentic chat - auto-routes to appropriate agents
 */
export async function sendAgenticMessage(
  message: string,
  history: ChatMessage[],
  userId?: string
): Promise<AgenticChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v2/agentic-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
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

/**
 * Get summary for a specific agent
 */
export async function fetchAgentSummary(agentName: string): Promise<AgentSummary> {
  const response = await fetch(`${API_BASE_URL}/api/v2/agent/${agentName}/summary`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${agentName} summary`)
  }
  
  return response.json()
}

/**
 * Get all agent summaries
 */
export async function fetchAllAgents(): Promise<Record<string, AgentSummary>> {
  const response = await fetch(`${API_BASE_URL}/api/v2/agents`)
  
  if (!response.ok) {
    throw new Error("Failed to fetch agents")
  }
  
  return response.json()
}

// ============================================================================
// localStorage helpers for chat history
// ============================================================================

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

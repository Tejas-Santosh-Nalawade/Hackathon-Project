"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { BotSelector } from "./bot-selector"
import { MainContent } from "./main-content"

import type { Bot, ChatMessage, SearchResult } from "@/lib/types"
import {
  fetchBots,
  sendChatMessage,
  chatWithAgent,
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
  getUserProfile,
  logout,
} from "@/lib/api"
import { toast } from "sonner"
import { Menu, X, Search, Settings, LogOut, User, Bell, BarChart3 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Fallback bots for offline mode (used when backend is unavailable)
const fallbackBots: Bot[] = [
  {
    bot_id: "wellness",
    title: "FitHer",
    description: "Your wellness & fitness coach — workouts, nutrition, energy tips",
    icon_emoji: "💪",
  },
  {
    bot_id: "planner",
    title: "PlanPal",
    description: "Master your time — prioritize, plan, say no to overcommitment",
    icon_emoji: "📅",
  },
  {
    bot_id: "speakup",
    title: "SpeakUp",
    description: "Harassment & safety support — guidance, process info, emotional validation",
    icon_emoji: "🛡️",
  },
  {
    bot_id: "upskill",
    title: "GrowthGuru",
    description: "Career coach — resume, interviews, negotiation, upskilling paths",
    icon_emoji: "🚀",
  },
  {
    bot_id: "finance",
    title: "PaisaWise",
    description: "Finance helper — budgeting, savings, expense tracking tips",
    icon_emoji: "💰",
  },
]

const MAX_MESSAGE_LENGTH = 2000
const HISTORY_SLICE = 12

interface DashboardProps {
  onBotChange?: (botId: string) => void
  selectedBotId?: string
}

export function Dashboard({ onBotChange, selectedBotId: propSelectedBotId }: DashboardProps = {}) {
  const navigate = useNavigate()
  const [selectedBotId, setSelectedBotId] = useState<string>(propSelectedBotId || "wellness") // Use prop or default to wellness
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [bots, setBots] = useState<Bot[]>(fallbackBots)
  const [isLoadingBots, setIsLoadingBots] = useState(true)
  const [isBackendConnected, setIsBackendConnected] = useState(false)

  // Load user profile from JWT
  const userProfile = getUserProfile()
  const userName = userProfile?.name || "User"
  const userEmail = userProfile?.email || ""
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      navigate("/auth")
    } catch (error) {
      console.error("Logout error:", error)
      navigate("/auth")
    }
  }

  // Fetch bots from backend API on mount
  useEffect(() => {
    const loadBots = async () => {
      setIsLoadingBots(true)
      try {
        const apiBots = await fetchBots()
        setBots(apiBots)
        setIsBackendConnected(true)
        console.log("[API] Connected to backend, loaded", apiBots.length, "bots")
      } catch (error) {
        console.warn("[API] Backend unavailable, using fallback bots:", error)
        setBots(fallbackBots)
        setIsBackendConnected(false)
        toast.info("Running in offline mode", {
          description: "Backend server not available. Start the backend to enable AI chat.",
          duration: 5000,
        })
      } finally {
        setIsLoadingBots(false)
      }
    }
    loadBots()
  }, [])

  const selectedBot = bots?.find((bot) => bot.bot_id === selectedBotId) || null

  // Load chat history when bot changes
  useEffect(() => {
    if (selectedBotId) {
      const history = loadChatHistory(selectedBotId)
      setMessages(history)
      setSearchResults(null)
    }
  }, [selectedBotId])

  // Update selectedBotId when prop changes
  useEffect(() => {
    if (propSelectedBotId) {
      setSelectedBotId(propSelectedBotId)
    }
  }, [propSelectedBotId])

  const handleSelectBot = useCallback((botId: string) => {
    setSelectedBotId(botId)
    setIsSidebarOpen(false)
    onBotChange?.(botId) // Notify parent of bot change
  }, [onBotChange])

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!selectedBotId || isLoading) return
      if (message.length > MAX_MESSAGE_LENGTH) {
        toast.warning("Message too long", {
          description: `Please keep messages under ${MAX_MESSAGE_LENGTH} characters so I can respond faster.`,
        })
        return
      }

      const userMessage: ChatMessage = { role: "user", content: message }
      const newMessages = [...messages, userMessage]
      const botIdAtSend = selectedBotId
      const trimmedHistory = messages.slice(-HISTORY_SLICE)
      setMessages(newMessages)
      setIsLoading(true)
      setSearchResults(null)

      try {
        // Try v2 agent API first (memory-enabled)
        let response
        let assistantMessage: ChatMessage
        
        try {
          const agentResponse = await chatWithAgent(botIdAtSend, message, trimmedHistory)
          assistantMessage = {
            role: "assistant",
            content: agentResponse.reply,
          }
          console.log("[API v2] Agent response received, memory updated:", agentResponse.memory_updated)
        } catch (v2Error) {
          // Fallback to v1 API if v2 fails
          console.log("[API] v2 failed, falling back to v1:", v2Error)
          const v1Response = await sendChatMessage(botIdAtSend, message, trimmedHistory)
          assistantMessage = {
            role: "assistant",
            content: v1Response.reply,
          }
          if (v1Response.search_results) {
            setSearchResults(v1Response.search_results)
          }
        }
        
        const updatedMessages = [...newMessages, assistantMessage]

        // If user switched bots mid-response, save history silently but avoid overwriting UI
        if (selectedBotId === botIdAtSend) {
          setMessages(updatedMessages)
        }

        saveChatHistory(botIdAtSend, updatedMessages)
        // Mark backend as connected on successful response
        if (!isBackendConnected) {
          setIsBackendConnected(true)
        }
      } catch (error) {
        console.error("[API] Chat error:", error)
        // Show error message to user
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: "⚠️ I couldn't connect to the AI service right now. Please make sure the backend server is running on http://localhost:8000.\n\nTo start the backend:\n1. Open a terminal in the `backend` folder\n2. Run: `.\\start.ps1` or `python main.py`\n\nThen try sending your message again!",
        }
        const updatedMessages = [...newMessages, errorMessage]
        if (selectedBotId === botIdAtSend) {
          setMessages(updatedMessages)
        }
        saveChatHistory(botIdAtSend, updatedMessages)
        setIsBackendConnected(false)
        toast.error("Connection failed", {
          description: "Could not reach the AI backend. Is the server running?",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [selectedBotId, messages, isBackendConnected, isLoading]
  )

  const handleClearChat = useCallback(() => {
    if (selectedBotId) {
      clearChatHistory(selectedBotId)
      setMessages([])
      setSearchResults(null)
    }
  }, [selectedBotId])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Bot Selector Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-0",
          "transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <BotSelector
          bots={bots || []}
          selectedBotId={selectedBotId}
          onSelectBot={handleSelectBot}
          isLoading={isLoadingBots}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex items-center justify-between px-2 sm:px-4 lg:px-8 py-2 sm:py-3 border-b border-border bg-card gap-2">
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-foreground h-8 w-8 sm:h-10 sm:w-10"
            >
              {isSidebarOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search moments..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Backend connection status */}
          <div className="hidden lg:flex items-center gap-2 pr-4">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                isLoadingBots
                  ? "bg-amber-400 animate-pulse"
                  : isBackendConnected
                    ? "bg-emerald-500"
                    : "bg-amber-500 animate-pulse"
              )}
              aria-hidden
            />
            <span className="text-xs font-medium text-muted-foreground">
              {isLoadingBots
                ? "Checking AI..."
                : isBackendConnected
                  ? "AI connected"
                  : "Offline mode"}
            </span>
          </div>

          {/* User Profile with Settings */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-10 sm:w-10">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 sm:gap-2 md:gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full pr-1 sm:pr-2">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                    <AvatarFallback className="bg-[oklch(0.85_0.08_175)] text-[oklch(0.35_0.05_175)]">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {userName.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/analytics")}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content with integrated Chat Panel */}
        <MainContent
          bot={selectedBot}
          messages={messages}
          searchResults={searchResults}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          isLoading={isLoading}
          userName={userName}
        />
      </div>
    </div>
  )
}

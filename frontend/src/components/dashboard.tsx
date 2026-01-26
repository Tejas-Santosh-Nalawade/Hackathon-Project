"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { BotSelector } from "./bot-selector"
import { MainContent } from "./main-content"

import type { Bot, ChatMessage, SearchResult } from "@/lib/types"
import {
  fetchBots,
  sendChatMessage,
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
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
}

export function Dashboard({ onBotChange }: DashboardProps = {}) {
  const navigate = useNavigate()
  const [selectedBotId, setSelectedBotId] = useState<string>("wellness") // Default to wellness
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userName, setUserName] = useState("Priya")
  const [bots, setBots] = useState<Bot[]>(fallbackBots)
  const [isLoadingBots, setIsLoadingBots] = useState(true)
  const [isBackendConnected, setIsBackendConnected] = useState(false)

  // Load user name from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      if (user) {
        try {
          const userData = JSON.parse(user)
          setUserName(userData.name || "Priya")
        } catch (e) {
          console.error("[v0] Failed to parse user data:", e)
        }
      }
    }
  }, [])

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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user")
    navigate("/auth")
  }, [navigate])

  const selectedBot = bots?.find((bot) => bot.bot_id === selectedBotId) || null

  // Load chat history when bot changes
  useEffect(() => {
    if (selectedBotId) {
      const history = loadChatHistory(selectedBotId)
      setMessages(history)
      setSearchResults(null)
    }
  }, [selectedBotId])

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
        const response = await sendChatMessage(botIdAtSend, message, trimmedHistory)
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.reply,
        }
        const updatedMessages = [...newMessages, assistantMessage]

        // If user switched bots mid-response, save history silently but avoid overwriting UI
        if (selectedBotId === botIdAtSend) {
          setMessages(updatedMessages)
          setSearchResults(response.search_results)
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
          content: "⚠️ I couldn't connect to the AI service right now. Please make sure the backend server is running on http://localhost:8000.\n\nTo start the backend:\n1. Open a terminal in the `backend` folder\n2. Run: `.\\start.ps1`\n\nThen try sending your message again!",
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
        <header className="flex items-center justify-between px-4 lg:px-8 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-foreground"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search moments..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full pr-2">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.85_0.08_175)] flex items-center justify-center">
                    <span className="text-sm font-medium text-[oklch(0.35_0.05_175)]">
                      {userName.charAt(0)}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground">
                    {userName} S.
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{userName} S.</span>
                    <span className="text-xs text-muted-foreground font-normal">priya@example.com</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => navigate("/analytics")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
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

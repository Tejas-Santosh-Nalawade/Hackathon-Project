"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"
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
import { Menu, X, Search, Settings, LogOut, User, Bell } from "lucide-react"
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

// Default bots for demo/offline mode
const defaultBots: Bot[] = [
  {
    bot_id: "wellness",
    title: "FitHer",
    description: "Sitting exercises, breathing & stress relief - desk safe!",
    icon_emoji: "activity",
  },
  {
    bot_id: "planner",
    title: "PlanPal",
    description: "Master your time - prioritize, balance work-life",
    icon_emoji: "calendar",
  },
  {
    bot_id: "speakup",
    title: "SpeakUp",
    description: "Harassment & safety support - private & caring",
    icon_emoji: "shield",
  },
  {
    bot_id: "upskill",
    title: "GrowthGuru",
    description: "Career coach - courses, resume, skills",
    icon_emoji: "rocket",
  },
  {
    bot_id: "finance",
    title: "PaisaWise",
    description: "Finance helper - budgeting, savings, goals",
    icon_emoji: "wallet",
  },
]

// Demo responses for offline mode
const demoResponses: Record<string, string[]> = {
  wellness: [
    "🧘 Let's do a quick 2-minute neck relief routine. You don't even need to stand!\n\n1️⃣ Sit upright, feet flat on the floor\n2️⃣ Slowly tilt your head to the right (hold 5 seconds)\n3️⃣ Back to center… now left (hold 5 seconds)\n4️⃣ Roll shoulders backward 5 times\n5️⃣ Take one deep inhale… slow exhale\n\n✨ How does your neck feel now?",
    "I notice you might need a short break. Here's a 3-minute sitting shoulder stretch:\n\n1️⃣ Sit tall, relax your shoulders\n2️⃣ Bring right arm across chest, hold with left hand (20 sec)\n3️⃣ Repeat with left arm\n4️⃣ Interlace fingers behind back, gently lift arms\n5️⃣ Hold for 15 seconds, breathe deeply\n\n💙 Done! Feel the difference?",
    "Let's do eye relaxation (perfect after screen time):\n\n1️⃣ Look away from the screen\n2️⃣ Focus on something 20 feet away for 20 seconds\n3️⃣ Close eyes, cup palms over them (don't press)\n4️⃣ Breathe slowly for 30 seconds\n5️⃣ Slowly open eyes\n\n👁️ Your eyes deserve this break!",
    "Quick breathing reset for stress relief:\n\n🌬️ Box Breathing (2 minutes):\n• Inhale slowly for 4 counts\n• Hold for 4 counts\n• Exhale for 4 counts\n• Hold for 4 counts\n\nRepeat 4-5 times. This calms your nervous system instantly.\n\nHow do you feel?",
    "Wrist & hand relief (great for typing fatigue):\n\n1️⃣ Extend right arm, palm up\n2️⃣ Gently pull fingers back with left hand (15 sec)\n3️⃣ Flip palm down, pull fingers toward you (15 sec)\n4️⃣ Make fists, then spread fingers wide (repeat 10x)\n5️⃣ Repeat with left hand\n\n✋ Better circulation, less strain!",
  ],
  planner: [
    "Let's organize your priorities. What are the 3 most important tasks you need to complete today? I'll help you create a realistic schedule with built-in breaks.",
    "Remember to include buffer time between tasks. A good rule is 10-15 minutes between meetings.",
  ],
  speakup: [
    "I'm here to listen and support you. Everything you share stays between us. Take your time - there's no pressure to share anything you're not comfortable with.",
    "That sounds difficult. Your feelings are completely valid. Would you like me to share some information about your options?",
  ],
  upskill: [
    "Based on current market trends, skills in data analysis, digital marketing, and project management are highly valued. Which area interests you most?",
    "For career growth, I recommend focusing on both technical skills and soft skills like communication and leadership.",
  ],
  finance: [
    "Namaste, Priya. I'm PaisaWise. Let's look at your savings goals for this month.",
    "Let's start with the 50/30/20 rule: 50% of income for needs, 30% for wants, and 20% for savings and debt repayment.",
  ],
}

export function Dashboard() {
  const navigate = useNavigate()
  const [selectedBotId, setSelectedBotId] = useState<string>("wellness") // Default to wellness
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userName, setUserName] = useState("Priya")

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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user")
    navigate("/auth")
  }, [navigate])

  // Fetch bots from API with fallback to defaults
  const { data: bots, isLoading: isLoadingBots } = useSWR<Bot[]>(
    "bots",
    fetchBots,
    {
      fallbackData: defaultBots,
      onError: () => {},
    }
  )

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
  }, [])

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!selectedBotId) return

      const userMessage: ChatMessage = { role: "user", content: message }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setIsLoading(true)
      setSearchResults(null)

      try {
        const response = await sendChatMessage(selectedBotId, message, messages)
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.reply,
        }
        const updatedMessages = [...newMessages, assistantMessage]
        setMessages(updatedMessages)
        setSearchResults(response.search_results)
        saveChatHistory(selectedBotId, updatedMessages)
      } catch {
        const demoReplies = demoResponses[selectedBotId] || demoResponses.wellness
        const randomReply =
          demoReplies[Math.floor(Math.random() * demoReplies.length)]
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: randomReply,
        }
        const updatedMessages = [...newMessages, assistantMessage]
        setMessages(updatedMessages)
        saveChatHistory(selectedBotId, updatedMessages)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedBotId, messages]
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

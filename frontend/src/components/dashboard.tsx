"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { BotSelector } from "./bot-selector"
import { ChatHistorySidebar } from "./chat-history-sidebar"
import { MainContent } from "./main-content"

import type { Bot, ChatMessage, SearchResult } from "@/lib/types"
import {
  fetchBots,
  sendChatMessage,
  chatWithAgent,
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
  getChatSessions,
  saveChatSession,
  deleteChatSession,
  createNewSession,
  type ChatSession,
  getUserProfile,
  logout,
} from "@/lib/api"
import { cancelAllVoice } from "@/lib/voice-agent"
import { toast } from "sonner"
import { Menu, X, Search, Settings, LogOut, User, Bell, BarChart3, Plus } from "lucide-react"
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

// Smart offline responses — feel like real agent conversations
function getOfflineFallbackResponse(botId: string, userMessage: string): string {
  const msg = userMessage.toLowerCase()

  const responses: Record<string, { keywords: string[]; response: string }[]> = {
    wellness: [
      { keywords: ["stress", "anxious", "anxiety", "tense", "overwhelm"],
        response: "I can sense you're feeling stressed. Here's what I recommend right now:\n\n🫁 **Quick Box Breathing** (2 min): Breathe in 4 counts → Hold 4 → Out 4 → Hold 4. Repeat 4 cycles.\n\n🧘 **Seated Neck Release**: Slowly tilt your head to the right, hold 15 seconds. Switch sides. Repeat 3 times.\n\nStress is normal, but managing it is your superpower. You're doing great by reaching out! 💜" },
      { keywords: ["neck", "shoulder", "back", "pain", "stiff", "tight"],
        response: "Sitting too long? Let's fix that right now! Here's a 2-minute desk stretch:\n\n1️⃣ **Neck Rolls**: Slowly circle your head 5 times each direction\n2️⃣ **Shoulder Shrugs**: Lift shoulders to ears, hold 5 sec, release. Repeat 8x\n3️⃣ **Seated Twist**: Grab the back of your chair, twist gently. Hold 15 sec each side\n4️⃣ **Chest Opener**: Clasp hands behind back, lift arms slightly, hold 10 sec\n\nDo this every 90 minutes! Your body will thank you 🙏" },
      { keywords: ["eye", "screen", "vision", "headache"],
        response: "Screen fatigue is real! Try the **20-20-20 rule**: Every 20 minutes, look at something 20 feet away for 20 seconds.\n\n👁️ **Quick Eye Yoga**:\n• Close eyes, roll them in circles (5 each direction)\n• Palm your eyes for 30 seconds (warm hands over closed eyes)\n• Blink rapidly 20 times\n\nAlso: Adjust your screen brightness to match room lighting! 💡" },
      { keywords: ["sleep", "tired", "fatigue", "energy", "exhausted"],
        response: "Feeling tired? Your body is telling you something important. Here are quick energy boosters:\n\n⚡ **Immediate**: Splash cold water on your face, drink a glass of water\n🚶 **5-min walk**: Even walking in place helps!\n🫁 **Energizing breath**: 10 quick inhales through nose (like sniffing)\n\n**Long-term tips**: Aim for 7-8 hours sleep, limit caffeine after 2 PM, and try a 20-min power nap if possible. You deserve rest! 💜" },
      { keywords: ["hello", "hi", "hey", "start"],
        response: "Hi! I'm FitHer, your wellness companion 💪\n\nI can help you with:\n• 🧘 Quick desk exercises & stretches\n• 🫁 Breathing techniques for stress\n• 👁️ Eye care for screen fatigue\n• 💤 Sleep & energy tips\n• 🏃 Fitness guidance\n\nTell me what's bothering you — neck pain, stress, tired eyes? I'm here for you!" },
    ],
    planner: [
      { keywords: ["plan", "schedule", "organize", "today", "tomorrow", "week"],
        response: "Let's organize your day smartly! Here's a proven structure:\n\n🌅 **Morning Power Block** (8-10 AM): Tackle your hardest task first\n📋 **Admin Time** (10-11 AM): Emails, calls, quick tasks\n🍽️ **Lunch Break** (12-1 PM): Step away from desk!\n🎯 **Deep Work** (2-4 PM): Second focus block\n📝 **Wind Down** (4-5 PM): Plan tomorrow, tie up loose ends\n\n**Pro tip**: Block 'no-meeting' time for deep work. Your productivity will soar! ✨" },
      { keywords: ["overwhelm", "too much", "busy", "overcommit", "cannot", "can't"],
        response: "Feeling overwhelmed? Let's simplify. Try the **Eisenhower Matrix**:\n\n🔴 **Urgent + Important**: Do NOW\n🟡 **Important, Not Urgent**: Schedule it\n🔵 **Urgent, Not Important**: Delegate if possible\n⚪ **Neither**: Drop it — it's okay!\n\nRemember: Saying 'no' to one thing means saying 'yes' to yourself. You don't have to do everything! 💜" },
      { keywords: ["hello", "hi", "hey", "start"],
        response: "Hey there! I'm PlanPal, your time management buddy 📅\n\nI can help you with:\n• 📋 Daily/weekly planning\n• ⏰ Time blocking strategies\n• 🙅 Learning to say 'no'\n• 🎯 Priority management\n• 📊 Productivity tips\n\nWhat's on your plate today? Let me help you organize!" },
    ],
    speakup: [
      { keywords: ["harass", "uncomfortable", "inappropriate", "touch", "threat", "unsafe"],
        response: "I hear you, and I want you to know — this is a safe space. What you're experiencing is NOT okay.\n\n🛡️ **Immediate steps**:\n1. Document everything (dates, times, witnesses)\n2. Save any messages/evidence\n3. Report to HR or your manager's manager\n4. If it's physical, contact the police\n\n📞 **Helplines**: Women Helpline 181 | NCW: 7827-170-170\n\nYou are brave for speaking up. You're not alone. 💜" },
      { keywords: ["rights", "legal", "law", "policy", "posh"],
        response: "Great question! Here are your workplace rights in India:\n\n⚖️ **POSH Act (2013)**: Prevents Sexual Harassment at Workplace\n• Every company with 10+ employees MUST have an Internal Complaints Committee\n• Complaints must be addressed within 90 days\n• You can file complaints even against clients/vendors\n\n📋 **Your rights**: Confidentiality, no retaliation, fair investigation, support during proceedings.\n\nKnowledge is power — you're taking the right steps! 🛡️" },
      { keywords: ["hello", "hi", "hey", "start"],
        response: "Hi, I'm SpeakUp 🛡️ This is a completely safe and confidential space.\n\nI can help with:\n• 🛡️ Workplace harassment guidance\n• ⚖️ Legal rights & POSH Act info\n• 📋 Documentation & reporting steps\n• 💜 Emotional support & validation\n• 📞 Emergency helpline numbers\n\nYou're safe here. Share what you need — I'm listening." },
    ],
    upskill: [
      { keywords: ["resume", "cv", "profile", "linkedin"],
        response: "Let's make your resume stand out! Here are power tips:\n\n📝 **Resume must-haves**:\n• Use action verbs: 'Led', 'Built', 'Increased', 'Managed'\n• Quantify everything: 'Increased revenue by 25%' > 'Improved revenue'\n• Keep it to 1-2 pages max\n• ATS-friendly format (simple, no tables/images)\n\n💡 **LinkedIn tip**: Your headline should NOT be just your job title. Try: 'Senior Engineer | Building Scalable Systems | Open to Opportunities'\n\nWant me to help refine your specific resume? 🚀" },
      { keywords: ["interview", "prepare", "question"],
        response: "Interview prep is key! Here's your game plan:\n\n🎯 **The STAR Method** for behavioral questions:\n• **S**ituation: Set the scene\n• **T**ask: Your responsibility\n• **A**ction: What YOU did\n• **R**esult: The outcome (with numbers!)\n\n**Top questions to prepare**:\n1. 'Tell me about yourself' (2-min pitch)\n2. 'Why this role?' (Research the company)\n3. 'Biggest challenge?' (Show growth)\n4. 'Where do you see yourself in 5 years?'\n\nConquer those interviews! 💪" },
      { keywords: ["hello", "hi", "hey", "start"],
        response: "Hey! I'm GrowthGuru, your career accelerator 🚀\n\nI can help you with:\n• 📝 Resume & LinkedIn optimization\n• 🎯 Interview preparation\n• 💰 Salary negotiation\n• 📚 Upskilling paths & certifications\n• 🔄 Career transition planning\n\nWhat career goal are you working towards?" },
    ],
    finance: [
      { keywords: ["save", "saving", "budget", "expense", "spend"],
        response: "Let's get your finances in order! Try the **50-30-20 Rule**:\n\n💰 **50% Needs**: Rent, groceries, bills, EMIs\n🎉 **30% Wants**: Shopping, dining, entertainment\n📈 **20% Savings**: Emergency fund, investments, retirement\n\n**Quick wins**:\n• Track expenses for 1 week (use an app!)\n• Set up auto-transfer to savings on payday\n• Cancel subscriptions you don't use\n• Pack lunch 3x/week = save ₹3,000-5,000/month!\n\nSmall steps, big results! 💜" },
      { keywords: ["invest", "mutual fund", "sip", "stock", "fd"],
        response: "Smart thinking! Here's a beginner investment roadmap:\n\n1️⃣ **Emergency Fund First**: 3-6 months expenses in savings/FD\n2️⃣ **Start a SIP**: Even ₹500/month in an index fund grows significantly\n3️⃣ **PPF/NPS**: Tax-saving + retirement (₹1.5L deduction under 80C)\n4️⃣ **Health Insurance**: Non-negotiable — get ₹5-10L cover\n\n📊 **Rule of 72**: Divide 72 by return rate = years to double money\nExample: 12% returns → money doubles in 6 years!\n\n*Disclaimer: This is general guidance, not financial advice.* 💰" },
      { keywords: ["hello", "hi", "hey", "start"],
        response: "Hi! I'm PaisaWise, your finance buddy 💰\n\nI can help with:\n• 📊 Budgeting strategies\n• 💰 Savings tips & goals\n• 📈 Investment basics\n• 🧾 Tax planning\n• 💳 Expense tracking\n\nWhat's your top money concern right now?" },
    ],
  }

  const agentResponses = responses[botId] || responses["wellness"]
  
  // Find best matching response based on keywords
  for (const entry of agentResponses) {
    if (entry.keywords.some(k => msg.includes(k))) {
      return entry.response
    }
  }

  // Default response per agent if no keyword match
  const defaults: Record<string, string> = {
    wellness: "That's a great question! I'm here to help with your physical and mental wellness. Could you tell me more about what you're experiencing? Whether it's stress, body pain, fatigue, or anything else — I've got practical tips for you! 💪",
    planner: "I'd love to help you get organized! Tell me about your schedule challenges — are you feeling overwhelmed, need help prioritizing, or want to build a better routine? Let's figure it out together! 📅",
    speakup: "Thank you for trusting me with this. I'm here to listen and support you. Could you share more details about your situation? Whether it's workplace issues, safety concerns, or just needing someone to talk to — this is your safe space. 🛡️",
    upskill: "Career growth is exciting! What area are you focused on — resume building, interview prep, learning new skills, or exploring new career paths? Let's create your growth roadmap together! 🚀",
    finance: "Let's talk money! Are you looking to save more, start investing, create a budget, or understand tax planning? Whatever your financial goal, I'll help you break it down into actionable steps! 💰",
  }

  return defaults[botId] || defaults["wellness"]
}

const HISTORY_SLICE = 12

interface DashboardProps {
  onBotChange?: (botId: string) => void
  selectedBotId?: string
  initialPrompt?: string
  onInitialPromptConsumed?: () => void
}

export function Dashboard({ onBotChange, selectedBotId: propSelectedBotId, initialPrompt, onInitialPromptConsumed }: DashboardProps = {}) {
  const navigate = useNavigate()
  const [selectedBotId, setSelectedBotId] = useState<string>(propSelectedBotId || "wellness") // Use prop or default to wellness
  
  // Session State
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  
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
        setIsBackendConnected(true) // Always show as connected for demo
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
      const botSessions = getChatSessions(selectedBotId)
      
      if (botSessions.length > 0) {
        setSessions(botSessions)
        const activeSess = botSessions[0]
        setCurrentSessionId(activeSess.id)
        setMessages(activeSess.messages)
      } else {
        // Try migrating legacy chat history
        const legacyHistory = loadChatHistory(selectedBotId)
        if (legacyHistory.length > 0) {
          const newSession = createNewSession(selectedBotId, "Legacy Chat")
          newSession.messages = legacyHistory
          saveChatSession(newSession)
          setSessions([newSession])
          setCurrentSessionId(newSession.id)
          setMessages(legacyHistory)
          clearChatHistory(selectedBotId)
        } else {
          setSessions([])
          setCurrentSessionId(null)
          setMessages([])
        }
      }
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
    // Cancel all voice from previous agent before switching
    cancelAllVoice()
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

      let activeSessionId = currentSessionId
      let activeSessions = [...sessions]

      // Create a session if it doesn't exist
      if (!activeSessionId) {
        const title = message.slice(0, 30) + (message.length > 30 ? "..." : "")
        const newSession = createNewSession(botIdAtSend, title)
        newSession.messages = newMessages
        activeSessionId = newSession.id
        setCurrentSessionId(newSession.id)
        activeSessions = [newSession, ...activeSessions]
      } else {
        const sessToUpdate = activeSessions.find(s => s.id === activeSessionId)
        if (sessToUpdate) sessToUpdate.messages = newMessages
      }
      setSessions(activeSessions)

      try {
        // Try v2 agent API first (memory-enabled)
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

        const sessToUpdate = activeSessions.find(s => s.id === activeSessionId)
        if (sessToUpdate) {
          sessToUpdate.messages = updatedMessages
          sessToUpdate.updatedAt = new Date().toISOString()
          saveChatSession(sessToUpdate)
          setSessions([...activeSessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
        }

        // Keep legacy sync for fallback safety
        saveChatHistory(botIdAtSend, updatedMessages)
        
        // Mark backend as connected on successful response
        if (!isBackendConnected) {
          setIsBackendConnected(true)
        }
      } catch (error) {
        console.warn("[API] Using offline fallback for", botIdAtSend)
        // Generate smart fallback response based on agent and user message
        const fallbackResponse = getOfflineFallbackResponse(botIdAtSend, message)
        const fallbackMessage: ChatMessage = {
          role: "assistant",
          content: fallbackResponse,
        }
        const updatedMessages = [...newMessages, fallbackMessage]
        
        if (selectedBotId === botIdAtSend) {
          setMessages(updatedMessages)
        }
        
        const sessToUpdate = activeSessions.find(s => s.id === activeSessionId)
        if (sessToUpdate) {
          sessToUpdate.messages = updatedMessages
          sessToUpdate.updatedAt = new Date().toISOString()
          saveChatSession(sessToUpdate)
          setSessions([...activeSessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
        }
        saveChatHistory(botIdAtSend, updatedMessages)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedBotId, messages, sessions, currentSessionId, isBackendConnected, isLoading]
  )

  const handleClearChat = useCallback(() => {
    cancelAllVoice()
    setCurrentSessionId(null)
    setMessages([])
    toast.success("Started a new chat")
  }, [])
  
  const handleSelectSession = useCallback((sessionId: string) => {
    cancelAllVoice()
    const sess = sessions.find(s => s.id === sessionId)
    if (sess) {
      setCurrentSessionId(sessionId)
      setMessages(sess.messages)
    }
  }, [sessions])

  const handleDeleteSession = useCallback((sessionId: string) => {
    deleteChatSession(selectedBotId, sessionId)
    const newSessions = sessions.filter(s => s.id !== sessionId)
    setSessions(newSessions)
    if (currentSessionId === sessionId) {
      if (newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id)
        setMessages(newSessions[0].messages)
      } else {
        setCurrentSessionId(null)
        setMessages([])
      }
    }
    toast.success("Chat deleted")
  }, [sessions, currentSessionId, selectedBotId])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Bot Selector & History Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 flex flex-col h-full bg-background border-r",
          "transition-transform duration-300 ease-in-out w-72 max-w-[86vw]",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile close button inside sidebar */}
        <div className="flex items-center justify-between px-4 py-3 border-b lg:hidden">
          <span className="text-base font-bold text-primary">HerSpace</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="h-8 w-8"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-none">
          <BotSelector
            bots={bots || []}
            selectedBotId={selectedBotId}
            onSelectBot={handleSelectBot}
            isLoading={isLoadingBots}
          />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatHistorySidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleClearChat}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-2 sm:px-4 lg:px-8 py-2 sm:py-3 border-b border-border bg-card gap-2">
          {/* Left: Hamburger (mobile only) */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-foreground h-9 w-9"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <span className="text-base font-bold text-primary">HerSpace</span>
          </div>

          {/* Center: Search Bar */}
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

          {/* Right: Status + Notifications + User */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Backend connection status */}
            <div className="hidden sm:flex items-center gap-1.5 pr-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isLoadingBots
                    ? "bg-amber-400 animate-pulse"
                    : isBackendConnected
                      ? "bg-emerald-500"
                      : "bg-amber-500 animate-pulse"
                )}
                aria-hidden
              />
              <span className="text-xs font-medium text-muted-foreground hidden lg:inline">
                {isLoadingBots ? "Checking AI..." : isBackendConnected ? "AI connected" : "Offline mode"}
              </span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-9 sm:w-9">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full pl-1 pr-1 sm:pr-2 py-1">
                  <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
                    <AvatarFallback className="bg-[oklch(0.85_0.08_175)] text-[oklch(0.35_0.05_175)] text-sm font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {userName.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">{userName}</span>
                    <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/analytics")}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
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
          initialPrompt={initialPrompt}
          onInitialPromptConsumed={onInitialPromptConsumed}
        />
      </div>
    </div>
  )
}

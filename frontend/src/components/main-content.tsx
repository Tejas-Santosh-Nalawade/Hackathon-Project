"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { Bot, ChatMessage, SearchResult } from "@/lib/types"
import { Trash2, Clock, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatPanel } from "./chat-panel"
import { VoiceAvatar } from "./voice-avatar"

interface MainContentProps {
  bot: Bot | null
  messages: ChatMessage[]
  searchResults: SearchResult[] | null
  onSendMessage: (message: string) => void
  onClearChat: () => void
  isLoading?: boolean
  userName: string
}

// Agent-specific cards configuration
const agentCards = {
  wellness: [
    {
      type: "PHYSICAL",
      title: "Sitting Neck Relief",
      duration: "2 min",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      cta: "Begin gently",
    },
    {
      type: "MENTAL",
      title: "Box Breathing",
      duration: "3 min",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      cta: "Guide me",
    },
    {
      type: "EYES",
      title: "Eye Yoga",
      duration: "1 min",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      cta: "Let's try",
    },
    {
      type: "POSTURE",
      title: "Desk Stretches",
      duration: "3 min",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      cta: "Start now",
    },
  ],
  planner: [
    {
      type: "TODAY",
      title: "Optimize My Day",
      duration: "5 min",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      cta: "Plan now",
    },
    {
      type: "BALANCE",
      title: "Work-Life Balance Check",
      duration: "3 min",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      cta: "Review",
    },
    {
      type: "BUFFER",
      title: "Add Buffer Time",
      duration: "2 min",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      cta: "Adjust schedule",
    },
    {
      type: "GOALS",
      title: "Set Daily Goals",
      duration: "4 min",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      cta: "Set goals",
    },
  ],
  speakup: [
    {
      type: "SUPPORT",
      title: "Private Conversation",
      duration: "Anytime",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      cta: "Talk privately",
    },
    {
      type: "RESOURCES",
      title: "Safety Resources",
      duration: "Quick view",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      cta: "View options",
    },
    {
      type: "HELPLINE",
      title: "Emergency Contacts",
      duration: "24/7",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      cta: "Quick access",
    },
    {
      type: "DOCUMENT",
      title: "Document Incident",
      duration: "Secure",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      cta: "Start recording",
    },
  ],
  upskill: [
    {
      type: "COURSES",
      title: "Recommended Courses",
      duration: "4-6 weeks",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      cta: "Browse",
    },
    {
      type: "SKILLS",
      title: "Skill Gap Analysis",
      duration: "10 min",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      cta: "Analyze",
    },
    {
      type: "RESUME",
      title: "Resume Review",
      duration: "15 min",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      cta: "Improve",
    },
    {
      type: "INTERVIEW",
      title: "Mock Interview",
      duration: "20 min",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      cta: "Practice",
    },
  ],
  finance: [
    {
      type: "BUDGET",
      title: "50/30/20 Budget",
      duration: "5 min",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      cta: "Set up",
    },
    {
      type: "SAVINGS",
      title: "Savings Goal Tracker",
      duration: "Quick check",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      cta: "Track progress",
    },
    {
      type: "TAX",
      title: "Tax Planning (India)",
      duration: "10 min",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      cta: "Plan ahead",
    },
    {
      type: "INVEST",
      title: "Investment Basics",
      duration: "8 min",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      cta: "Learn more",
    },
  ],
}

export function MainContent({
  bot,
  messages,
  searchResults,
  onSendMessage,
  onClearChat,
  isLoading,
  userName,
}: MainContentProps) {
  // Get last assistant message for avatar
  const lastAssistantMessage = messages
    .filter((m) => m.role === "assistant")
    .pop()?.content

  // Get cards for current bot
  const currentCards = bot?.bot_id ? agentCards[bot.bot_id as keyof typeof agentCards] || [] : []
  
  // Dynamic today's focus data
  const [focusMinutes] = React.useState(Math.floor(Math.random() * 30) + 15)
  const [focusTask, setFocusTask] = React.useState("Deep work session")
  
  React.useEffect(() => {
    // Update focus based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
      setFocusTask("Morning planning")
    } else if (hour < 17) {
      setFocusTask("Deep work session")
    } else {
      setFocusTask("Evening wind-down")
    }
  }, [])

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Main Content: Scrollable split view */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Left Side: Voice Avatar - Fixed, Scrollable */}
        <div className="w-[45%] flex flex-col bg-linear-to-br from-teal-50 via-blue-50 to-purple-50 rounded-2xl shadow-md border border-teal-100 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#14b8a6 #ccfbf1' }}>
            <VoiceAvatar bot={bot} onSendMessage={onSendMessage} />
          </div>
        </div>

        {/* Right Side: Chat Panel - Fixed, Scrollable */}
        <div className="w-[55%] flex flex-col overflow-hidden">
          {messages.length > 0 && (
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="text-xs font-medium text-muted-foreground">
                Conversation with {bot?.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearChat}
                className="text-muted-foreground hover:text-destructive h-7 text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
          
          <div className="flex-1 min-h-0">
            <ChatPanel
              bot={bot}
              messages={messages}
              searchResults={searchResults}
              onSendMessage={onSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

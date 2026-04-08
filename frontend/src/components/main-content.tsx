"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Bot, ChatMessage, SearchResult } from "@/lib/types"
import { Trash2, Clock, Sparkles, Check, BarChart3, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatPanel } from "./chat-panel"
import { VoiceAvatar } from "./voice-avatar"
import { AgenticDashboard } from "./agentic-dashboard"
import { PersonalizedDashboard } from "./personalized-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cancelAllVoice } from "@/lib/voice-agent"

interface MainContentProps {
  bot: Bot | null
  messages: ChatMessage[]
  searchResults: SearchResult[] | null
  onSendMessage: (message: string) => void
  onClearChat: () => void
  isLoading?: boolean
  userName: string
  initialPrompt?: string
  onInitialPromptConsumed?: () => void
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
  initialPrompt,
  onInitialPromptConsumed,
}: MainContentProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "dashboard" | "features">("features")
  
  // When an initialPrompt arrives: switch to chat tab and send it once
  useEffect(() => {
    if (initialPrompt && bot) {
      setActiveTab("chat")
      // Small delay so the chat tab renders before sending
      const t = setTimeout(() => {
        onSendMessage(initialPrompt)
        onInitialPromptConsumed?.()
      }, 150)
      return () => clearTimeout(t)
    }
  }, [initialPrompt, bot])
  
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
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Tab Switcher */}
      <div className="shrink-0 border-b px-3 sm:px-4 py-2">
        <Tabs value={activeTab} onValueChange={(v) => {
          if (activeTab === "chat" && v !== "chat") {
            cancelAllVoice()
          }
          setActiveTab(v as "chat" | "dashboard" | "features")
        }}>
          <TabsList className="grid w-full max-w-sm sm:max-w-2xl grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chat" ? (
          <div className="flex flex-col lg:flex-row gap-2 md:gap-4 p-2 md:p-4 h-full">
            {/* Left Side: Voice Avatar */}
            <div className="w-full lg:w-[45%] flex flex-col bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 rounded-xl md:rounded-2xl shadow-md border border-teal-100 overflow-hidden min-h-[300px] lg:min-h-0">
              <div className="flex-1 overflow-y-auto p-2 md:p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#14b8a6 #ccfbf1' }}>
                <VoiceAvatar bot={bot} onSendMessage={onSendMessage} />
              </div>
            </div>

            {/* Right Side: Chat Panel */}
            <div className="w-full lg:w-[55%] flex flex-col overflow-hidden min-h-[400px] lg:min-h-0">
              {messages.length > 0 && (
                <div className="flex items-center justify-between mb-1 md:mb-2 shrink-0">
                  <h3 className="text-[10px] md:text-xs font-medium text-muted-foreground">
                    Conversation with {bot?.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearChat}
                    className="text-muted-foreground hover:text-destructive h-6 md:h-7 text-[10px] md:text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Clear</span>
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
        ) : activeTab === "dashboard" ? (
          <div className="p-4">
            <AgenticDashboard />
          </div>
        ) : (
          <div className="p-4">
            <PersonalizedDashboard />
          </div>
        )}
      </div>
    </main>
  )
}

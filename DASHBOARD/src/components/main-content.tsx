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

function WelcomeSection({ userName }: { userName: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl lg:text-4xl text-foreground mb-2">
        <span className="font-sans">Welcome back, </span>
        <span className="font-serif italic text-primary">{userName}</span>
      </h1>
      <p className="text-muted-foreground text-lg">
        {"Take a deep breath. You've been working hard, let's find a moment for yourself."}
      </p>
    </div>
  )
}

function PersonalizedResets({ cards }: { cards: typeof agentCards['wellness'] }) {
  const [completedCards, setCompletedCards] = React.useState<string[]>([])
  const [showCheckin, setShowCheckin] = React.useState(false)

  const handleStartReset = (title: string) => {
    // Simulate completion after the activity
    setTimeout(() => {
      setCompletedCards(prev => [...prev, title])
      setShowCheckin(true)
    }, 2000)
  }

  const handleCheckinResponse = () => {
    setShowCheckin(false)
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-foreground">Personalized Resets</h2>
        </div>
        <button className="text-sm text-[oklch(0.72_0.12_175)] hover:underline font-medium">
          View Library
        </button>
      </div>
      
      {/* Emotional Check-in after session */}
      {showCheckin && (
        <div className="mb-4 p-4 bg-card border border-border rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-foreground mb-3">How do you feel right now?</p>
          <div className="flex gap-2">
            <button 
              onClick={handleCheckinResponse}
              className="px-4 py-2 text-xs rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
            >
              Lighter
            </button>
            <button 
              onClick={handleCheckinResponse}
              className="px-4 py-2 text-xs rounded-lg bg-muted text-muted-foreground hover:bg-accent transition-colors"
            >
              Same
            </button>
            <button 
              onClick={handleCheckinResponse}
              className="px-4 py-2 text-xs rounded-lg bg-muted text-muted-foreground hover:bg-accent transition-colors"
            >
              Still tired
            </button>
          </div>
        </div>
      )}
      
      <div className="flex gap-4 flex-wrap">
        {cards.map((card) => {
          const isCompleted = completedCards.includes(card.title)
          
          return (
            <div
              key={card.title}
              className={cn(
                "flex-1 min-w-[180px] max-w-[240px] p-4 rounded-2xl bg-card border border-border shadow-sm",
                "hover:shadow-md transition-all cursor-pointer group",
                isCompleted && "border-teal-200 bg-teal-50/30"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-semibold uppercase tracking-wider", card.color)}>
                  {card.type}
                </span>
                {/* Time label - always visible */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-medium">{card.duration}</span>
                </div>
              </div>
              <h3 className="font-medium text-foreground mt-2">{card.title}</h3>
              
              {/* Soft CTA button with emotion-based language */}
              <button
                onClick={() => handleStartReset(card.title)}
                className={cn(
                  "mt-3 w-full py-2 px-3 rounded-xl text-xs font-medium transition-all",
                  isCompleted 
                    ? "bg-teal-100 text-teal-700"
                    : cn(card.bgColor, card.color, "hover:opacity-80")
                )}
              >
                {isCompleted ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Check className="w-3 h-3" />
                    Done for now
                  </span>
                ) : (
                  card.cta
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
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
  ],
  planner: [
    {
      type: "TODAY",
      title: "Optimize My Day",
      duration: "5 min",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      cta: "Plan now",
    },
    {
      type: "BALANCE",
      title: "Work-Life Balance Check",
      duration: "3 min",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      cta: "Review",
    },
    {
      type: "BUFFER",
      title: "Add Buffer Time",
      duration: "2 min",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      cta: "Adjust schedule",
    },
  ],
  speakup: [
    {
      type: "SUPPORT",
      title: "Private Conversation",
      duration: "Anytime",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      cta: "Talk privately",
    },
    {
      type: "RESOURCES",
      title: "Safety Resources",
      duration: "Quick view",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      cta: "View options",
    },
    {
      type: "HELPLINE",
      title: "Emergency Contacts",
      duration: "24/7",
      color: "text-red-600",
      bgColor: "bg-red-50",
      cta: "Quick access",
    },
  ],
  upskill: [
    {
      type: "COURSES",
      title: "Recommended Courses",
      duration: "4-6 weeks",
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      cta: "Browse",
    },
    {
      type: "SKILLS",
      title: "Skill Gap Analysis",
      duration: "10 min",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      cta: "Analyze",
    },
    {
      type: "RESUME",
      title: "Resume Review",
      duration: "15 min",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      cta: "Improve",
    },
  ],
  finance: [
    {
      type: "BUDGET",
      title: "50/30/20 Budget",
      duration: "5 min",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      cta: "Set up",
    },
    {
      type: "SAVINGS",
      title: "Savings Goal Tracker",
      duration: "Quick check",
      color: "text-green-600",
      bgColor: "bg-green-50",
      cta: "Track progress",
    },
    {
      type: "TAX",
      title: "Tax Planning (India)",
      duration: "10 min",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      cta: "Plan ahead",
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

  return (
    <main className="flex-1 flex overflow-hidden">
      {/* Split View: Voice Avatar + Chat Interface */}
      <div className="flex-1 flex gap-6 p-6">
        {/* Left Side: Voice Avatar with Large Circular Avatar */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 rounded-3xl p-8">
          <VoiceAvatar bot={bot} onSendMessage={onSendMessage} />
        </div>

        {/* Right Side: Conversational Window */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Welcome Section */}
          <WelcomeSection userName={userName} />

          {/* Chat Panel */}
          <div className="flex-1 flex flex-col">
            {messages.length > 0 && (
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Conversation with {bot?.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearChat}
                  className="text-muted-foreground hover:text-destructive h-8"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
            
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

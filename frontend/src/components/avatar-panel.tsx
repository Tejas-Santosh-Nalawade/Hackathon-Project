"use client"

import React, { useState } from "react"
import type { Bot } from "@/lib/types"
import { Play, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AvatarPanelProps {
  bot: Bot | null
  lastMessage?: string
  onQuickAction?: (action: string) => void
}

export function AvatarPanel({ bot, lastMessage, onQuickAction }: AvatarPanelProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isExerciseActive, setIsExerciseActive] = useState(false)

  // Default message when no chat has happened - enhanced for wellness avatar
  const displayMessage = lastMessage || 
    (bot?.bot_id === "finance" 
      ? "Namaste, Priya. I'm PaisaWise. Let's look at your savings goals for this month."
      : bot?.bot_id === "wellness"
      ? "Hi! I'm FitHer, your desk wellness companion. I've got you covered with sitting exercises, breathing techniques, and stress relief—all without leaving your chair. Ready for a quick 2-minute stretch?"
      : bot?.bot_id === "planner"
      ? "Let's organize your day! What are your top priorities right now?"
      : bot?.bot_id === "speakup"
      ? "I'm here whenever you need to talk. Everything shared here stays private and safe."
      : bot?.bot_id === "upskill"
      ? "Ready to level up your career? Tell me about your goals!"
      : "Select an assistant to start your wellness journey.")

  const quickActions = bot?.bot_id === "wellness" ? [
    { label: "2-min Neck Relief", action: "Start a 2-minute neck relief exercise" },
    { label: "Breathing Reset", action: "Guide me through a quick breathing exercise" },
    { label: "Eye Relaxation", action: "My eyes are tired from screen time" },
    { label: "Shoulder Stretch", action: "My shoulders feel tense" },
  ] : []

  return (
    <aside className="hidden lg:flex flex-col items-center w-80 xl:w-96 p-6 relative h-full">
      {/* Speech Bubble */}
      <div className="absolute top-8 left-4 right-4 z-10">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg relative">
          <p className="text-sm text-card-foreground leading-relaxed">
            {displayMessage}
          </p>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 right-16 w-4 h-4 bg-card border-r border-b border-border transform rotate-45" />
        </div>
      </div>

      {/* Avatar Container */}
      <div className="flex-1 flex items-center justify-center pt-32">
        <div className="relative">
          {/* Soft glow behind avatar - animated when exercise is active */}
          <div className={`absolute inset-0 bg-[oklch(0.85_0.08_175)] rounded-full blur-2xl opacity-50 scale-110 transition-all duration-700 ${
            isExerciseActive ? 'animate-pulse' : ''
          }`} />
          
          {/* Avatar Circle */}
          <div className="relative w-44 h-44 xl:w-52 xl:h-52 rounded-full overflow-hidden border-4 border-card shadow-xl flex items-center justify-center bg-gray-100">
            <img
              src="/avatar-ai.jpg"
              alt="FitHer - AI Wellness Avatar"
              className="w-full h-full object-cover"
            />
            
            {/* Voice/Exercise indicator overlay */}
            {isExerciseActive && (
              <div className="absolute inset-0 bg-[oklch(0.85_0.08_175)]/20 backdrop-blur-[1px] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                  <Play className="w-8 h-8 text-[oklch(0.50_0.15_175)]" />
                </div>
              </div>
            )}
          </div>

          {/* Voice Control */}
          <button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors group"
            title={isVoiceEnabled ? "Voice guidance enabled - Click to disable" : "Enable voice guidance"}
          >
            {isVoiceEnabled ? (
              <>
                <Volume2 className="w-5 h-5 text-[oklch(0.50_0.15_175)] animate-pulse" />
                <span className="absolute -top-8 right-0 bg-[oklch(0.50_0.15_175)] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Voice ON
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-5 h-5 text-muted-foreground" />
                <span className="absolute -top-8 right-0 bg-muted text-muted-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Voice OFF
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions - Only for wellness bot */}
      {bot?.bot_id === "wellness" && quickActions.length > 0 && (
        <div className="w-full mt-6 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Relief
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((qa, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsExerciseActive(true)
                  onQuickAction?.(qa.action)
                  setTimeout(() => setIsExerciseActive(false), 120000) // 2 min timeout
                }}
                className="text-xs h-auto py-2 px-3 hover:bg-[oklch(0.85_0.08_175)] hover:text-[oklch(0.30_0.05_175)] hover:border-[oklch(0.70_0.10_175)] transition-all"
              >
                {qa.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

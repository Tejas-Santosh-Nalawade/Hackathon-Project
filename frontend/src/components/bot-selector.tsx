"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { Bot } from "@/lib/types"
import { Activity, Calendar, Shield, Rocket, Wallet, Dumbbell } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface BotSelectorProps {
  bots: Bot[]
  selectedBotId: string | null
  onSelectBot: (botId: string) => void
  isLoading?: boolean
}

const botIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wellness: Dumbbell,
  planner: Calendar,
  speakup: Shield,
  upskill: Rocket,
  finance: Wallet,
}

const botColors: Record<string, { bg: string; text: string; icon: string }> = {
  wellness: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: "text-amber-500",
  },
  planner: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: "text-blue-500",
  },
  speakup: {
    bg: "bg-sky-100",
    text: "text-sky-700",
    icon: "text-sky-500",
  },
  upskill: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    icon: "text-rose-500",
  },
  finance: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    icon: "text-orange-500",
  },
}

export function BotSelector({
  bots,
  selectedBotId,
  onSelectBot,
  isLoading,
}: BotSelectorProps) {
  const skeletonItems = Array.from({ length: 5 })

  return (
    <aside className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full flex-shrink-0">
      {/* Logo - Larger and More Prominent */}
      <div className="p-6 pb-6 border-b border-sidebar-border bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-[oklch(0.85_0.08_175)] to-[oklch(0.75_0.10_175)] p-1 shadow-xl ring-2 ring-primary/30">
            <div className="w-full h-full bg-white rounded-2xl p-1.5">
              <img
                src="/logo.jpg"
                alt="HerSpace Logo"
                width={80}
                height={80}
                className="object-cover rounded-xl w-full h-full"
              />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-primary tracking-tight block">HerSpace</span>
            <span className="text-sm text-muted-foreground font-semibold">Support Platform</span>
          </div>
        </div>
      </div>

      {/* Support Team Section - Larger Header */}
      <nav className="flex-1 px-5 py-6 overflow-y-auto">
        <p className="text-sm font-bold text-primary uppercase tracking-wide px-3 mb-5 letter-spacing-wider">
          MY SUPPORT TEAM
        </p>
        
        <div className="space-y-2">
          {isLoading
            ? skeletonItems.map((_, idx) => (
                <div
                  key={`bot-skeleton-${idx}`}
                  className="h-16 rounded-2xl bg-sidebar-accent/60 animate-pulse"
                />
              ))
            : bots.map((bot) => {
                const Icon = botIcons[bot.bot_id] || Activity
                const isSelected = selectedBotId === bot.bot_id
                const colors = botColors[bot.bot_id] || botColors.wellness

                return (
                  <button
                    key={bot.bot_id}
                    onClick={() => onSelectBot(bot.bot_id)}
                    disabled={isLoading}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all duration-300",
                      "hover:bg-sidebar-accent hover:opacity-100",
                      isSelected
                        ? "bg-sidebar-accent shadow-md ring-2 ring-primary/30"
                        : "bg-transparent opacity-70 hover:opacity-90",
                      bot.bot_id === "wellness" && !isSelected && "opacity-85", // Emphasize wellness
                      isLoading && "opacity-50 pointer-events-none"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                          colors.bg,
                          isSelected && "ring-2 ring-offset-2 ring-primary/40 shadow-sm",
                          bot.bot_id === "wellness" && "w-12 h-12" // Slightly larger for wellness
                        )}
                      >
                        <Icon className={cn("w-5 h-5", colors.icon)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-semibold text-base transition-colors mb-0.5",
                            isSelected ? "text-primary" : "text-sidebar-foreground",
                            bot.bot_id === "wellness" && !isSelected && "font-bold"
                          )}
                        >
                          {bot.title}
                        </h3>
                        {/* Description - Larger Font */}
                        <p
                          className={cn(
                            "text-sm text-muted-foreground line-clamp-1 transition-all leading-relaxed",
                            isSelected ? "opacity-100" : "opacity-80"
                          )}
                        >
                          {bot.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
        </div>
      </nav>

      {/* Today's Focus - Larger and More Prominent
      <div className="p-5 border-t border-sidebar-border flex-shrink-0">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 shadow-sm">
          <h4 className="text-base font-bold text-sidebar-foreground mb-3">
            Today's Focus
          </h4>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-primary">25</div>
            <div className="text-sm text-muted-foreground leading-snug">
              <p className="font-medium">minutes of</p>
              <p className="font-medium">self-care</p>
            </div>
          </div>
        </div>
      </div> */}
    </aside>
  )
}

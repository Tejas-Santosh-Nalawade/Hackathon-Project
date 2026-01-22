"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Bot, ChatMessage, SearchResult } from "@/lib/types"
import { Send, ExternalLink, Loader2, Mic, Volume2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatPanelProps {
  bot: Bot | null
  messages: ChatMessage[]
  searchResults: SearchResult[] | null
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm text-card-foreground group-hover:text-primary line-clamp-1">
          {result.title}
        </h4>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
        {result.snippet}
      </p>
    </a>
  )
}

export function ChatPanel({
  bot,
  messages,
  searchResults,
  onSendMessage,
  isLoading,
}: ChatPanelProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [messages])

  // Also ensure container scrolls to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  // Get the last assistant message for the avatar speech bubble
  const lastAssistantMessage = messages
    .filter((m) => m.role === "assistant")
    .pop()?.content

  // Default greeting based on bot
  const defaultGreeting = bot?.bot_id === "finance" 
    ? "Namaste, Priya. I'm PaisaWise. Let's look at your savings goals for this month."
    : bot?.bot_id === "wellness"
    ? "Hi! I'm FitHer, your desk wellness companion.\n\nI specialize in:\n• Sitting desk exercises (safe & easy)\n• Breathing techniques for stress\n• Neck, back, wrist & eye relief\n• Quick 1-7 minute wellness breaks\n\nAll exercises are designed to be done RIGHT AT YOUR DESK without standing up. No special equipment needed!\n\nWhat's bothering you today? Or would you like me to suggest a quick exercise?"
    : bot?.bot_id === "planner"
    ? "Let's organize your day! What are your top priorities right now?"
    : bot?.bot_id === "speakup"
    ? "I'm here whenever you need to talk. Everything shared here stays private and safe."
    : bot?.bot_id === "upskill"
    ? "Ready to level up your career? Tell me about your goals!"
    : "Select an assistant to start your wellness journey."

  const displayMessage = lastAssistantMessage || defaultGreeting

  // Placeholder text for input
  const placeholderText = bot?.bot_id === "finance"
    ? "Talk to finance..."
    : bot?.bot_id === "wellness"
    ? "Talk to wellness..."
    : bot?.bot_id === "planner"
    ? "Talk to planner..."
    : bot?.bot_id === "speakup"
    ? "Share your thoughts..."
    : bot?.bot_id === "upskill"
    ? "Ask about career..."
    : "Type a message..."

  return (
    <div className="relative bg-muted/30 rounded-3xl border border-border p-6 flex flex-col h-full">
      {/* Private Mode Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-3 text-muted-foreground z-10">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          <span className="text-xs">Private</span>
        </div>
      </div>
      {/* Chat Messages Area - Scrollable */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[300px] max-h-[500px] scroll-smooth"
      >
        {/* Show messages or default greeting */}
        {messages.length === 0 ? (
          <div className="flex">
            <div className="max-w-md bg-card rounded-2xl px-5 py-4 shadow-sm border border-border">
              <p className="text-sm text-card-foreground leading-relaxed">
                {defaultGreeting}
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.role}-${index}`}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex">
                  <div className="max-w-md bg-card rounded-2xl px-5 py-4 shadow-sm border border-border">
                    <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Search Results */}
              {message.role === "assistant" &&
                index === messages.length - 1 &&
                searchResults &&
                searchResults.length > 0 && (
                  <div className="mt-3 ml-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      Resources found
                    </p>
                    <div className="grid gap-2 max-w-md">
                      {searchResults.slice(0, 2).map((result, idx) => (
                        <SearchResultCard key={`${result.url}-${idx}`} result={result} />
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex">
            <div className="bg-card rounded-2xl px-5 py-4 shadow-sm border border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Always available for typing */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholderText}
            disabled={!bot || isLoading}
            className={cn(
              "w-full pl-5 pr-14 py-4 rounded-2xl",
              "bg-card border-2 border-border shadow-sm",
              "text-foreground placeholder:text-muted-foreground text-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          />
          <Button
            type="submit"
            disabled={!bot || !input.trim() || isLoading}
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

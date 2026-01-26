"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Bot, ChatMessage, SearchResult } from "@/lib/types"
import { Send, ExternalLink, Loader2, Mic, Volume2, Lock, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { analyticsTracker } from "@/lib/analytics-tracker"

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
      let message = input.trim()
      if (selectedFile) {
        message = `${message} [File attached: ${selectedFile.name}]`
      }
      
      // Track user activity
      const user = localStorage.getItem("user")
      const userData = user ? JSON.parse(user) : { name: "Guest", id: "guest" }
      
      analyticsTracker.trackActivity({
        userId: userData.id || "guest",
        userName: userData.name || "Guest",
        action: "message_sent",
        timestamp: new Date(),
        metadata: {
          botId: bot?.bot_id,
          botName: bot?.title,
          messageLength: message.length,
          hasAttachment: !!selectedFile,
        },
      })
      
      onSendMessage(message)
      setInput("")
      setSelectedFile(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Get the last assistant message for the avatar speech bubble
  const lastAssistantMessage = messages
    .filter((m) => m.role === "assistant")
    .pop()?.content

  // Default greeting based on bot
  const defaultGreeting = bot?.bot_id === "finance" 
    ? "Hi! I'm PaisaWise, your financial advisor. How can I help you with your finances today?"
    : bot?.bot_id === "wellness"
    ? "Hi! I'm FitHer, your wellness companion. Tell me what's bothering you - neck pain, stress, tired eyes, or anything else?"
    : bot?.bot_id === "planner"
    ? "Hello! I'm PlanPal. Tell me about your tasks and I'll help you organize your day."
    : bot?.bot_id === "speakup"
    ? "Hi, I'm SpeakUp. This is a safe space. Share anything you need support with."
    : bot?.bot_id === "upskill"
    ? "Hey! I'm GrowthGuru. Tell me about your career goals and I'll help you grow!"
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
    <div className="h-full relative bg-muted/30 rounded-3xl border-2 border-border shadow-lg flex flex-col overflow-hidden">
      {/* Private Mode Indicator - Moved to top-left */}
      <div className="absolute top-2 left-4 flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full text-muted-foreground z-10 backdrop-blur-sm">
        <Lock className="w-3 h-3" />
        <span className="text-[10px] font-medium uppercase tracking-wide">Private</span>
      </div>
      
      {/* Chat Messages Area - Scrollable with fixed height */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 pt-12 pb-4 space-y-4 scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#ec4899 #fce7f3' }}
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

      {/* Input Area - Fixed at bottom */}
      <div className="shrink-0 px-6 pb-6 pt-3 bg-linear-to-t from-background/95 to-transparent">
        <form onSubmit={handleSubmit}>
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-2 rounded-lg border border-border">
            <Paperclip className="w-3 h-3" />
            <span>{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="ml-auto text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
        )}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholderText}
            disabled={!bot || isLoading}
            className={cn(
              "w-full pl-5 pr-24 py-4 rounded-2xl",
              "bg-card border-2 border-border shadow-sm",
              "text-foreground placeholder:text-muted-foreground text-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!bot || isLoading}
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl hover:bg-accent hover:scale-110 active:scale-95 transition-all"
            >
              <Paperclip className="w-4 h-4" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button
              type="submit"
              disabled={!bot || !input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-xl hover:scale-110 active:scale-95 transition-transform shadow-md"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
        </form>
      </div>
    </div>
  )
}

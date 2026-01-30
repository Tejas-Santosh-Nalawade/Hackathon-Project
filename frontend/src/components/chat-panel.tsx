"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Bot, ChatMessage, SearchResult } from "@/lib/types"
import { Send, ExternalLink, Loader2, Mic, Volume2, Lock, Paperclip, Play, VolumeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { analyticsTracker } from "@/lib/analytics-tracker"
import { VoiceOutput } from "@/lib/voice-agent"
import { InteractiveVoiceGuide } from "@/components/interactive-voice-guide"
import { SpeakingAvatar, SpeakingIndicator } from "@/components/speaking-avatar"

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
  const [showGuide, setShowGuide] = useState<string | null>(null)
  const voiceOutputRef = useRef<VoiceOutput | null>(null)
  const lastSpokenMessageRef = useRef<string>("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const initialMessageCountRef = useRef<number>(0)
  const hasInitializedRef = useRef(false)

  // Initialize voice output
  useEffect(() => {
    if (!voiceOutputRef.current) {
      voiceOutputRef.current = new VoiceOutput()
      voiceOutputRef.current.onSpeakingChange((speaking) => {
        console.log("Speaking state changed:", speaking)
        setIsSpeaking(speaking)
      })
    }
  }, [])

  // Track initial message count to avoid speaking old messages
  useEffect(() => {
    if (!hasInitializedRef.current && messages.length > 0) {
      initialMessageCountRef.current = messages.length
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant" && bot?.bot_id) {
        // Mark existing messages as already "spoken" so they won't be read
        lastSpokenMessageRef.current = `${bot.bot_id}-${lastMessage.content}`
      }
      hasInitializedRef.current = true
    }
  }, [messages, bot?.bot_id])

  // Auto-speak only NEW bot messages (not existing ones)
  useEffect(() => {
    if (messages.length === 0 || !hasInitializedRef.current) return

    // Only speak if there are NEW messages beyond the initial count
    if (messages.length <= initialMessageCountRef.current) return

    const lastMessage = messages[messages.length - 1]
    
    // Only speak if it's a new bot message we haven't spoken yet
    if (
      lastMessage.role === "assistant" &&
      voiceOutputRef.current &&
      !isLoading &&
      !showGuide &&
      bot?.bot_id // Make sure we have a bot context
    ) {
      // Create a unique key for this message in this bot context
      const messageKey = `${bot.bot_id}-${lastMessage.content}`
      
      if (messageKey !== lastSpokenMessageRef.current) {
        lastSpokenMessageRef.current = messageKey
        
        voiceOutputRef.current.speak(lastMessage.content, 1.25).catch((error) => {
          console.error("Error auto-speaking message:", error)
        })
      }
    }
  }, [messages, isLoading, showGuide, bot?.bot_id])

  // Stop speech and reset when switching bots
  useEffect(() => {
    // Reset initialization when bot changes
    hasInitializedRef.current = false
    initialMessageCountRef.current = 0
    
    return () => {
      if (voiceOutputRef.current) {
        voiceOutputRef.current.stop()
      }
      lastSpokenMessageRef.current = ""
    }
  }, [bot?.bot_id])

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
      
      // Stop any ongoing speech when user sends new message
      if (voiceOutputRef.current) {
        voiceOutputRef.current.stop()
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

  const handleStartGuide = (type: string) => {
    // Stop any ongoing speech from chat
    if (voiceOutputRef.current) {
      voiceOutputRef.current.stop()
    }
    setShowGuide(type)
  }

  const handleGuideComplete = () => {
    setShowGuide(null)
    // Also stop any voice from the guide
    if (voiceOutputRef.current) {
      voiceOutputRef.current.stop()
    }
  }

  // Detect exercise type from message
  const detectExerciseType = (content: string) => {
    const text = content.toLowerCase()
    if (text.includes("box breathing") || text.includes("breathing")) {
      return "box-breathing"
    }
    if (text.includes("neck") || text.includes("shoulder")) {
      return "neck-relief"
    }
    if (text.includes("deep breath")) {
      return "deep-breathing"
    }
    return null
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
    <div className="h-full relative bg-muted/30 rounded-2xl md:rounded-3xl border-2 border-border shadow-lg flex flex-col overflow-hidden">
      {/* Show Interactive Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full mx-4">
            <InteractiveVoiceGuide
              exerciseType={showGuide as any}
              onComplete={handleGuideComplete}
              onCancel={handleGuideComplete}
            />
          </div>
        </div>
      )}
      
      {/* Private Mode Indicator - Moved to top-left */}
      <div className="absolute top-1 left-2 md:top-2 md:left-4 flex items-center gap-1 md:gap-1.5 bg-muted/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-muted-foreground z-10 backdrop-blur-sm">
        <Lock className="w-2.5 h-2.5 md:w-3 md:h-3" />
        <span className="text-[8px] md:text-[10px] font-medium uppercase tracking-wide">Private</span>
      </div>
      
      {/* Debug: Speaking State Indicator */}
      {isSpeaking && (
        <div className="absolute top-1 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full z-50">
          🎤 Speaking
        </div>
      )}
      
      {/* Chat Messages Area - Scrollable with fixed height */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-2 md:px-4 lg:px-6 pt-8 md:pt-12 pb-2 md:pb-4 space-y-2 md:space-y-4 scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#ec4899 #fce7f3' }}
      >
        {/* Show messages or default greeting */}
        {messages.length === 0 ? (
          <div className="flex">
            <div className="max-w-md bg-card rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-4 shadow-sm border border-border">
              <p className="text-xs md:text-sm text-card-foreground leading-relaxed">
                {defaultGreeting}
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.role}-${index}`}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] md:max-w-[70%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 md:px-5 md:py-3">
                    <p className="text-xs md:text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 items-start">
                  <div className="max-w-[90%] md:max-w-md">
                    <div className="bg-card rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-4 shadow-sm border border-border">
                      <p className="text-xs md:text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    
                    {/* Interactive Session Button */}
                    {(() => {
                      const exerciseType = detectExerciseType(message.content)
                      if (exerciseType) {
                        return (
                          <button
                            onClick={() => handleStartGuide(exerciseType)}
                            className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 shadow-sm"
                            title="Start interactive guided session"
                          >
                            <Play className="w-3 h-3" />
                            <span>Start Interactive Session</span>
                          </button>
                        )
                      }
                      return null
                    })()}
                  </div>
                  
                  {/* Speaking Avatar next to message - More Visible */}
                  {index === messages.length - 1 && isSpeaking && (
                    <div className="shrink-0 ml-3 relative" style={{ minWidth: '60px' }}>
                      <div className="absolute -inset-2 rounded-full border-4 border-purple-500 animate-ping opacity-75" style={{ animationDuration: '1.5s' }} />
                      <div className="relative z-10">
                        <SpeakingAvatar isSpeaking={true} size="sm" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Search Results */}
              {message.role === "assistant" &&
                index === messages.length - 1 &&
                searchResults &&
                searchResults.length > 0 && (
                  <div className="mt-2 md:mt-3 ml-1 md:ml-2">
                    <p className="text-[10px] md:text-xs font-medium text-muted-foreground mb-1 md:mb-2 uppercase tracking-wider">
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
            <div className="bg-card rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-4 shadow-sm border border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                <span className="text-xs md:text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="shrink-0 px-2 md:px-4 lg:px-6 pb-2 md:pb-4 lg:pb-6 pt-2 md:pt-3 bg-linear-to-t from-background/95 to-transparent">
        <form onSubmit={handleSubmit}>
        {selectedFile && (
          <div className="mb-1 md:mb-2 flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-muted-foreground bg-card px-2 md:px-3 py-1 md:py-2 rounded-lg border border-border">
            <Paperclip className="w-2.5 h-2.5 md:w-3 md:h-3" />
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
              "w-full pl-3 md:pl-5 pr-16 md:pr-24 py-2.5 md:py-4 rounded-xl md:rounded-2xl",
              "bg-card border-2 border-border shadow-sm",
              "text-foreground placeholder:text-muted-foreground text-xs md:text-sm",
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
          <div className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 flex gap-0.5 md:gap-1">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!bot || isLoading}
              size="icon"
              variant="ghost"
              className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl hover:bg-accent hover:scale-110 active:scale-95 transition-all"
            >
              <Paperclip className="w-3 h-3 md:w-4 md:h-4" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button
              type="submit"
              disabled={!bot || !input.trim() || isLoading}
              size="icon"
              className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl hover:scale-110 active:scale-95 transition-transform shadow-md"
            >
              <Send className="w-3 h-3 md:w-4 md:h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
        </form>
      </div>
    </div>
  )
}

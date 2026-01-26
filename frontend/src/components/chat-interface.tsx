"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Bot, ChatMessage, SearchResult } from "@/lib/types"
import { Send, Trash2, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInterfaceProps {
  bot: Bot | null
  messages: ChatMessage[]
  searchResults: SearchResult[] | null
  onSendMessage: (message: string) => void
  onClearChat: () => void
  isLoading?: boolean
}

function MessageBubble({
  message,
  isUser,
  botTitle,
}: {
  message: ChatMessage
  isUser: boolean
  botTitle?: string
}) {
  return (
    <div
      className={cn(
        "flex gap-3 max-w-3xl",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? "U" : botTitle?.charAt(0) || "A"}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border text-card-foreground rounded-tl-sm"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm text-card-foreground group-hover:text-primary line-clamp-1">
          {result.title}
        </h4>
        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
        {result.snippet}
      </p>
    </a>
  )
}

function SearchResultsSection({ results }: { results: SearchResult[] }) {
  if (!results || results.length === 0) return null

  return (
    <div className="max-w-3xl ml-11 mt-3">
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
        Resources found for you
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {results.map((result, index) => (
          <SearchResultCard key={`${result.url}-${index}`} result={result} />
        ))}
      </div>
    </div>
  )
}

function WelcomeScreen({ bot }: { bot: Bot | null }) {
  if (!bot) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">S</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Welcome to SheThrive
          </h2>
          <p className="text-muted-foreground">
            Select an assistant from the sidebar to start a conversation. Each assistant
            specializes in different areas to support your well-being and growth.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{bot.title.charAt(0)}</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Chat with {bot.title}
        </h2>
        <p className="text-muted-foreground">{bot.description}</p>
        <p className="text-sm text-muted-foreground mt-4">
          Type a message below to start the conversation.
        </p>
      </div>
    </div>
  )
}

export function ChatInterface({
  bot,
  messages,
  searchResults,
  onSendMessage,
  onClearChat,
  isLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [bot])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
        <div>
          {bot ? (
            <>
              <h2 className="font-semibold text-foreground">{bot.title}</h2>
              <p className="text-sm text-muted-foreground">{bot.description}</p>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-foreground">SheThrive</h2>
              <p className="text-sm text-muted-foreground">
                Select an assistant to begin
              </p>
            </>
          )}
        </div>
        {bot && messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        )}
      </header>

      {/* Messages */}
      {messages.length === 0 ? (
        <WelcomeScreen bot={bot} />
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`}>
              <MessageBubble
                message={message}
                isUser={message.role === "user"}
                botTitle={bot?.title}
              />
              {/* Show search results after the last assistant message */}
              {message.role === "assistant" &&
                index === messages.length - 1 &&
                searchResults && <SearchResultsSection results={searchResults} />}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <span className="text-sm font-medium">
                  {bot?.title.charAt(0) || "A"}
                </span>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                bot
                  ? `Message ${bot.title}...`
                  : "Select an assistant to start chatting"
              }
              disabled={!bot || isLoading}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg bg-input border border-border",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            <Button
              type="submit"
              disabled={!bot || !input.trim() || isLoading}
              className="px-4"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {bot?.bot_id === "upskill"
              ? "Ask about courses, careers, or skills to get search results"
              : "Your conversations are stored locally on this device"}
          </p>
        </form>
      </div>
    </div>
  )
}

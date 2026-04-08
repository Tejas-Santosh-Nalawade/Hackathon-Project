import React from "react"
import { Plus, MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ChatSession } from "@/lib/api"

interface ChatHistorySidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: string) => void
}

export function ChatHistorySidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: ChatHistorySidebarProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const today = new Date()
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
    
    // Yesterday
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()

    if (isToday) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } else if (isYesterday) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  return (
    <div className="flex flex-col h-full bg-background/50 border-t pt-4">
      <div className="px-4 mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground/80">Previous Sessions</h3>
        <Button 
          onClick={onNewSession} 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground italic">
            No previous conversations. Start a new one!
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                currentSessionId === session.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-foreground/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-2">
                <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0 w-full">
                  <span className="text-sm truncate w-full">{session.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(session.updatedAt)}
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteSession(session.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

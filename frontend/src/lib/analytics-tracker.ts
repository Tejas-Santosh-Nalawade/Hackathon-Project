// Analytics tracking utilities

export interface ConversationEvent {
  userId: string
  userName: string
  botId: string
  botName: string
  timestamp: Date
  messageCount: number
  duration: number
  topic: string
  sentiment: "positive" | "neutral" | "negative" | "concerned"
}

export interface PageViewEvent {
  userId: string
  page: string
  timestamp: Date
  duration: number
}

export interface UserActivityEvent {
  userId: string
  userName: string
  action: string
  timestamp: Date
  metadata?: Record<string, any>
}

class AnalyticsTracker {
  private conversations: ConversationEvent[] = []
  private pageViews: PageViewEvent[] = []
  private activities: UserActivityEvent[] = []

  // Track conversation
  trackConversation(event: ConversationEvent) {
    this.conversations.push(event)
    this.saveToLocalStorage()
    console.log("📊 Conversation tracked:", event)
  }

  // Track page view
  trackPageView(event: PageViewEvent) {
    this.pageViews.push(event)
    this.saveToLocalStorage()
    console.log("📊 Page view tracked:", event)
  }

  // Track user activity
  trackActivity(event: UserActivityEvent) {
    this.activities.push(event)
    this.saveToLocalStorage()
    console.log("📊 Activity tracked:", event)
  }

  // Get all conversations
  getConversations(limit?: number): ConversationEvent[] {
    const sorted = [...this.conversations].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
    return limit ? sorted.slice(0, limit) : sorted
  }

  // Get conversations for a specific user
  getUserConversations(userId: string): ConversationEvent[] {
    return this.conversations.filter((c) => c.userId === userId)
  }

  // Get conversations for a specific bot
  getBotConversations(botId: string): ConversationEvent[] {
    return this.conversations.filter((c) => c.botId === botId)
  }

  // Get page views
  getPageViews(limit?: number): PageViewEvent[] {
    const sorted = [...this.pageViews].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
    return limit ? sorted.slice(0, limit) : sorted
  }

  // Get user activities
  getUserActivities(userId?: string, limit?: number): UserActivityEvent[] {
    let activities = userId
      ? this.activities.filter((a) => a.userId === userId)
      : this.activities

    const sorted = [...activities].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
    return limit ? sorted.slice(0, limit) : sorted
  }

  // Get analytics summary
  getSummary() {
    return {
      totalConversations: this.conversations.length,
      totalPageViews: this.pageViews.length,
      totalActivities: this.activities.length,
      uniqueUsers: new Set(this.conversations.map((c) => c.userId)).size,
      avgConversationDuration:
        this.conversations.reduce((sum, c) => sum + c.duration, 0) /
        this.conversations.length || 0,
      avgMessagesPerConversation:
        this.conversations.reduce((sum, c) => sum + c.messageCount, 0) /
        this.conversations.length || 0,
    }
  }

  // Get bot usage statistics
  getBotStats() {
    const botMap = new Map<string, { name: string; sessions: number; users: Set<string> }>()

    this.conversations.forEach((conv) => {
      if (!botMap.has(conv.botId)) {
        botMap.set(conv.botId, {
          name: conv.botName,
          sessions: 0,
          users: new Set(),
        })
      }
      const bot = botMap.get(conv.botId)!
      bot.sessions++
      bot.users.add(conv.userId)
    })

    return Array.from(botMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      sessions: data.sessions,
      uniqueUsers: data.users.size,
    }))
  }

  // Save to localStorage
  private saveToLocalStorage() {
    try {
      localStorage.setItem(
        "herspace_analytics",
        JSON.stringify({
          conversations: this.conversations,
          pageViews: this.pageViews,
          activities: this.activities,
        })
      )
    } catch (error) {
      console.error("Failed to save analytics to localStorage:", error)
    }
  }

  // Load from localStorage
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem("herspace_analytics")
      if (data) {
        const parsed = JSON.parse(data)
        this.conversations = parsed.conversations.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
        }))
        this.pageViews = parsed.pageViews.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp),
        }))
        this.activities = parsed.activities.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        }))
      }
    } catch (error) {
      console.error("Failed to load analytics from localStorage:", error)
    }
  }

  // Clear all data
  clearAll() {
    this.conversations = []
    this.pageViews = []
    this.activities = []
    localStorage.removeItem("herspace_analytics")
  }
}

// Export singleton instance
export const analyticsTracker = new AnalyticsTracker()

// Load existing data on initialization
if (typeof window !== "undefined") {
  analyticsTracker.loadFromLocalStorage()
}

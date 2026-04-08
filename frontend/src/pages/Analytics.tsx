import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Activity,
  Calendar,
  ArrowLeft,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Clock,
  Bot,
  Inbox,
} from "lucide-react"
import {
  getChatSessions,
  getUserProfile,
  logout,
  type ChatSession,
} from "@/lib/api"

// ─── Bot metadata ────────────────────────────────────────────────────────────
const BOT_IDS = ["wellness", "planner", "speakup", "upskill", "finance"]

const BOT_META: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  wellness: { label: "FitHer",      emoji: "💪", color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  planner:  { label: "PlanPal",     emoji: "📅", color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  speakup:  { label: "SpeakUp",     emoji: "🛡️", color: "text-sky-600",    bg: "bg-sky-50 border-sky-200" },
  upskill:  { label: "GrowthGuru",  emoji: "🚀", color: "text-rose-600",   bg: "bg-rose-50 border-rose-200" },
  finance:  { label: "PaisaWise",   emoji: "💰", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAllSessions(): ChatSession[] {
  return BOT_IDS.flatMap((id) => getChatSessions(id))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = diffMs / 3_600_000
  if (diffH < 1) return `${Math.round(diffH * 60)} min ago`
  if (diffH < 24) return `${Math.round(diffH)}h ago`
  if (diffH < 48) return "Yesterday"
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function filterByRange(sessions: ChatSession[], range: string): ChatSession[] {
  const now = Date.now()
  const ms: Record<string, number> = {
    "24h": 86_400_000,
    "7d":  7 * 86_400_000,
    "30d": 30 * 86_400_000,
    "90d": 90 * 86_400_000,
  }
  const cutoff = now - (ms[range] ?? ms["7d"])
  return sessions.filter((s) => new Date(s.updatedAt).getTime() >= cutoff)
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d")
  const navigate = useNavigate()

  const userProfile = getUserProfile()
  const userName = userProfile?.name || "User"
  const userEmail = userProfile?.email || ""
  const userInitials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const handleLogout = async () => {
    await logout()
    navigate("/auth")
  }

  // ── Derive all analytics from real localStorage sessions ──────────────────
  const allSessions = useMemo(() => getAllSessions(), [])
  const filtered = useMemo(() => filterByRange(allSessions, timeRange), [allSessions, timeRange])

  const totalMessages = filtered.reduce((sum, s) => sum + s.messages.length, 0)
  const totalSessions = filtered.length

  // Per-bot breakdown
  const botStats = useMemo(() => {
    return BOT_IDS.map((id) => {
      const sessions = filtered.filter((s) => s.botId === id)
      const msgs = sessions.reduce((sum, s) => sum + s.messages.length, 0)
      return { id, sessions: sessions.length, messages: msgs, ...BOT_META[id] }
    }).sort((a, b) => b.sessions - a.sessions)
  }, [filtered])

  const maxSessions = Math.max(...botStats.map((b) => b.sessions), 1)

  // Most used bot
  const topBot = botStats[0]

  // Avg messages per session
  const avgMsgs = totalSessions > 0 ? (totalMessages / totalSessions).toFixed(1) : "0"

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 border-b bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-9 w-9"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <span className="text-lg font-bold text-foreground">Analytics</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Bell className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[oklch(0.85_0.08_175)] text-[oklch(0.35_0.05_175)] text-sm font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-foreground pr-1">
                  {userName.split(" ")[0]}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm">{userName}</span>
                  <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/analytics")}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl space-y-6">

        {/* ── Time range selector ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: "24h", label: "Today" },
            { key: "7d",  label: "This Week" },
            { key: "30d", label: "This Month" },
            { key: "90d", label: "Last 90 Days" },
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={timeRange === key ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* ── Key metric cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-white">
            <MessageSquare className="w-6 h-6 text-teal-600 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalSessions}</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">Chat Sessions</div>
          </Card>

          <Card className="p-4 sm:p-5 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
            <Activity className="w-6 h-6 text-blue-600 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalMessages}</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">Total Messages</div>
          </Card>

          <Card className="p-4 sm:p-5 border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <Bot className="w-6 h-6 text-purple-600 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {topBot?.sessions > 0 ? topBot.emoji : "—"}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {topBot?.sessions > 0 ? `Top: ${topBot.label}` : "No sessions yet"}
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white">
            <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{avgMsgs}</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">Avg Msgs / Session</div>
          </Card>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions">
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="agents">
              <Bot className="w-4 h-4 mr-1.5" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="messages">
              <Inbox className="w-4 h-4 mr-1.5" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* ── Sessions tab ── */}
          <TabsContent value="sessions" className="space-y-3">
            {filtered.length === 0 ? (
              <EmptyState label="No sessions in this time range" />
            ) : (
              filtered.map((session) => {
                const meta = BOT_META[session.botId] ?? BOT_META.wellness
                const msgCount = session.messages.length
                const userMsgs = session.messages.filter((m) => m.role === "user").length
                const firstMsg = session.messages.find((m) => m.role === "user")?.content ?? ""
                return (
                  <Card
                    key={session.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl mt-0.5 shrink-0">{meta.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{session.title}</div>
                          {firstMsg && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              "{firstMsg.slice(0, 80)}{firstMsg.length > 80 ? "…" : ""}"
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <Badge variant="outline" className={`text-xs border ${meta.bg} ${meta.color}`}>
                              {meta.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {msgCount} messages
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {userMsgs} from you
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fmtDate(session.updatedAt)}
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* ── Agents tab ── */}
          <TabsContent value="agents" className="space-y-3">
            {botStats.every((b) => b.sessions === 0) ? (
              <EmptyState label="No agent usage yet — start chatting!" />
            ) : (
              botStats.map((bot) => (
                <Card key={bot.id} className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{bot.emoji}</span>
                      <div>
                        <div className="font-semibold">{bot.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {bot.messages} messages across {bot.sessions} session{bot.sessions !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${bot.bg} ${bot.color} border`}>
                      {bot.sessions} session{bot.sessions !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  {/* Usage bar */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(bot.sessions / maxSessions) * 100}%` }}
                    />
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ── Messages tab ── */}
          <TabsContent value="messages" className="space-y-3">
            {filtered.length === 0 ? (
              <EmptyState label="No messages in this time range" />
            ) : (
              filtered.flatMap((session) => {
                const meta = BOT_META[session.botId] ?? BOT_META.wellness
                return session.messages.map((msg, idx) => (
                  <Card
                    key={`${session.id}-${idx}`}
                    className={`p-3 sm:p-4 border-l-4 ${
                      msg.role === "user"
                        ? "border-l-teal-400 bg-teal-50/40"
                        : "border-l-purple-400 bg-purple-50/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-base shrink-0">
                          {msg.role === "user" ? "🧑" : meta.emoji}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">
                            {msg.role === "user" ? userName : meta.label}
                          </div>
                          <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                            {msg.content.slice(0, 300)}
                            {msg.content.length > 300 ? "…" : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fmtDate(session.updatedAt)}
                      </div>
                    </div>
                  </Card>
                ))
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <Card className="p-10 flex flex-col items-center justify-center text-center gap-3">
      <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
      <p className="text-muted-foreground text-sm">{label}</p>
    </Card>
  )
}

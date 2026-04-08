import { useState, useEffect } from "react"
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
  Calendar,
  Clock,
  Heart,
  BookOpen,
  DollarSign,
  Bell,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Baby,
  Users,
  Pill,
  Video,
  GraduationCap,
  Sparkles,
  BarChart3,
  Menu,
  User,
  Settings,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Dumbbell,
  Wallet,
  Rocket,
} from "lucide-react"
import { getUserProfile, logout, fetchDashboard, type DashboardData } from "@/lib/api"
import { AgentTabs } from "./agent-tabs"

// Mock data - would come from user profile and APIs
const upcomingEvents = [
  {
    id: 1,
    type: "meeting",
    title: "Team Standup",
    time: "10:00 AM - 10:30 AM",
    date: "Today",
    icon: Video,
    color: "blue",
  },
  {
    id: 2,
    type: "family",
    title: "Mom's Doctor Appointment",
    time: "2:00 PM",
    date: "Today",
    icon: Heart,
    color: "pink",
  },
  {
    id: 3,
    type: "course",
    title: "Excel Advanced Course - Module 3",
    time: "6:00 PM - 7:00 PM",
    date: "Today",
    icon: GraduationCap,
    color: "purple",
  },
  {
    id: 4,
    type: "family",
    title: "Pick up kids from school",
    time: "3:30 PM",
    date: "Today",
    icon: Baby,
    color: "orange",
  },
]

const familyAlerts = [
  {
    id: 1,
    priority: "high",
    title: "Mother's medication due",
    description: "Blood pressure medicine - 2:00 PM",
    time: "In 2 hours",
    icon: Pill,
    action: "Mark as Done",
  },
  {
    id: 2,
    priority: "medium",
    title: "Baby monitor alert",
    description: "Baby woke up from nap - 1:45 PM",
    time: "15 mins ago",
    icon: Baby,
    action: "Acknowledge",
  },
  {
    id: 3,
    priority: "low",
    title: "Family calendar reminder",
    description: "Kids' parent-teacher meeting tomorrow at 4 PM",
    time: "Tomorrow",
    icon: Calendar,
    action: "Set Reminder",
  },
]

const courseRecommendations = [
  {
    id: 1,
    title: "Data Analysis with Python",
    provider: "Coursera",
    duration: "6 weeks",
    level: "Intermediate",
    rating: 4.8,
    enrolled: "45,000+",
    matchScore: 95,
    skills: ["Python", "Data Analysis", "Pandas"],
    thumbnail: "🐍",
  },
  {
    id: 2,
    title: "Leadership Skills for Women",
    provider: "Udemy",
    duration: "4 weeks",
    level: "Beginner",
    rating: 4.7,
    enrolled: "32,000+",
    matchScore: 92,
    skills: ["Leadership", "Management", "Communication"],
    thumbnail: "👩‍💼",
  },
  {
    id: 3,
    title: "Financial Planning Essentials",
    provider: "LinkedIn Learning",
    duration: "3 weeks",
    level: "Beginner",
    rating: 4.6,
    enrolled: "28,000+",
    matchScore: 88,
    skills: ["Finance", "Budgeting", "Investment"],
    thumbnail: "💰",
  },
]

const financialInsights = {
  monthlyBudget: {
    total: 80000,
    spent: 52000,
    remaining: 28000,
  },
  savingsGoal: {
    target: 200000,
    current: 145000,
    progress: 72.5,
    goalName: "New Scooter by Sep 2026",
  },
  recommendations: [
    {
      title: "Tax Savings Opportunity",
      description: "Invest ₹50,000 in ELSS to save ₹15,000 in taxes under 80C",
      potential: "₹15,000",
    },
    {
      title: "Child Education Fund",
      description: "Start SIP of ₹5,000/month for your child's future education",
      potential: "₹18 lakhs",
    },
  ],
}

const todaySchedule = [
  { time: "08:00 AM", activity: "Morning routine & breakfast", done: true },
  { time: "09:00 AM", activity: "Drop kids to school", done: true },
  { time: "10:00 AM", activity: "Team standup meeting", done: false },
  { time: "11:30 AM", activity: "Project work - Deep focus", done: false },
  { time: "01:00 PM", activity: "Lunch break & wellness exercise", done: false },
  { time: "02:00 PM", activity: "Mom's medication reminder", done: false },
  { time: "03:30 PM", activity: "Pick up kids from school", done: false },
  { time: "04:30 PM", activity: "Help with homework", done: false },
  { time: "06:00 PM", activity: "Excel course - Module 3", done: false },
  { time: "07:30 PM", activity: "Family dinner time", done: false },
  { time: "09:00 PM", activity: "Personal time & relaxation", done: false },
]

interface PersonalizedDashboardProps {
  botId?: string
  onBotChange?: (botId: string) => void
  standalone?: boolean
}

export function PersonalizedDashboard({ botId = "wellness", onBotChange, standalone = false }: PersonalizedDashboardProps) {
  const navigate = useNavigate()
  // Local active agent — clicking a card updates this WITHOUT navigating away
  const [activeBot, setActiveBot] = useState<string>(botId)
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([])
  const [markedTasks, setMarkedTasks] = useState<number[]>([])
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loadingDash, setLoadingDash] = useState(true)

  // Sync if parent changes botId
  useEffect(() => { setActiveBot(botId) }, [botId])

  const userProfile = getUserProfile()
  const userName = userProfile?.name || "User"
  const userEmail = userProfile?.email || ""
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  useEffect(() => {
    fetchDashboard()
      .then(setDashboard)
      .catch(() => setDashboard({
        wellness: { score: 70, status: "Doing okay", trend: "stable", agent: "FitHer" },
        planner:  { tasks_done: 0, tasks_total: 11, progress: 0, status: "Let's plan", agent: "PlanPal" },
        finance:  { savings_goal: 50, status: "Let's start", agent: "PaisaWise" },
        safety:   { alerts: 0, priority: "low", status: "All clear", agent: "SpeakUp" },
        career:   { growth_score: 50, status: "Ready to start", agent: "GrowthGuru" },
        generated_at: new Date().toISOString(),
      }))
      .finally(() => setLoadingDash(false))
  }, [])

  const handleLogout = async () => { await logout(); navigate("/auth") }
  // Clicking an agent card just switches the view — no navigation
  const handleBotClick = (id: string) => {
    setActiveBot(id)
    onBotChange?.(id)
  }
  // "Chat with X" button actually opens the chat
  const handleStartBot = () => navigate("/", { state: { botId: activeBot } })

  const handleEnrollCourse = (courseId: number) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses([...enrolledCourses, courseId])
      alert(`✅ Successfully enrolled in course! Check your email for next steps.`)
    }
  }
  const handleLearnMore = (title: string) => {
    alert(`📚 ${title}\n\nThis feature will open a detailed view with:\n✓ Complete course curriculum\n✓ Instructor profile\n✓ Student reviews\n✓ Pricing options\n✓ Certification details\n\nComing soon!`)
  }
  const handleMarkDone = (taskIdx: number) => {
    if (!markedTasks.includes(taskIdx)) setMarkedTasks([...markedTasks, taskIdx])
  }

  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const agents = [
    {
      id: "wellness", name: "FitHer", emoji: "💪", desc: "Wellness & fitness",
      color: "text-amber-600", border: "border-amber-300", bg: "bg-amber-50",
      score: dashboard ? `${dashboard.wellness.score}/100` : "—",
      status: dashboard?.wellness.status ?? "…",
      badge: dashboard?.wellness.trend === "improving" ? "📈 Improving" : dashboard?.wellness.trend === "needs_attention" ? "⚠️ Needs care" : "➡️ Stable",
      cta: "Chat with FitHer",
    },
    {
      id: "planner", name: "PlanPal", emoji: "📅", desc: "Master your time",
      color: "text-blue-600", border: "border-blue-300", bg: "bg-blue-50",
      score: dashboard ? `${dashboard.planner.tasks_done}/${dashboard.planner.tasks_total} tasks` : "—",
      status: dashboard?.planner.status ?? "…",
      badge: dashboard && dashboard.planner.progress >= 80 ? "🎯 Almost done" : dashboard && dashboard.planner.progress >= 50 ? "💪 Good progress" : "📋 Let's plan",
      cta: "Chat with PlanPal",
    },
    {
      id: "speakup", name: "SpeakUp", emoji: "🛡️", desc: "Harassment & safety",
      color: "text-sky-600", border: "border-sky-300", bg: "bg-sky-50",
      score: dashboard ? (dashboard.safety.alerts > 0 ? `${dashboard.safety.alerts} alert${dashboard.safety.alerts > 1 ? "s" : ""}` : "All clear") : "—",
      status: dashboard?.safety.status ?? "…",
      badge: dashboard?.safety.priority === "high" ? "🔴 High priority" : dashboard?.safety.priority === "medium" ? "🟡 Monitoring" : "🟢 All clear",
      cta: "Talk to SpeakUp",
    },
    {
      id: "upskill", name: "GrowthGuru", emoji: "🚀", desc: "Career coach",
      color: "text-rose-600", border: "border-rose-300", bg: "bg-rose-50",
      score: dashboard ? `${dashboard.career.growth_score}/100` : "—",
      status: dashboard?.career.status ?? "…",
      badge: dashboard && dashboard.career.growth_score >= 80 ? "🚀 Actively growing" : dashboard && dashboard.career.growth_score >= 60 ? "📈 On the path" : "🌱 Ready to start",
      cta: "Chat with GrowthGuru",
    },
    {
      id: "finance", name: "PaisaWise", emoji: "💰", desc: "Finance helper",
      color: "text-orange-600", border: "border-orange-300", bg: "bg-orange-50",
      score: dashboard ? `${dashboard.finance.savings_goal}%` : "—",
      status: dashboard?.finance.status ?? "…",
      badge: dashboard && dashboard.finance.savings_goal >= 75 ? "✅ On track" : dashboard && dashboard.finance.savings_goal >= 50 ? "📊 Making progress" : "💡 Let's plan",
      cta: "Chat with PaisaWise",
    },
  ]

  const activeAgent = agents.find((a) => a.id === activeBot) ?? agents[0]

  const quickStats = [
    {
      label: "Wellness Score", botId: "wellness",
      value: loadingDash ? "…" : `${dashboard?.wellness.score ?? 70}%`,
      sub: dashboard?.wellness.status ?? "Doing okay", subColor: "text-green-600",
      icon: <Heart className="w-7 h-7 text-pink-600" />,
      iconBg: "from-pink-200 to-rose-200", border: "border-pink-200",
      card: "from-pink-50 via-rose-50 to-white", valueColor: "text-pink-600",
    },
    {
      label: "Tasks Today", botId: "planner",
      value: loadingDash ? "…" : `${dashboard?.planner.tasks_done ?? 0}/${dashboard?.planner.tasks_total ?? 11}`,
      sub: dashboard?.planner.status ?? "Let's plan", subColor: "text-blue-600",
      icon: <CheckCircle2 className="w-7 h-7 text-purple-600" />,
      iconBg: "from-purple-200 to-blue-200", border: "border-purple-200",
      card: "from-purple-50 to-white", valueColor: "text-purple-600",
    },
    {
      label: "Savings Goal", botId: "finance",
      value: loadingDash ? "…" : `${dashboard?.finance.savings_goal ?? 50}%`,
      sub: dashboard?.finance.status ?? "Let's start", subColor: "text-green-600",
      icon: <TrendingUp className="w-7 h-7 text-rose-600" />,
      iconBg: "from-rose-200 to-orange-200", border: "border-rose-200",
      card: "from-rose-50 via-pink-50 to-white", valueColor: "text-rose-600",
    },
    {
      label: "Career Growth", botId: "upskill",
      value: loadingDash ? "…" : `${dashboard?.career.growth_score ?? 50}/100`,
      sub: dashboard?.career.status ?? "Ready to start", subColor: "text-orange-600",
      icon: <Rocket className="w-7 h-7 text-orange-600" />,
      iconBg: "from-orange-200 to-amber-200", border: "border-orange-200",
      card: "from-orange-50 to-white", valueColor: "text-orange-600",
    },
  ]

  return (
    <div className="h-full overflow-y-auto">
      {standalone && (
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b bg-white/90 backdrop-blur-sm">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 focus:outline-none"
            aria-label="Back to chat"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
            <span className="text-base font-bold text-primary">HerSpace</span>
          </button>

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
                  <span>Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}

      <div className="p-4 sm:p-6 space-y-5">

      {/* ── Agent Selector — all 5 with live scores ── */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-3 md:p-4 border-2 border-purple-200 shadow-md">
        <h2 className="text-xs md:text-sm font-semibold text-purple-900 mb-3">MY SUPPORT TEAM</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
          {agents.map((agent) => {
            const isActive = activeBot === agent.id
            return (
              <button
                key={agent.id}
                onClick={() => handleBotClick(agent.id)}
                className={`p-2 md:p-3 rounded-xl text-left transition-all duration-200 group relative ${
                  isActive
                    ? `${agent.bg} border-2 ${agent.border} shadow-lg scale-105`
                    : "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md"
                }`}
              >
                <div className="text-xl md:text-2xl mb-1">{agent.emoji}</div>
                <p className={`font-semibold text-xs md:text-sm ${isActive ? agent.color : "text-gray-900"}`}>
                  {agent.name}
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1 mb-1">{agent.desc}</p>
                <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block ${
                  isActive ? `${agent.color} ${agent.bg}` : "text-gray-500 bg-gray-100"
                }`}>
                  {loadingDash ? "…" : agent.score}
                </div>
                <div className={`mt-1 flex items-center gap-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity ${agent.color}`}>
                  <MessageSquare className="w-2.5 h-2.5" />
                  Chat now
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Welcome Banner — dynamic per active agent ── */}
      <div className={`flex flex-col md:flex-row items-start justify-between p-4 md:p-6 rounded-2xl border-2 shadow-lg gap-4 transition-all duration-300 ${
        activeBot === "wellness" ? "bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-amber-200" :
        activeBot === "planner"  ? "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200" :
        activeBot === "speakup"  ? "bg-gradient-to-r from-sky-50 via-cyan-50 to-teal-50 border-sky-200" :
        activeBot === "upskill"  ? "bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-50 border-rose-200" :
        "bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-orange-200"
      }`}>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 bg-clip-text text-transparent mb-1">
            {timeGreeting}, {userName}! {activeAgent.emoji}
          </h1>
          <p className="text-sm md:text-base text-gray-700 mb-1">
            {!loadingDash && dashboard ? (
              <>
                {activeBot === "wellness" && <><span className="font-semibold text-pink-600">{dashboard.wellness.score}/100</span> wellness score · <span className="font-semibold text-rose-600">{dashboard.wellness.status}</span></>}
                {activeBot === "planner" && <><span className="font-semibold text-blue-600">{dashboard.planner.tasks_done}/{dashboard.planner.tasks_total} tasks</span> done today · <span className="font-semibold text-purple-600">{dashboard.planner.status}</span></>}
                {activeBot === "speakup" && <>Safety: <span className="font-semibold text-sky-600">{dashboard.safety.status}</span> · Your conversations are <span className="font-semibold text-green-600">private & secure</span></>}
                {activeBot === "upskill" && <>Career growth: <span className="font-semibold text-rose-600">{dashboard.career.growth_score}/100</span> · <span className="font-semibold text-purple-600">{dashboard.career.status}</span></>}
                {activeBot === "finance" && <>Savings goal: <span className="font-semibold text-green-600">{dashboard.finance.savings_goal}% complete</span> · <span className="font-semibold text-orange-600">{dashboard.finance.status}</span></>}
              </>
            ) : (
              <span className="text-gray-400">Loading your data…</span>
            )}
          </p>
          <p className="text-xs text-purple-500 italic">{activeAgent.badge} · Powered by {activeAgent.name}</p>
        </div>
        <Button
          onClick={() => navigate("/", { state: { botId: activeBot } })}
          className={`text-white shadow-lg w-full md:w-auto whitespace-nowrap ${
            activeBot === "wellness" ? "bg-amber-500 hover:bg-amber-600" :
            activeBot === "planner"  ? "bg-blue-500 hover:bg-blue-600" :
            activeBot === "speakup"  ? "bg-sky-500 hover:bg-sky-600" :
            activeBot === "upskill"  ? "bg-rose-500 hover:bg-rose-600" :
            "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {activeAgent.cta}
        </Button>
      </div>

      {/* ── Quick Stats — live, clicking switches to that agent's view ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {quickStats.map((stat) => {
          const isStatActive = activeBot === stat.botId
          return (
            <Card
              key={stat.label}
              onClick={() => handleBotClick(stat.botId)}
              className={`p-4 md:p-5 border-2 ${stat.border} bg-gradient-to-br ${stat.card} shadow-md hover:shadow-lg transition-all cursor-pointer group ${isStatActive ? "ring-2 ring-offset-1 ring-purple-400 scale-[1.02]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${stat.valueColor}`}>{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.subColor}`}>{stat.sub}</p>
                </div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${stat.iconBg} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MessageSquare className="w-3 h-3" />
                {isStatActive ? "Active" : "Switch view"}
              </div>
            </Card>
          )
        })}
      </div>

      {/* ── Agent-specific tabs — change per selected agent ── */}
      <AgentTabs
        botId={activeBot}
        dashboard={dashboard}
        loadingDash={loadingDash}
        onChat={handleBotClick}
        onNavigateToChat={(id) => navigate("/", { state: { botId: id } })}
        enrolledCourses={enrolledCourses}
        onEnroll={handleEnrollCourse}
        markedTasks={markedTasks}
        onMarkDone={handleMarkDone}
      />
      </div>
    </div>
  )
}

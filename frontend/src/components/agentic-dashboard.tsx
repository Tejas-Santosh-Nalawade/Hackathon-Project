/**
 * Agentic Dashboard Component
 * ---------------------------
 * This component displays the agent-powered personalized dashboard.
 * All metrics are derived from agent memory, not static data.
 */

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, CheckCircle2, DollarSign, AlertCircle, TrendingUp, Sparkles } from "lucide-react"
import { fetchDashboard, fetchGreeting, fetchProfile, type DashboardData, type GreetingData } from "@/lib/api"

export function AgenticDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [greeting, setGreeting] = useState<GreetingData | null>(null)
  const [userName, setUserName] = useState<string>("User")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user profile first to get name
      let profileName = "User"
      try {
        const profile = await fetchProfile()
        profileName = profile.name
        setUserName(profileName)
      } catch (err) {
        console.log("Could not fetch profile, using fallback name")
      }

      // Fetch dashboard and greeting in parallel
      const [dashboardData, greetingData] = await Promise.all([
        fetchDashboard(),
        fetchGreeting()
      ])

      setDashboard(dashboardData)
      setGreeting(greetingData)
    } catch (err) {
      console.error("Failed to load dashboard:", err)
      setError("Unable to load dashboard. Using fallback data.")
      
      // Set fallback data with user name
      setDashboard(getFallbackDashboard())
      setGreeting(getFallbackGreeting(userName))
    } finally {
      setLoading(false)
    }
  }

  const getFallbackDashboard = (): DashboardData => ({
    wellness: { score: 70, status: "Doing okay", trend: "stable", agent: "FitHer" },
    planner: { tasks_done: 0, tasks_total: 11, progress: 0, status: "Let's plan", agent: "PlanPal" },
    finance: { savings_goal: 50, status: "Let's start", agent: "PaisaWise" },
    safety: { alerts: 0, priority: "low", status: "All clear", agent: "SpeakUp" },
    career: { growth_score: 50, status: "Ready to start", agent: "GrowthGuru" },
    generated_at: new Date().toISOString()
  })

  const getFallbackGreeting = (name: string): GreetingData => {
    const hour = new Date().getHours()
    let timeOfDay = "afternoon"
    let greetingText = `Good afternoon, ${name}`
    
    if (hour < 12) {
      timeOfDay = "morning"
      greetingText = `Good morning, ${name}`
    } else if (hour >= 17) {
      timeOfDay = "evening"
      greetingText = `Good evening, ${name}`
    }
    
    return {
      greeting: greetingText,
      insights: ["Your support team is ready to help you thrive 💪"],
      time_of_day: timeOfDay
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Sparkles className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading your personalized dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboard || !greeting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">Unable to load dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Personalized Greeting */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {greeting.greeting} 💜
          </h2>
          <div className="space-y-1">
            {greeting.insights.map((insight, idx) => (
              <p key={idx} className="text-sm text-purple-700 dark:text-purple-300">
                {insight}
              </p>
            ))}
          </div>
          {error && (
            <Badge variant="outline" className="mt-2 bg-yellow-50">
              Offline mode - data may not be current
            </Badge>
          )}
        </div>
      </Card>

      {/* Dashboard Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Wellness Score */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <h3 className="font-semibold">Wellness Score</h3>
            </div>
            <Badge variant={
              dashboard.wellness.trend === "improving" ? "default" :
              dashboard.wellness.trend === "needs_attention" ? "destructive" :
              "secondary"
            }>
              {dashboard.wellness.trend === "improving" && "📈 Improving"}
              {dashboard.wellness.trend === "needs_attention" && "⚠️ Needs attention"}
              {dashboard.wellness.trend === "stable" && "➡️ Stable"}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{dashboard.wellness.score}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="text-sm text-muted-foreground">{dashboard.wellness.status}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${dashboard.wellness.score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Powered by {dashboard.wellness.agent}
            </p>
          </div>
        </Card>

        {/* Tasks Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Tasks Today</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{dashboard.planner.tasks_done}</span>
              <span className="text-sm text-muted-foreground">/ {dashboard.planner.tasks_total}</span>
            </div>
            <p className="text-sm text-muted-foreground">{dashboard.planner.status}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${dashboard.planner.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Powered by {dashboard.planner.agent}
            </p>
          </div>
        </Card>

        {/* Savings Goal */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold">Savings Goal</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{dashboard.finance.savings_goal.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-sm text-muted-foreground">{dashboard.finance.status}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${dashboard.finance.savings_goal}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Powered by {dashboard.finance.agent}
            </p>
          </div>
        </Card>

        {/* Safety Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-5 h-5 ${
                dashboard.safety.priority === "high" ? "text-red-500" :
                dashboard.safety.priority === "medium" ? "text-orange-500" :
                "text-blue-500"
              }`} />
              <h3 className="font-semibold">Safety Status</h3>
            </div>
            {dashboard.safety.alerts > 0 && (
              <Badge variant={dashboard.safety.priority === "high" ? "destructive" : "secondary"}>
                {dashboard.safety.alerts} alert{dashboard.safety.alerts > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-semibold">{dashboard.safety.status}</p>
            {dashboard.safety.alerts === 0 ? (
              <p className="text-sm text-muted-foreground">No safety concerns reported</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {dashboard.safety.alerts} concern{dashboard.safety.alerts > 1 ? "s" : ""} need{dashboard.safety.alerts === 1 ? "s" : ""} attention
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Powered by {dashboard.safety.agent}
            </p>
          </div>
        </Card>

        {/* Career Growth */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Career Growth</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{dashboard.career.growth_score.toFixed(0)}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="text-sm text-muted-foreground">{dashboard.career.status}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${dashboard.career.growth_score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Powered by {dashboard.career.agent}
            </p>
          </div>
        </Card>

        {/* Last Updated */}
        <Card className="p-6 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-purple-500" />
            <h3 className="font-semibold">Living Dashboard</h3>
            <p className="text-xs text-muted-foreground">
              Updated from agent memory
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(dashboard.generated_at).toLocaleString()}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

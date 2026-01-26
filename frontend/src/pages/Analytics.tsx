import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Activity,
  Calendar,
  Download,
  Filter,
  Search,
  ArrowLeft,
} from "lucide-react"

// Mock data for analytics
const mockConversations = [
  {
    id: 1,
    user: "Priya S.",
    bot: "FitHer Wellness",
    timestamp: "2026-01-23 10:30 AM",
    messages: 12,
    duration: "8 min",
    topic: "Neck pain relief",
    sentiment: "positive",
  },
  {
    id: 2,
    user: "Sarah M.",
    bot: "MoneyWise Finance",
    timestamp: "2026-01-23 09:45 AM",
    messages: 8,
    duration: "5 min",
    topic: "Budget planning",
    sentiment: "neutral",
  },
  {
    id: 3,
    user: "Priya S.",
    bot: "FitHer Wellness",
    timestamp: "2026-01-22 03:20 PM",
    messages: 15,
    duration: "12 min",
    topic: "Guided meditation",
    sentiment: "positive",
  },
  {
    id: 4,
    user: "Maya K.",
    bot: "SpeakUp Safety",
    timestamp: "2026-01-22 02:15 PM",
    messages: 6,
    duration: "4 min",
    topic: "Workplace harassment",
    sentiment: "concerned",
  },
  {
    id: 5,
    user: "Anita R.",
    bot: "CareerBoost Upskill",
    timestamp: "2026-01-22 11:00 AM",
    messages: 10,
    duration: "7 min",
    topic: "Skills assessment",
    sentiment: "positive",
  },
]

const mockUserActivities = [
  {
    user: "Priya S.",
    totalSessions: 24,
    favoriteBot: "FitHer Wellness",
    lastActive: "Today, 10:30 AM",
    avgDuration: "8 min",
    guidedSessions: 12,
  },
  {
    user: "Sarah M.",
    totalSessions: 15,
    favoriteBot: "MoneyWise Finance",
    lastActive: "Today, 9:45 AM",
    avgDuration: "6 min",
    guidedSessions: 3,
  },
  {
    user: "Maya K.",
    totalSessions: 8,
    favoriteBot: "SpeakUp Safety",
    lastActive: "Yesterday, 2:15 PM",
    avgDuration: "5 min",
    guidedSessions: 0,
  },
  {
    user: "Anita R.",
    totalSessions: 18,
    favoriteBot: "CareerBoost Upskill",
    lastActive: "Yesterday, 11:00 AM",
    avgDuration: "7 min",
    guidedSessions: 5,
  },
]

const mockBotUsage = [
  { name: "FitHer Wellness", sessions: 145, users: 42, avgRating: 4.8 },
  { name: "MoneyWise Finance", sessions: 98, users: 35, avgRating: 4.6 },
  { name: "PlanIt Smart", sessions: 76, users: 28, avgRating: 4.5 },
  { name: "CareerBoost Upskill", sessions: 64, users: 22, avgRating: 4.7 },
  { name: "SpeakUp Safety", sessions: 52, users: 18, avgRating: 4.9 },
  { name: "FamilyCare Connect", sessions: 43, users: 15, avgRating: 4.6 },
]

const mockPageViews = [
  { page: "Dashboard", views: 1240, avgTime: "3m 24s", bounceRate: "12%" },
  { page: "FitHer Wellness", views: 856, avgTime: "8m 12s", bounceRate: "8%" },
  { page: "MoneyWise Finance", views: 645, avgTime: "6m 45s", bounceRate: "15%" },
  { page: "Profile Settings", views: 423, avgTime: "2m 18s", bounceRate: "22%" },
  { page: "Guided Sessions", views: 389, avgTime: "12m 34s", bounceRate: "5%" },
]

const mockInsights = [
  {
    title: "Peak Usage Time",
    value: "2-4 PM weekdays",
    trend: "+23%",
    insight: "Most users engage during afternoon work breaks",
  },
  {
    title: "Most Popular Feature",
    value: "Guided Wellness Sessions",
    trend: "+45%",
    insight: "Voice-guided exercises showing highest engagement",
  },
  {
    title: "User Retention",
    value: "78%",
    trend: "+12%",
    insight: "Weekly active users returning consistently",
  },
  {
    title: "Avg Session Length",
    value: "7.2 minutes",
    trend: "+8%",
    insight: "Users spending more time per session",
  },
]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d")
  const navigate = useNavigate()

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-teal-50 hover:border-teal-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track conversations, user activities, and platform insights
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {["24h", "7d", "30d", "90d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === "24h" ? "Today" : range === "7d" ? "Week" : range === "30d" ? "Month" : "Quarter"}
            </Button>
          ))}
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8 text-teal-600" />
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                +23%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">1,247</div>
            <div className="text-sm text-muted-foreground">Total Conversations</div>
          </Card>

          <Card className="p-6 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                +18%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">456</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </Card>

          <Card className="p-6 border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-purple-600" />
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                +45%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">389</div>
            <div className="text-sm text-muted-foreground">Guided Sessions</div>
          </Card>

          <Card className="p-6 border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">78%</div>
            <div className="text-sm text-muted-foreground">User Retention</div>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="conversations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bots">Bot Usage</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Conversations</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {mockConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-4 border border-border rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-lg">{conv.user}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {conv.timestamp}
                        </div>
                      </div>
                      <Badge
                        className={
                          conv.sentiment === "positive"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : conv.sentiment === "concerned"
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {conv.sentiment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full font-medium">
                        {conv.bot}
                      </span>
                      <span className="text-muted-foreground">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        {conv.messages} messages
                      </span>
                      <span className="text-muted-foreground">
                        <Activity className="w-4 h-4 inline mr-1" />
                        {conv.duration}
                      </span>
                      <span className="text-muted-foreground ml-auto font-medium">
                        Topic: {conv.topic}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">User Activity Overview</h2>
              <div className="space-y-3">
                {mockUserActivities.map((user, idx) => (
                  <div
                    key={idx}
                    className="p-5 border-2 border-border rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {user.user.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{user.user}</div>
                          <div className="text-sm text-muted-foreground">
                            Last active: {user.lastActive}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        {user.totalSessions} sessions
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Favorite Bot</div>
                        <div className="font-semibold text-teal-600">{user.favoriteBot}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Avg Duration</div>
                        <div className="font-semibold">{user.avgDuration}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Guided Sessions</div>
                        <div className="font-semibold">{user.guidedSessions}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Bot Usage Tab */}
          <TabsContent value="bots" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Bot Performance Metrics</h2>
              <div className="space-y-4">
                {mockBotUsage.map((bot, idx) => (
                  <div key={idx} className="p-5 border-2 border-border rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-lg">{bot.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <span className="font-bold text-lg">{bot.avgRating}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Total Sessions</div>
                        <div className="text-2xl font-bold text-teal-600">{bot.sessions}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Unique Users</div>
                        <div className="text-2xl font-bold text-blue-600">{bot.users}</div>
                      </div>
                    </div>
                    <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                        style={{ width: `${(bot.sessions / 145) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Insights */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Key Insights</h2>
                <div className="space-y-4">
                  {mockInsights.map((insight, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-700">{insight.title}</div>
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          {insight.trend}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {insight.value}
                      </div>
                      <div className="text-sm text-muted-foreground">{insight.insight}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Page Views */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Page Analytics</h2>
                <div className="space-y-3">
                  {mockPageViews.map((page, idx) => (
                    <div key={idx} className="p-4 border border-border rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">{page.page}</div>
                        <Badge variant="outline">{page.views} views</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg Time: </span>
                          <span className="font-semibold">{page.avgTime}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bounce: </span>
                          <span className="font-semibold">{page.bounceRate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <h2 className="text-2xl font-bold mb-4 text-purple-900">
                📊 Data-Driven Recommendations
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-900 mb-1">
                    ✨ Add More Guided Sessions
                  </div>
                  <div className="text-sm text-gray-700">
                    Users are engaging 45% more with guided wellness sessions. Consider adding
                    guided sessions for other bots like Finance and Career.
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-900 mb-1">
                    🎯 Focus on Afternoon Content
                  </div>
                  <div className="text-sm text-gray-700">
                    Peak usage occurs 2-4 PM. Schedule new feature releases or content during
                    these hours for maximum impact.
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-900 mb-1">
                    💡 Improve Profile Settings UX
                  </div>
                  <div className="text-sm text-gray-700">
                    Profile Settings has the highest bounce rate at 22%. Streamline the settings
                    page to improve user experience.
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

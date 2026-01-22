import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"

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

export function PersonalizedDashboard() {
  const [selectedDate] = useState(new Date())
  const userName = "Priya"

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
      {/* Welcome Header with Avatar Greeting */}
      <div className="flex items-start justify-between bg-gradient-to-r from-pink-100 via-purple-100 to-rose-100 p-6 rounded-3xl border-2 border-pink-200 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Good afternoon, {userName}! 💝
          </h1>
          <p className="text-lg text-gray-700">
            You have <span className="font-semibold text-pink-600">3 pending tasks</span> and{" "}
            <span className="font-semibold text-rose-600">2 family alerts</span> today
          </p>
          <p className="text-sm text-purple-600 mt-2 italic">✨ You're doing amazing! Keep up the great work!</p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 hover:from-pink-600 hover:via-purple-600 hover:to-rose-600 text-white shadow-lg">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Planner
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-2 border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-white shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Wellness Score</p>
              <p className="text-3xl font-bold text-pink-600">85%</p>
              <p className="text-xs text-green-600 mt-1">❤️ Feeling great!</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center">
              <Heart className="w-7 h-7 text-pink-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-lavender-50 to-white shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tasks Today</p>
              <p className="text-3xl font-bold text-purple-600">8/11</p>
              <p className="text-xs text-blue-600 mt-1">💪 Almost there!</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-pink-50 to-white shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Savings Goal</p>
              <p className="text-3xl font-bold text-rose-600">72.5%</p>
              <p className="text-xs text-green-600 mt-1">📈 On track!</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-200 to-orange-200 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-rose-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-2 border-pink-300 bg-gradient-to-br from-pink-100 via-purple-50 to-white shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Family Alerts</p>
              <p className="text-3xl font-bold text-pink-600">2</p>
              <p className="text-xs text-orange-600 mt-1">🔔 Needs attention</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 flex items-center justify-center animate-pulse">
              <Bell className="w-7 h-7 text-pink-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="family">
            <Heart className="w-4 h-4 mr-2" />
            Family Care
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="finance">
            <DollarSign className="w-4 h-4 mr-2" />
            Finance
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Clock className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            My Stats
          </TabsTrigger>
        </TabsList>

        {/* Calendar & Events Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-2xl font-bold mb-4">Today's Schedule</h2>
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const Icon = event.icon
                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded-xl border-2 ${
                        event.color === "blue"
                          ? "border-blue-200 bg-blue-50"
                          : event.color === "pink"
                          ? "border-pink-200 bg-pink-50"
                          : event.color === "purple"
                          ? "border-purple-200 bg-purple-50"
                          : "border-orange-200 bg-orange-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 text-${event.color}-600 mt-1`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            {event.time}
                          </p>
                        </div>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Week Overview</h2>
              <div className="space-y-3">
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">Work Meetings</span>
                    <Badge className="bg-blue-100 text-blue-700">12</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Avg 2.4 per day</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">Learning Hours</span>
                    <Badge className="bg-purple-100 text-purple-700">5h</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">3 course modules</p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">Family Time</span>
                    <Badge className="bg-pink-100 text-pink-700">15h</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Kids & eldercare</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">Wellness</span>
                    <Badge className="bg-green-100 text-green-700">3.5h</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Exercise & meditation</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Family Care Tab */}
        <TabsContent value="family" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Family Care Alerts & Reminders</h2>
                <p className="text-sm text-gray-600 mt-1">💕 Caring for your loved ones with love</p>
              </div>
              <Button variant="outline" size="sm" className="border-pink-300 text-pink-600 hover:bg-pink-100">
                <Bell className="w-4 h-4 mr-2" />
                Manage Alerts
              </Button>
            </div>

            <div className="space-y-4">
              {familyAlerts.map((alert) => {
                const Icon = alert.icon
                return (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-2xl border-2 shadow-md hover:shadow-lg transition-all ${
                      alert.priority === "high"
                        ? "border-pink-300 bg-gradient-to-r from-pink-100 to-rose-100"
                        : alert.priority === "medium"
                        ? "border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50"
                        : "border-purple-200 bg-gradient-to-r from-blue-50 to-purple-50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${
                          alert.priority === "high"
                            ? "bg-gradient-to-br from-pink-300 to-rose-400"
                            : alert.priority === "medium"
                            ? "bg-gradient-to-br from-orange-300 to-yellow-300"
                            : "bg-gradient-to-br from-blue-300 to-purple-300"
                        }`}
                      >
                        <Icon
                          className={`w-7 h-7 ${
                            alert.priority === "high"
                              ? "text-white"
                              : alert.priority === "medium"
                              ? "text-orange-700"
                              : "text-blue-700"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{alert.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          </div>
                          <Badge
                            className={`rounded-full px-3 ${
                              alert.priority === "high"
                                ? "bg-pink-200 text-pink-800 border-pink-300"
                                : alert.priority === "medium"
                                ? "bg-orange-200 text-orange-800 border-orange-300"
                                : "bg-blue-200 text-blue-800 border-blue-300"
                            }`}
                          >
                            {alert.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          <span className="text-sm text-gray-600 flex items-center gap-1.5 bg-white px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4" />
                            {alert.time}
                          </span>
                          <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-md">
                            {alert.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Eldercare Tracking */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 rounded-2xl border-2 border-pink-300 shadow-lg">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Users className="w-6 h-6 text-pink-600" />
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Eldercare Dashboard</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">💞 Taking care of mom with love and attention</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-xl shadow-md border border-pink-200">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <Pill className="w-4 h-4 text-purple-500" />
                    Medications
                  </p>
                  <p className="text-3xl font-bold text-purple-600">2/3</p>
                  <p className="text-xs text-green-600 mt-2 font-semibold">✓ Taken today</p>
                </div>
                <div className="p-5 bg-white rounded-xl shadow-md border border-pink-200">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Vitals
                  </p>
                  <p className="text-3xl font-bold text-pink-600">Normal</p>
                  <p className="text-xs text-gray-600 mt-2">BP: 120/80 mmHg</p>
                </div>
                <div className="p-5 bg-white rounded-xl shadow-md border border-pink-200">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    Next Appointment
                  </p>
                  <p className="text-3xl font-bold text-rose-600">Today</p>
                  <p className="text-xs text-gray-600 mt-2">2:00 PM - Dr. Sharma</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Personalized Course Recommendations</h2>
                <p className="text-sm text-gray-600 mt-1">
                  🎓 AI-curated based on your skills, goals, and career path
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-100">
                <GraduationCap className="w-4 h-4 mr-2" />
                All Courses
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courseRecommendations.map((course) => (
                <div
                  key={course.id}
                  className="p-6 rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-white to-purple-50 hover:border-pink-400 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">{course.thumbnail}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                        <Badge className="bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border-green-300 rounded-full">
                          ✨ {course.matchScore}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-600 font-medium">{course.provider}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Duration</p>
                      <p className="text-sm font-bold text-purple-600">{course.duration}</p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Level</p>
                      <p className="text-sm font-bold text-pink-600">{course.level}</p>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Rating</p>
                      <p className="text-sm font-bold text-rose-600">⭐ {course.rating}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs border-purple-300 text-purple-700 bg-purple-50">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-purple-200">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      👥 {course.enrolled} enrolled
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-md">
                      Enroll Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Current Courses */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">📚 Currently Enrolled</h3>
              <div className="p-6 rounded-2xl border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">Excel Advanced Course</h4>
                    <p className="text-sm text-muted-foreground">Udemy • Module 3 of 8</p>
                  </div>
                  <Badge className="bg-teal-100 text-teal-700 border-teal-200">In Progress</Badge>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">37.5%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600" style={{ width: "37.5%" }} />
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Continue Learning
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Monthly Budget</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Budget</span>
                    <span className="font-bold text-xl">₹{financialInsights.monthlyBudget.total.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                      style={{
                        width: `${(financialInsights.monthlyBudget.spent / financialInsights.monthlyBudget.total) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-green-600">
                      Spent: ₹{financialInsights.monthlyBudget.spent.toLocaleString()}
                    </span>
                    <span className="text-sm text-orange-600">
                      Remaining: ₹{financialInsights.monthlyBudget.remaining.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-pink-200">
                  <h3 className="font-bold mb-3 text-gray-900">🎯 Savings Goal</h3>
                  <div className="p-5 bg-gradient-to-r from-pink-100 via-rose-100 to-purple-100 rounded-2xl border-2 border-pink-300 shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center shadow-md">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{financialInsights.savingsGoal.goalName}</h4>
                        <p className="text-sm text-gray-700 font-medium">
                          ₹{financialInsights.savingsGoal.current.toLocaleString()} of ₹
                          {financialInsights.savingsGoal.target.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500"
                          style={{ width: `${financialInsights.savingsGoal.progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-pink-700 font-bold">
                      {financialInsights.savingsGoal.progress}% Complete 🎉 You're doing great!
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Financial Recommendations</h2>
              <p className="text-sm text-gray-600 mb-6">💰 Smart ways to grow your wealth</p>
              <div className="space-y-4">
                {financialInsights.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl border-2 border-purple-300 bg-gradient-to-r from-white to-purple-50 hover:border-pink-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center shadow-md">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{rec.title}</h3>
                        <p className="text-sm text-gray-600 mt-2">{rec.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border-green-300 rounded-full px-3 py-1">
                        🎯 Potential: {rec.potential}
                      </Badge>
                      <Button size="sm" variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-100 rounded-full">
                        Learn More
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-2">💡 Smart Tip</h3>
                  <p className="text-sm text-gray-700">
                    Based on your spending patterns, you can save an additional ₹8,000 per month by reducing dining out expenses by 30%.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">AI-Optimized Daily Schedule</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Your personalized time-blocked plan for maximum productivity
                </p>
              </div>
              <Button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Re-optimize
              </Button>
            </div>

            <div className="space-y-2">
              {todaySchedule.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 flex items-center gap-4 transition-all ${
                    item.done
                      ? "border-green-200 bg-green-50 opacity-60"
                      : "border-gray-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {item.done ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">{item.time}</span>
                      <span className={`ml-3 ${item.done ? "line-through text-gray-500" : "text-gray-700"}`}>
                        {item.activity}
                      </span>
                    </div>
                    {!item.done && (
                      <Button size="sm" variant="outline">
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border-2 border-teal-200">
              <h3 className="font-bold text-gray-900 mb-2">🤖 AI Insights</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Scheduled 30-min wellness break at 1 PM - perfect timing for stress relief</li>
                <li>• Added buffer time before kids' pickup to avoid rushing</li>
                <li>• Course learning scheduled for 6 PM when focus is typically high</li>
                <li>• Reserved 9 PM for personal time - important for self-care!</li>
              </ul>
            </div>
          </Card>
        </TabsContent>

        {/* Analytics Tab - User Specific */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 bg-clip-text text-transparent mb-2">
                Your Personal Stats
              </h2>
              <p className="text-muted-foreground">Track your wellness journey, productivity, and goals</p>
            </div>

            {/* User Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="p-6 rounded-xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white">
                <div className="text-sm text-muted-foreground mb-1">Wellness Score</div>
                <div className="text-3xl font-bold text-pink-600">85%</div>
                <div className="text-xs text-green-600 mt-1">↑ 5% from last week</div>
              </div>
              <div className="p-6 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <div className="text-sm text-muted-foreground mb-1">Tasks Completed</div>
                <div className="text-3xl font-bold text-purple-600">156</div>
                <div className="text-xs text-green-600 mt-1">This month</div>
              </div>
              <div className="p-6 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <div className="text-sm text-muted-foreground mb-1">Learning Hours</div>
                <div className="text-3xl font-bold text-blue-600">24h</div>
                <div className="text-xs text-orange-600 mt-1">2 courses active</div>
              </div>
              <div className="p-6 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white">
                <div className="text-sm text-muted-foreground mb-1">Savings Progress</div>
                <div className="text-3xl font-bold text-rose-600">72.5%</div>
                <div className="text-xs text-green-600 mt-1">On track!</div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">This Week's Activity</h3>
              <div className="space-y-3">
                {[
                  { day: "Monday", wellness: 90, tasks: 8, learning: 2, finance: 5 },
                  { day: "Tuesday", wellness: 85, tasks: 6, learning: 1.5, finance: 3 },
                  { day: "Wednesday", wellness: 88, tasks: 10, learning: 2, finance: 4 },
                  { day: "Thursday", wellness: 82, tasks: 7, learning: 1, finance: 2 },
                  { day: "Today", wellness: 85, tasks: 8, learning: 2, finance: 6 },
                ].map((day) => (
                  <div key={day.day} className="p-4 bg-gradient-to-r from-pink-50 via-purple-50 to-rose-50 rounded-lg border border-pink-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{day.day}</span>
                      <Badge className="bg-pink-100 text-pink-700 border-pink-300">
                        Wellness: {day.wellness}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">{day.tasks} tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">{day.learning}h learning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">₹{day.finance}k saved</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Recent Achievements 🎉</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                  <div className="text-3xl mb-2">🏆</div>
                  <h4 className="font-bold text-gray-900 mb-1">7-Day Wellness Streak!</h4>
                  <p className="text-sm text-gray-600">Completed daily wellness exercises for a week</p>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="text-3xl mb-2">📚</div>
                  <h4 className="font-bold text-gray-900 mb-1">Course Module Completed</h4>
                  <p className="text-sm text-gray-600">Finished Excel Advanced - Module 2</p>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                  <div className="text-3xl mb-2">💰</div>
                  <h4 className="font-bold text-gray-900 mb-1">Savings Milestone</h4>
                  <p className="text-sm text-gray-600">Reached 70% of emergency fund goal</p>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
                  <div className="text-3xl mb-2">❤️</div>
                  <h4 className="font-bold text-gray-900 mb-1">Family Care Champion</h4>
                  <p className="text-sm text-gray-600">Never missed a medication reminder this month</p>
                </div>
              </div>
            </div>

            {/* Personalized Insights */}
            <div className="p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-xl border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Your Personalized Insights</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                  <span className="text-gray-700">
                    You're most productive between 10-12 PM. Try scheduling important tasks during this window!
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-pink-600 mt-0.5" />
                  <span className="text-gray-700">
                    Your wellness score improves by 12% on days you complete morning exercises.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">
                    Great job! You're saving ₹3,000 more per month than your initial budget plan.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span className="text-gray-700">
                    Evening learning (6-7 PM) works best for you - 85% course completion rate!
                  </span>
                </li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

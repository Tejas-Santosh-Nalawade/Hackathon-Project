import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Heart, CheckCircle2, DollarSign, AlertCircle, TrendingUp,
  MessageSquare, Dumbbell, Clock, Calendar, BookOpen, ShieldCheck,
  Rocket, Wallet, Pill, Baby, Users, Sparkles, BarChart3, Bell,
  GraduationCap, Video,
} from "lucide-react"
import type { DashboardData } from "@/lib/api"

interface AgentTabsProps {
  botId: string
  dashboard: DashboardData | null
  loadingDash: boolean
  onChat: (botId: string) => void       // switches view
  onNavigateToChat: (botId: string, prompt?: string) => void  // opens chat with optional prompt
  enrolledCourses: number[]
  onEnroll: (id: number) => void
  markedTasks: number[]
  onMarkDone: (idx: number) => void
}

export function AgentTabs({ botId, dashboard, loadingDash, onChat, onNavigateToChat, enrolledCourses, onEnroll, markedTasks, onMarkDone }: AgentTabsProps) {
  if (botId === "wellness") return <WellnessTabs dashboard={dashboard} loadingDash={loadingDash} onChat={onNavigateToChat} />
  if (botId === "planner")  return <PlannerTabs  dashboard={dashboard} loadingDash={loadingDash} onChat={onNavigateToChat} markedTasks={markedTasks} onMarkDone={onMarkDone} />
  if (botId === "speakup")  return <SpeakUpTabs  dashboard={dashboard} loadingDash={loadingDash} onChat={onNavigateToChat} />
  if (botId === "upskill")  return <UpskillTabs  dashboard={dashboard} loadingDash={loadingDash} onChat={onNavigateToChat} enrolledCourses={enrolledCourses} onEnroll={onEnroll} />
  if (botId === "finance")  return <FinanceTabs  dashboard={dashboard} loadingDash={loadingDash} onChat={onNavigateToChat} />
  return null
}

// ─── WELLNESS TABS ────────────────────────────────────────────────────────────
function WellnessTabs({ dashboard, loadingDash, onChat }: { dashboard: DashboardData | null; loadingDash: boolean; onChat: (id: string, prompt?: string) => void }) {
  const score = dashboard?.wellness.score ?? 70
  const status = dashboard?.wellness.status ?? "Doing okay"
  const trend = dashboard?.wellness.trend ?? "stable"

  const exercises = [
    { type: "NECK", title: "Neck & Shoulder Relief", duration: "2 min", desc: "Tilt head side to side, roll shoulders backward", emoji: "🧘" },
    { type: "BREATH", title: "Box Breathing Reset", duration: "3 min", desc: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s", emoji: "🫁" },
    { type: "EYES", title: "Eye Yoga (20-20-20)", duration: "1 min", desc: "Look 20ft away for 20s, blink 20 times", emoji: "👁️" },
    { type: "WRIST", title: "Wrist & Hand Relief", duration: "2 min", desc: "Rotate wrists, stretch fingers, shake hands gently", emoji: "🤲" },
    { type: "POSTURE", title: "Posture Reset", duration: "1 min", desc: "Straighten spine, shoulders back, feet flat", emoji: "🪑" },
    { type: "ENERGY", title: "Energy Boost Stretch", duration: "3 min", desc: "Seated twist, chest opener, deep breath", emoji: "⚡" },
  ]

  return (
    <Tabs defaultValue="exercises" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="exercises"><Dumbbell className="w-3.5 h-3.5 mr-1.5" />Exercises</TabsTrigger>
        <TabsTrigger value="score"><Heart className="w-3.5 h-3.5 mr-1.5" />My Score</TabsTrigger>
        <TabsTrigger value="tips"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Tips</TabsTrigger>
      </TabsList>

      <TabsContent value="exercises" className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">Desk-Safe Exercises</h3>
          <Button size="sm" onClick={() => onChat("wellness", "I need help with a desk exercise. Can you guide me?")} className="bg-amber-500 hover:bg-amber-600 text-white">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />Start with FitHer
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exercises.map((ex) => (
            <Card key={ex.type} className="p-4 border-2 border-amber-100 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group" onClick={() => onChat("wellness", `Guide me through ${ex.title} - ${ex.desc}`)}>
              <div className="text-2xl mb-2">{ex.emoji}</div>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs mb-2">{ex.type} · {ex.duration}</Badge>
              <h4 className="font-semibold text-sm text-gray-900 mb-1">{ex.title}</h4>
              <p className="text-xs text-gray-500">{ex.desc}</p>
              <div className="mt-2 text-xs text-amber-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />Guide me through this
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="score">
        <Card className="p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl">Wellness Score</h3>
            <Badge className={trend === "improving" ? "bg-green-100 text-green-700" : trend === "needs_attention" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}>
              {trend === "improving" ? "📈 Improving" : trend === "needs_attention" ? "⚠️ Needs care" : "➡️ Stable"}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-amber-600">{loadingDash ? "…" : score}</span>
            <span className="text-xl text-gray-400">/100</span>
          </div>
          <p className="text-gray-600 mb-4">{status}</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all" style={{ width: `${score}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Positive activities</p>
              <p className="font-bold text-green-600">+3 pts each</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-gray-500 mb-1">Stress mentions</p>
              <p className="font-bold text-red-600">-5 pts each</p>
            </div>
          </div>
          <Button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => onChat("wellness", "Help me improve my wellness score. What should I focus on?")}>
            <MessageSquare className="w-4 h-4 mr-2" />Chat with FitHer to improve score
          </Button>
        </Card>
      </TabsContent>

      <TabsContent value="tips" className="space-y-3">
        {[
          { emoji: "🫁", title: "Breathing tip", tip: "Try box breathing when stressed: 4s in, 4s hold, 4s out, 4s hold. Repeat 4 times." },
          { emoji: "👁️", title: "Eye care", tip: "Every 20 minutes, look at something 20 feet away for 20 seconds to reduce screen fatigue." },
          { emoji: "🪑", title: "Posture check", tip: "Imagine a thread gently lifting the top of your head. Let your shoulders drop naturally." },
          { emoji: "💧", title: "Hydration", tip: "Drink a glass of water every hour. Dehydration causes fatigue and reduces focus." },
          { emoji: "⏰", title: "Micro-breaks", tip: "A 2-minute break every 90 minutes is more effective than one long break." },
        ].map((t) => (
          <Card key={t.title} className="p-4 border border-amber-100 hover:border-amber-300 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-1">{t.title}</p>
                <p className="text-sm text-gray-600">{t.tip}</p>
              </div>
            </div>
          </Card>
        ))}
        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={() => onChat("wellness", "Give me personalised wellness advice based on my current state.")}>
          <MessageSquare className="w-4 h-4 mr-2" />Get personalised wellness advice
        </Button>
      </TabsContent>
    </Tabs>
  )
}

// ─── PLANNER TABS ─────────────────────────────────────────────────────────────
const defaultSchedule = [
  { time: "09:30", task: "Focus work block", done: false, type: "work" },
  { time: "11:00", task: "2-min desk stretch break", done: false, type: "wellness" },
  { time: "12:30", task: "Lunch break", done: false, type: "break" },
  { time: "14:00", task: "Team meetings / calls", done: false, type: "work" },
  { time: "15:30", task: "Pick up kids / family task", done: false, type: "family" },
  { time: "16:00", task: "Deep focus work", done: false, type: "work" },
  { time: "18:00", task: "Wind-down breathing (3 min)", done: false, type: "wellness" },
  { time: "20:00", task: "Family dinner time", done: false, type: "family" },
  { time: "21:00", task: "Personal time & relaxation", done: false, type: "personal" },
]

function PlannerTabs({ dashboard, loadingDash, onChat, markedTasks, onMarkDone }: { dashboard: DashboardData | null; loadingDash: boolean; onChat: (id: string) => void; markedTasks: number[]; onMarkDone: (i: number) => void }) {
  const done = dashboard?.planner.tasks_done ?? 0
  const total = dashboard?.planner.tasks_total ?? 11
  const progress = dashboard?.planner.progress ?? 0
  const status = dashboard?.planner.status ?? "Let's plan"

  const typeColor: Record<string, string> = {
    work: "border-blue-200 bg-blue-50",
    wellness: "border-amber-200 bg-amber-50",
    break: "border-green-200 bg-green-50",
    family: "border-pink-200 bg-pink-50",
    personal: "border-purple-200 bg-purple-50",
  }

  return (
    <Tabs defaultValue="today" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="today"><Calendar className="w-3.5 h-3.5 mr-1.5" />Today</TabsTrigger>
        <TabsTrigger value="progress"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Progress</TabsTrigger>
        <TabsTrigger value="tips"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Tips</TabsTrigger>
      </TabsList>

      <TabsContent value="today" className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">Optimised Day Plan</h3>
          <Button size="sm" onClick={() => onChat("planner")} className="bg-blue-500 hover:bg-blue-600 text-white">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />Plan with PlanPal
          </Button>
        </div>
        <div className="space-y-2">
          {defaultSchedule.map((item, idx) => {
            const isDone = markedTasks.includes(idx)
            return (
              <div key={idx} className={`p-3 rounded-xl border-2 flex items-center gap-3 ${typeColor[item.type] ?? "border-gray-200 bg-gray-50"} ${isDone ? "opacity-50" : ""}`}>
                <button onClick={() => onMarkDone(idx)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isDone ? "bg-green-500 border-green-500" : "border-gray-400 hover:border-green-400"}`}>
                  {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <span className="text-xs font-mono text-gray-500 shrink-0">{item.time}</span>
                <span className={`text-sm font-medium flex-1 ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>{item.task}</span>
                <Badge className="text-[10px] capitalize" variant="outline">{item.type}</Badge>
              </div>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="progress">
        <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <h3 className="font-bold text-xl mb-4">Task Progress</h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-blue-600">{loadingDash ? "…" : done}</span>
            <span className="text-xl text-gray-400">/ {total}</span>
          </div>
          <p className="text-gray-600 mb-4">{status}</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm mb-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <p className="text-xs text-gray-500">Done</p>
              <p className="font-bold text-blue-600 text-lg">{done}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
              <p className="text-xs text-gray-500">Remaining</p>
              <p className="font-bold text-orange-600 text-lg">{total - done}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
              <p className="text-xs text-gray-500">Progress</p>
              <p className="font-bold text-green-600 text-lg">{Math.round(progress)}%</p>
            </div>
          </div>
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => onChat("planner")}>
            <MessageSquare className="w-4 h-4 mr-2" />Chat with PlanPal to optimise
          </Button>
        </Card>
      </TabsContent>

      <TabsContent value="tips" className="space-y-3">
        {[
          { emoji: "🎯", title: "Prioritise ruthlessly", tip: "Pick your top 3 tasks for the day. Everything else is a bonus." },
          { emoji: "⏰", title: "Time blocking", tip: "Block 90-minute deep work windows. Guard them like meetings." },
          { emoji: "🙅", title: "Say no gracefully", tip: "\"I'd love to help but I'm at capacity this week\" is a complete sentence." },
          { emoji: "🧘", title: "Buffer time", tip: "Add 15-min buffers between meetings. Back-to-back is a recipe for stress." },
          { emoji: "🌙", title: "Evening wind-down", tip: "Write tomorrow's top 3 tasks tonight. Your brain will relax knowing it's captured." },
        ].map((t) => (
          <Card key={t.title} className="p-4 border border-blue-100 hover:border-blue-300 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-1">{t.title}</p>
                <p className="text-sm text-gray-600">{t.tip}</p>
              </div>
            </div>
          </Card>
        ))}
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => onChat("planner")}>
          <MessageSquare className="w-4 h-4 mr-2" />Build my personalised plan
        </Button>
      </TabsContent>
    </Tabs>
  )
}

// ─── SPEAKUP TABS ─────────────────────────────────────────────────────────────
function SpeakUpTabs({ dashboard, loadingDash, onChat }: { dashboard: DashboardData | null; loadingDash: boolean; onChat: (id: string, prompt?: string) => void }) {
  const alerts = dashboard?.safety.alerts ?? 0
  const priority = dashboard?.safety.priority ?? "low"
  const status = dashboard?.safety.status ?? "All clear"

  return (
    <Tabs defaultValue="status" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="status"><ShieldCheck className="w-3.5 h-3.5 mr-1.5" />Status</TabsTrigger>
        <TabsTrigger value="rights"><AlertCircle className="w-3.5 h-3.5 mr-1.5" />My Rights</TabsTrigger>
        <TabsTrigger value="support"><Heart className="w-3.5 h-3.5 mr-1.5" />Support</TabsTrigger>
      </TabsList>

      <TabsContent value="status">
        <Card className={`p-6 border-2 ${priority === "high" ? "border-red-300 bg-red-50" : priority === "medium" ? "border-orange-300 bg-orange-50" : "border-sky-200 bg-sky-50"}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl">Safety Status</h3>
            <Badge className={priority === "high" ? "bg-red-100 text-red-700" : priority === "medium" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}>
              {priority === "high" ? "🔴 High priority" : priority === "medium" ? "🟡 Monitoring" : "🟢 All clear"}
            </Badge>
          </div>
          <p className="text-2xl font-bold mb-2">{loadingDash ? "…" : status}</p>
          {alerts > 0 ? (
            <p className="text-gray-600 mb-4">{alerts} concern{alerts > 1 ? "s" : ""} reported recently</p>
          ) : (
            <p className="text-gray-600 mb-4">No safety concerns reported. Your conversations are private & secure.</p>
          )}
          <div className="space-y-2 mb-4">
            <div className="p-3 bg-white rounded-lg border border-sky-200 flex items-center gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="font-semibold text-sm">End-to-end private</p>
                <p className="text-xs text-gray-500">All conversations are confidential</p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-sky-200 flex items-center gap-3">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-semibold text-sm">Women Helpline: 181</p>
                <p className="text-xs text-gray-500">NCW: 7827-170-170 · Available 24/7</p>
              </div>
            </div>
          </div>
          <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white" onClick={() => onChat("speakup")}>
            <MessageSquare className="w-4 h-4 mr-2" />Talk to SpeakUp privately
          </Button>
        </Card>
      </TabsContent>

      <TabsContent value="rights" className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">Your Workplace Rights</h3>
          <Button size="sm" onClick={() => onChat("speakup")} className="bg-sky-500 hover:bg-sky-600 text-white">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />Ask SpeakUp
          </Button>
        </div>
        {[
          { emoji: "⚖️", title: "POSH Act 2013", desc: "Every company with 10+ employees must have an Internal Complaints Committee (ICC). Complaints must be resolved within 90 days." },
          { emoji: "🛡️", title: "Right to confidentiality", desc: "Your identity and complaint details are protected. No retaliation is permitted by law." },
          { emoji: "📋", title: "Right to fair investigation", desc: "You are entitled to a fair, unbiased inquiry. You can bring a support person to hearings." },
          { emoji: "🚫", title: "Zero tolerance policy", desc: "Harassment by clients, vendors, or colleagues is all covered under POSH. You are protected." },
          { emoji: "📞", title: "External complaint option", desc: "If your company has no ICC, you can file directly with the Local Complaints Committee (LCC)." },
        ].map((r) => (
          <Card key={r.title} className="p-4 border border-sky-100 hover:border-sky-300 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{r.emoji}</span>
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-1">{r.title}</p>
                <p className="text-sm text-gray-600">{r.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="support" className="space-y-3">
        <div className="p-4 bg-sky-50 rounded-xl border-2 border-sky-200 mb-3">
          <p className="text-sm text-sky-800 font-medium">💙 This is a safe, judgment-free space. You are not alone.</p>
        </div>
        {[
          { emoji: "🤝", title: "Talk it through", desc: "Sometimes just saying it out loud helps. SpeakUp will listen without judgment.", action: "Start conversation", botId: "speakup" },
          { emoji: "📝", title: "Document an incident", desc: "Record dates, times, witnesses, and what happened. This is important for any formal process.", action: "Get guidance", botId: "speakup" },
          { emoji: "📞", title: "Emergency contacts", desc: "Women Helpline: 181 · NCW Helpline: 7827-170-170 · Police: 100", action: null, botId: "speakup" },
          { emoji: "💜", title: "Emotional support", desc: "Feeling overwhelmed is normal. SpeakUp can guide you through breathing and grounding exercises.", action: "Get support", botId: "speakup" },
        ].map((s) => (
          <Card key={s.title} className="p-4 border border-sky-100 hover:border-sky-300 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{s.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900 mb-1">{s.title}</p>
                <p className="text-sm text-gray-600 mb-2">{s.desc}</p>
                {s.action && (
                  <Button size="sm" variant="outline" className="border-sky-300 text-sky-600 hover:bg-sky-50" onClick={() => onChat(s.botId)}>
                    <MessageSquare className="w-3 h-3 mr-1" />{s.action}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  )
}

// ─── UPSKILL TABS ─────────────────────────────────────────────────────────────
const courses = [
  { id: 1, title: "Data Analysis with Python", provider: "Coursera", duration: "6 weeks", level: "Intermediate", rating: 4.8, matchScore: 95, skills: ["Python", "Pandas", "Data Analysis"], emoji: "🐍" },
  { id: 2, title: "Leadership Skills for Women", provider: "Udemy", duration: "4 weeks", level: "Beginner", rating: 4.7, matchScore: 92, skills: ["Leadership", "Communication"], emoji: "👩‍💼" },
  { id: 3, title: "Financial Planning Essentials", provider: "LinkedIn Learning", duration: "3 weeks", level: "Beginner", rating: 4.6, matchScore: 88, skills: ["Finance", "Budgeting"], emoji: "💰" },
  { id: 4, title: "Excel for Data Analysis", provider: "Coursera", duration: "4 weeks", level: "Beginner", rating: 4.5, matchScore: 85, skills: ["Excel", "Reporting"], emoji: "📊" },
]

function UpskillTabs({ dashboard, loadingDash, onChat, enrolledCourses, onEnroll }: { dashboard: DashboardData | null; loadingDash: boolean; onChat: (id: string) => void; enrolledCourses: number[]; onEnroll: (id: number) => void }) {
  const score = dashboard?.career.growth_score ?? 50
  const status = dashboard?.career.status ?? "Ready to start"

  return (
    <Tabs defaultValue="courses" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="courses"><GraduationCap className="w-3.5 h-3.5 mr-1.5" />Courses</TabsTrigger>
        <TabsTrigger value="growth"><TrendingUp className="w-3.5 h-3.5 mr-1.5" />Growth</TabsTrigger>
        <TabsTrigger value="tips"><Rocket className="w-3.5 h-3.5 mr-1.5" />Career Tips</TabsTrigger>
      </TabsList>

      <TabsContent value="courses" className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">Recommended for You</h3>
          <Button size="sm" onClick={() => onChat("upskill")} className="bg-rose-500 hover:bg-rose-600 text-white">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />Ask GrowthGuru
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {courses.map((course) => {
            const enrolled = enrolledCourses.includes(course.id)
            return (
              <Card key={course.id} className="p-4 border-2 border-rose-100 hover:border-rose-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{course.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-gray-900">{course.title}</h4>
                      <Badge className="bg-green-100 text-green-700 text-[10px] shrink-0">✨ {course.matchScore}%</Badge>
                    </div>
                    <p className="text-xs text-rose-600 font-medium">{course.provider}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div className="bg-rose-50 p-2 rounded text-center"><p className="text-gray-500">Duration</p><p className="font-bold text-rose-600">{course.duration}</p></div>
                  <div className="bg-pink-50 p-2 rounded text-center"><p className="text-gray-500">Level</p><p className="font-bold text-pink-600">{course.level}</p></div>
                  <div className="bg-amber-50 p-2 rounded text-center"><p className="text-gray-500">Rating</p><p className="font-bold text-amber-600">⭐ {course.rating}</p></div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {course.skills.map((s) => <Badge key={s} variant="outline" className="text-[10px] border-rose-200 text-rose-700">{s}</Badge>)}
                </div>
                <Button size="sm" className={`w-full ${enrolled ? "bg-green-500 hover:bg-green-600" : "bg-rose-500 hover:bg-rose-600"} text-white`} onClick={() => enrolled ? null : onEnroll(course.id)}>
                  {enrolled ? "✅ Enrolled" : "Enroll Now"}
                </Button>
              </Card>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="growth">
        <Card className="p-6 border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white">
          <h3 className="font-bold text-xl mb-4">Career Growth Score</h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-rose-600">{loadingDash ? "…" : score}</span>
            <span className="text-xl text-gray-400">/100</span>
          </div>
          <p className="text-gray-600 mb-4">{status}</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-rose-400 to-pink-500 h-3 rounded-full transition-all" style={{ width: `${score}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <p className="text-xs text-gray-500 mb-1">Skill interest</p>
              <p className="font-bold text-rose-600">+10 pts each</p>
            </div>
            <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
              <p className="text-xs text-gray-500 mb-1">Learning activity</p>
              <p className="font-bold text-pink-600">+15 pts each</p>
            </div>
          </div>
          <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white" onClick={() => onChat("upskill")}>
            <MessageSquare className="w-4 h-4 mr-2" />Chat with GrowthGuru to grow
          </Button>
        </Card>
      </TabsContent>

      <TabsContent value="tips" className="space-y-3">
        {[
          { emoji: "📝", title: "Resume tip", tip: "Quantify everything: 'Increased revenue by 25%' beats 'Improved revenue'. Use action verbs: Led, Built, Managed." },
          { emoji: "��", title: "STAR method", tip: "For interviews: Situation → Task → Action → Result. Always end with a measurable outcome." },
          { emoji: "💰", title: "Salary negotiation", tip: "Research market rates on LinkedIn Salary. Always negotiate — the first offer is rarely the best." },
          { emoji: "🔗", title: "LinkedIn headline", tip: "Don't just use your job title. Try: 'Senior Engineer | Building Scalable Systems | Open to Opportunities'" },
          { emoji: "📚", title: "Micro-learning", tip: "30 minutes of focused learning daily beats 4-hour weekend sessions. Consistency compounds." },
        ].map((t) => (
          <Card key={t.title} className="p-4 border border-rose-100 hover:border-rose-300 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-1">{t.title}</p>
                <p className="text-sm text-gray-600">{t.tip}</p>
              </div>
            </div>
          </Card>
        ))}
        <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white" onClick={() => onChat("upskill")}>
          <MessageSquare className="w-4 h-4 mr-2" />Get my personalised career plan
        </Button>
      </TabsContent>
    </Tabs>
  )
}

// ─── FINANCE TABS ─────────────────────────────────────────────────────────────
function FinanceTabs({ dashboard, loadingDash, onChat }: { dashboard: DashboardData | null; loadingDash: boolean; onChat: (id: string, prompt?: string) => void }) {
  const savings = dashboard?.finance.savings_goal ?? 50
  const status = dashboard?.finance.status ?? "Let's start"

  const budget = { total: 80000, spent: 52000, remaining: 28000 }
  const spentPct = Math.round((budget.spent / budget.total) * 100)

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview"><Wallet className="w-3.5 h-3.5 mr-1.5" />Overview</TabsTrigger>
        <TabsTrigger value="savings"><TrendingUp className="w-3.5 h-3.5 mr-1.5" />Savings</TabsTrigger>
        <TabsTrigger value="tips"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Tips</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">Monthly Budget</h3>
          <Button size="sm" onClick={() => onChat("finance")} className="bg-orange-500 hover:bg-orange-600 text-white">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />Chat with PaisaWise
          </Button>
        </div>
        <Card className="p-5 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-white rounded-xl border border-orange-200">
              <p className="text-xs text-gray-500 mb-1">Total Budget</p>
              <p className="font-bold text-orange-600">₹{(budget.total/1000).toFixed(0)}k</p>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border border-red-200">
              <p className="text-xs text-gray-500 mb-1">Spent</p>
              <p className="font-bold text-red-600">₹{(budget.spent/1000).toFixed(0)}k</p>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Remaining</p>
              <p className="font-bold text-green-600">₹{(budget.remaining/1000).toFixed(0)}k</p>
            </div>
          </div>
          <div className="mb-2 flex justify-between text-xs text-gray-500">
            <span>Spent {spentPct}%</span><span>Remaining {100 - spentPct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full transition-all" style={{ width: `${spentPct}%` }} />
          </div>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { emoji: "🏠", label: "Needs (50%)", amount: "₹40,000", color: "border-blue-200 bg-blue-50", desc: "Rent, groceries, bills, EMIs" },
            { emoji: "🎉", label: "Wants (30%)", amount: "₹24,000", color: "border-purple-200 bg-purple-50", desc: "Shopping, dining, entertainment" },
            { emoji: "📈", label: "Savings (20%)", amount: "₹16,000", color: "border-green-200 bg-green-50", desc: "Emergency fund, investments" },
            { emoji: "💡", label: "Tax savings", amount: "₹15,000", color: "border-amber-200 bg-amber-50", desc: "Invest ₹50k in ELSS under 80C" },
          ].map((item) => (
            <div key={item.label} className={`p-3 rounded-xl border-2 ${item.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span>{item.emoji}</span>
                <span className="font-semibold text-sm">{item.label}</span>
                <span className="ml-auto font-bold text-sm">{item.amount}</span>
              </div>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="savings">
        <Card className="p-6 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <h3 className="font-bold text-xl mb-4">Savings Goal Progress</h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-orange-600">{loadingDash ? "…" : savings}%</span>
          </div>
          <p className="text-gray-600 mb-4">{status}</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-orange-400 to-amber-500 h-3 rounded-full transition-all" style={{ width: `${savings}%` }} />
          </div>
          <div className="space-y-3 mb-4">
            {[
              { emoji: "🛵", label: "New Scooter by Sep 2026", current: 145000, target: 200000 },
              { emoji: "🏥", label: "Emergency Fund (6 months)", current: 80000, target: 150000 },
              { emoji: "📚", label: "Child Education Fund", current: 20000, target: 500000 },
            ].map((goal) => (
              <div key={goal.label} className="p-3 bg-white rounded-xl border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{goal.emoji}</span>
                    <span className="text-sm font-medium">{goal.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">₹{(goal.current/1000).toFixed(0)}k / ₹{(goal.target/1000).toFixed(0)}k</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${Math.min((goal.current/goal.target)*100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={() => onChat("finance")}>
            <MessageSquare className="w-4 h-4 mr-2" />Chat with PaisaWise to plan better
          </Button>
        </Card>
      </TabsContent>

      <TabsContent value="tips" className="space-y-3">
        {[
          { emoji: "📊", title: "50-30-20 Rule", tip: "50% needs, 30% wants, 20% savings. Track for one week to see where your money actually goes." },
          { emoji: "🔄", title: "SIP automation", tip: "Set up a SIP of even ₹500/month in an index fund. Auto-debit on salary day so you never miss it." },
          { emoji: "🧾", title: "Tax planning", tip: "Invest ₹1.5L in ELSS/PPF/NPS under Section 80C to save up to ₹46,800 in taxes annually." },
          { emoji: "🏥", title: "Health insurance first", tip: "Get ₹5-10L health cover before investing. One hospitalisation can wipe out years of savings." },
          { emoji: "💳", title: "Credit card tip", tip: "Pay the full balance every month. The 3% monthly interest on revolving credit is 36% annually." },
        ].map((t) => (
          <Card key={t.title} className="p-4 border border-orange-100 hover:border-orange-300 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-1">{t.title}</p>
                <p className="text-sm text-gray-600">{t.tip}</p>
              </div>
            </div>
          </Card>
        ))}
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={() => onChat("finance")}>
          <MessageSquare className="w-4 h-4 mr-2" />Get my personalised finance plan
        </Button>
      </TabsContent>
    </Tabs>
  )
}


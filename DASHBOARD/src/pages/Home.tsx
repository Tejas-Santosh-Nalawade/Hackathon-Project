import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dashboard } from "@/components/dashboard"
import { PersonalizedDashboard } from "@/components/personalized-dashboard"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, MessageSquare } from "lucide-react"

export default function Home() {
  const navigate = useNavigate()
  const [view, setView] = useState<"chat" | "dashboard">("dashboard")

  useEffect(() => {
    // Check if user is authenticated
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null
    
    if (!user) {
      // Redirect to auth page if not logged in
      navigate("/auth")
    }
  }, [navigate])

  // Show dashboard only if authenticated
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* View Toggle */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={view === "dashboard" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("dashboard")}
              className={view === "dashboard" ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              My Dashboard
            </Button>
            <Button
              variant={view === "chat" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("chat")}
              className={view === "chat" ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Chat & Avatar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === "dashboard" ? <PersonalizedDashboard /> : <Dashboard />}
      </div>
    </div>
  )
}

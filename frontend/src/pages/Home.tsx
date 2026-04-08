import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Dashboard } from "@/components/dashboard"
import { isAuthenticated, getUserProfile } from "@/lib/api"

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedBotId, setSelectedBotId] = useState<string>("wellness")

  useEffect(() => {
    // Check if user is authenticated with JWT
    if (!isAuthenticated()) {
      // Redirect to auth page if not logged in
      navigate("/auth")
      return
    }
    
    // If no specific bot was requested, redirect to dashboard
    if (!location.state?.botId) {
      navigate("/dashboard", { replace: true })
      return
    }

    // Set bot from navigation state if provided
    if (location.state?.botId) {
      setSelectedBotId(location.state.botId)
    }
  }, [navigate, location.state])

  // Show dashboard only if authenticated
  if (!isAuthenticated()) {
    return null // Will redirect via useEffect
  }

  const user = getUserProfile()

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Dashboard onBotChange={setSelectedBotId} selectedBotId={selectedBotId} />
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedBotId, setSelectedBotId] = useState<string>("wellness")

  useEffect(() =>{
    // Check if user is authenticated
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null
    
    if (!user) {
      // Redirect to auth page if not logged in
      navigate("/auth")
    }
    
    // Set bot from navigation state if provided
    if (location.state?.botId) {
      setSelectedBotId(location.state.botId)
    }
  }, [navigate, location.state])

  // Show dashboard only if authenticated
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Dashboard onBotChange={setSelectedBotId} selectedBotId={selectedBotId} />
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Dashboard } from "@/components/dashboard"
import { isAuthenticated, getUserProfile } from "@/lib/api"

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedBotId, setSelectedBotId] = useState<string>("wellness")
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/auth")
      return
    }
    
    if (!location.state?.botId) {
      navigate("/dashboard", { replace: true })
      return
    }

    if (location.state?.botId) {
      setSelectedBotId(location.state.botId)
    }

    // Pick up any pre-filled prompt from navigation state
    if (location.state?.initialPrompt) {
      setInitialPrompt(location.state.initialPrompt)
    }
  }, [navigate, location.state])

  if (!isAuthenticated()) return null

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        <Dashboard
          onBotChange={setSelectedBotId}
          selectedBotId={selectedBotId}
          initialPrompt={initialPrompt}
          onInitialPromptConsumed={() => setInitialPrompt(undefined)}
        />
      </div>
    </div>
  )
}

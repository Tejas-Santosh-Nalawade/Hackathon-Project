import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const navigate = useNavigate()

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

  return <Dashboard />
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Volume2, VolumeX, Loader2, Play, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getVoiceAgent } from "@/lib/voice-agent"
import { GuidedSessionModal } from "@/components/guided-session-modal"
import { getSessionsForBot, type GuidedSession } from "@/lib/guided-sessions"
import type { Bot } from "@/lib/types"
import { cn } from "@/lib/utils"

interface VoiceAvatarProps {
  bot: Bot | null
  onSendMessage?: (message: string) => void
}

// Agent-specific cards configuration
const agentCards = {
  wellness: [
    {
      type: "PHYSICAL",
      title: "Sitting Neck Relief",
      duration: "2 min",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      cta: "Begin gently",
    },
    {
      type: "MENTAL",
      title: "Box Breathing",
      duration: "3 min",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-300",
      cta: "Guide me",
    },
    {
      type: "EYES",
      title: "Eye Yoga",
      duration: "1 min",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      cta: "Let's try",
    },
    {
      type: "POSTURE",
      title: "Desk Stretches",
      duration: "3 min",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      cta: "Start now",
    },
  ],
  planner: [
    {
      type: "TODAY",
      title: "Optimize My Day",
      duration: "5 min",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      cta: "Plan now",
    },
    {
      type: "BALANCE",
      title: "Work-Life Balance Check",
      duration: "3 min",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-300",
      cta: "Review",
    },
    {
      type: "BUFFER",
      title: "Add Buffer Time",
      duration: "2 min",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      cta: "Adjust schedule",
    },
    {
      type: "GOALS",
      title: "Set Daily Goals",
      duration: "4 min",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      cta: "Set goals",
    },
  ],
  speakup: [
    {
      type: "SUPPORT",
      title: "Private Conversation",
      duration: "Anytime",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      cta: "Talk privately",
    },
    {
      type: "RESOURCES",
      title: "Safety Resources",
      duration: "Quick view",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-300",
      cta: "View options",
    },
    {
      type: "HELPLINE",
      title: "Emergency Contacts",
      duration: "24/7",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      cta: "Quick access",
    },
    {
      type: "DOCUMENT",
      title: "Document Incident",
      duration: "Secure",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      cta: "Start recording",
    },
  ],
  upskill: [
    {
      type: "COURSES",
      title: "Recommended Courses",
      duration: "4-6 weeks",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      cta: "Browse",
    },
    {
      type: "SKILLS",
      title: "Skill Gap Analysis",
      duration: "10 min",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-300",
      cta: "Analyze",
    },
    {
      type: "RESUME",
      title: "Resume Review",
      duration: "15 min",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      cta: "Improve",
    },
    {
      type: "INTERVIEW",
      title: "Mock Interview",
      duration: "20 min",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      cta: "Practice",
    },
  ],
  finance: [
    {
      type: "BUDGET",
      title: "50/30/20 Budget",
      duration: "5 min",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      cta: "Set up",
    },
    {
      type: "SAVINGS",
      title: "Savings Goal Tracker",
      duration: "Quick check",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-300",
      cta: "Track progress",
    },
    {
      type: "TAX",
      title: "Tax Planning (India)",
      duration: "10 min",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      cta: "Plan ahead",
    },
    {
      type: "INVEST",
      title: "Investment Basics",
      duration: "8 min",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      cta: "Learn more",
    },
  ],
}

export function VoiceAvatar({ bot, onSendMessage }: VoiceAvatarProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [currentSession, setCurrentSession] = useState<GuidedSession | null>(null)
  const voiceAgentRef = useRef(getVoiceAgent())

  // Welcome message when component mounts - Agent specific
  useEffect(() => {
    if (bot?.bot_id && voiceEnabled) {
      let welcomeMsg = ""
      
      switch (bot.bot_id) {
        case "wellness":
          welcomeMsg = "Hi! I'm FitHer. Tell me what's bothering you - neck pain, stress, tired eyes?"
          break
        case "finance":
          welcomeMsg = "Hi! I'm PaisaWise. How can I help with your finances today?"
          break
        case "planner":
          welcomeMsg = "Hello! I'm PlanPal. Tell me about your day and I'll help organize it."
          break
        case "speakup":
          welcomeMsg = "Hi, I'm SpeakUp. This is a safe space. Share what you need."
          break
        case "upskill":
          welcomeMsg = "Hey! I'm GrowthGuru. Tell me your career goals!"
          break
        default:
          welcomeMsg = "Hello! Tap the microphone to start."
      }
      
      voiceAgentRef.current.speak(welcomeMsg)
      setResponse(welcomeMsg)
      setIsSpeaking(true)
      setTimeout(() => setIsSpeaking(false), 5000)
    }
  }, [bot?.bot_id, voiceEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceAgentRef.current.stopListening()
      voiceAgentRef.current.stopSpeaking()
    }
  }, [])

  const handleMicClick = () => {
    if (isListening) {
      // Stop listening
      voiceAgentRef.current.stopListening()
      setIsListening(false)
    } else {
      // Start listening
      setIsListening(true)
      setTranscript("")
      setResponse("")

      voiceAgentRef.current.listen(
        (text, isFinal) => {
          setTranscript(text)
        },
        async (finalText) => {
          setIsListening(false)
          setTranscript(finalText)
          
          // Send user message to chat window
          if (onSendMessage && finalText) {
            onSendMessage(finalText)
          }
          
          // Process with backend and speak response
          setIsSpeaking(true)
          await voiceAgentRef.current.converse(finalText, (aiResponse) => {
            setResponse(aiResponse)
          })
          setIsSpeaking(false)
        }
      )
    }
  }

  const handleStopSpeaking = () => {
    voiceAgentRef.current.stopSpeaking()
    setIsSpeaking(false)
  }

  const toggleVoice = () => {
    if (voiceEnabled && isSpeaking) {
      voiceAgentRef.current.stopSpeaking()
      setIsSpeaking(false)
    }
    setVoiceEnabled(!voiceEnabled)
  }

  return (
    <div className="flex flex-col items-center justify-start w-full h-full py-4 relative">
      {/* Voice Enable/Disable Toggle - Top Right */}
      <button
        onClick={toggleVoice}
        className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-[oklch(0.85_0.08_175)] transition-all duration-300 group z-10"
        title={voiceEnabled ? "Voice enabled - Click to disable" : "Voice disabled - Click to enable"}
      >
        {voiceEnabled ? (
          <Volume2 className="w-5 h-5 text-[oklch(0.50_0.15_175)]" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {/* Avatar - Compact and Central */}
      <div className="relative mb-3">
        {/* Animated Glow */}
        <div
          className={`absolute inset-0 bg-[oklch(0.85_0.08_175)] rounded-full blur-2xl transition-all duration-1000 ${
            isListening || isSpeaking ? "opacity-70 scale-110 animate-pulse" : "opacity-40 scale-100"
          }`}
        />

        {/* Avatar Image */}
        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl flex items-center justify-center bg-linear-to-br from-teal-100 to-blue-100">
          <img
            src="/avatar-ai.jpg"
            alt={`${bot?.title || 'AI'} Voice Assistant`}
            className="w-full h-full object-cover"
          />

          {/* Voice Activity Indicator */}
          {isListening && (
            <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                <Mic className="w-10 h-10 text-white" />
              </div>
            </div>
          )}

          {isSpeaking && (
            <div className="absolute inset-0 bg-[oklch(0.85_0.08_175)]/30 backdrop-blur-[1px] flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[oklch(0.50_0.15_175)] flex items-center justify-center animate-pulse">
                <Volume2 className="w-10 h-10 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center mb-3 min-h-16 max-w-xl px-4">
        {isListening && (
          <div className="space-y-2">
            <p className="text-lg font-medium text-red-600 animate-pulse">🎤 Listening...</p>
            {transcript && (
              <p className="text-sm text-muted-foreground italic">"{transcript}"</p>
            )}
          </div>
        )}

        {isSpeaking && (
          <div className="space-y-2">
            <p className="text-lg font-medium text-[oklch(0.50_0.15_175)] animate-pulse">
              {bot?.title || 'AI'} is speaking...
            </p>
            {response && (
              <p className="text-sm text-foreground leading-relaxed">"{response}"</p>
            )}
          </div>
        )}

        {!isListening && !isSpeaking && response && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Response:</p>
            <p className="text-sm text-foreground leading-relaxed">"{response}"</p>
          </div>
        )}

        {!isListening && !isSpeaking && !response && (
          <div className="space-y-2">
            <p className="text-xl font-medium text-foreground">Ready to help!</p>
            <p className="text-sm text-muted-foreground">
              Tap the microphone below and {bot?.bot_id === 'wellness' ? "tell me what's bothering you" : bot?.bot_id === 'finance' ? 'ask me about your finances' : bot?.bot_id === 'planner' ? 'tell me about your day' : bot?.bot_id === 'speakup' ? 'share what you need to talk about' : 'tell me what you need'}
            </p>
          </div>
        )}
      </div>

      {/* Voice Controls */}
      <div className="flex gap-3 items-center mb-3">
        {/* Main Mic Button */}
        <Button
          size="lg"
          onClick={handleMicClick}
          disabled={isSpeaking || !voiceEnabled}
          className={`w-16 h-16 rounded-full shadow-lg transition-all ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-[oklch(0.50_0.15_175)] hover:bg-[oklch(0.45_0.15_175)]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isListening ? "Stop listening" : "Start speaking"}
        >
          {isListening ? (
            <MicOff className="w-7 h-7 text-white" />
          ) : (
            <Mic className="w-7 h-7 text-white" />
          )}
        </Button>

        {/* Stop Speaking Button */}
        {isSpeaking && (
          <Button
            size="lg"
            variant="outline"
            onClick={handleStopSpeaking}
            className="w-14 h-14 rounded-full border-2 hover:border-red-500 hover:text-red-500 transition-all"
            title="Stop speaking"
          >
            <VolumeX className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center max-w-md px-4 mb-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isListening
            ? `Speak clearly. ${bot?.bot_id === 'wellness' ? 'Tell me about pain or stress.' : bot?.bot_id === 'finance' ? 'Ask about budgeting.' : bot?.bot_id === 'planner' ? 'Describe your tasks.' : bot?.bot_id === 'speakup' ? 'Share your concerns.' : 'Tell me what you need.'}`
            : `Tap the mic to speak OR type in the chat box below`
          }
        </p>
      </div>

      {/* Agent-Specific Quick Actions */}
      {!isListening && !isSpeaking && bot && (
        <div className="w-full max-w-2xl px-4">
          <div className="bg-white rounded-xl border-2 border-teal-200 shadow-md p-4">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xl">{bot.icon_emoji || '✨'}</span>
              <h3 className="text-base font-bold text-gray-900">
                {bot.bot_id === 'wellness' && 'Wellness Actions'}
                {bot.bot_id === 'planner' && "Today's Schedule"}
                {bot.bot_id === 'speakup' && 'Support Resources'}
                {bot.bot_id === 'upskill' && 'Career Growth'}
                {bot.bot_id === 'finance' && 'Financial Tools'}
              </h3>
            </div>
            
            {/* Quick Action Cards */}
            <div className="grid grid-cols-2 gap-3">
              {bot.bot_id && agentCards[bot.bot_id as keyof typeof agentCards]?.map((card) => (
                <button
                  key={card.title}
                  onClick={() => {
                    // For wellness, try to match with guided sessions
                    if (bot.bot_id === 'wellness') {
                      const sessions = getSessionsForBot(bot.bot_id)
                      const matchingSession = sessions.find(s => 
                        s.title.toLowerCase().includes(card.title.toLowerCase().split(' ')[0])
                      )
                      if (matchingSession) {
                        setCurrentSession(matchingSession)
                        setIsSessionModalOpen(true)
                        return
                      }
                    }
                    // For other agents, trigger voice message
                    if (onSendMessage) {
                      onSendMessage(`I want to ${card.cta.toLowerCase()} for ${card.title}`)
                    }
                  }}
                  className={cn(
                    "flex flex-col gap-2 px-3 py-3 text-left rounded-xl border-2 hover:shadow-md transition-all",
                    card.bgColor,
                    card.borderColor,
                    "hover:scale-[1.02]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", card.color)}>
                      {card.type}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-medium">{card.duration}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">{card.title}</p>
                  <span className={cn("text-xs font-medium", card.color)}>{card.cta}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Guided Session Modal */}
      {currentSession && (
        <GuidedSessionModal
          isOpen={isSessionModalOpen}
          onClose={() => {
            setIsSessionModalOpen(false)
            setCurrentSession(null)
          }}
          botId={bot?.bot_id || ""}
          botTitle={bot?.title || ""}
          sessionType={currentSession.title}
          steps={currentSession.steps}
        />
      )}
    </div>
  )
}

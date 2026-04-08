"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, Volume2, VolumeX, Square, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getVoiceAgent, cancelAllVoice } from "@/lib/voice-agent"
import { GuidedSessionModal } from "@/components/guided-session-modal"
import { getSessionsForBot, type GuidedSession } from "@/lib/guided-sessions"
import type { Bot } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AnimatedAvatar } from "@/components/animated-avatar"

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
  const prevBotIdRef = useRef<string | undefined>(undefined)

  // ── CRITICAL: Cancel ALL voice when agent changes ──
  useEffect(() => {
    const currentBotId = bot?.bot_id

    // If bot changed, cancel everything from the previous session
    if (prevBotIdRef.current !== undefined && prevBotIdRef.current !== currentBotId) {
      console.log(`[Voice] Agent switched: ${prevBotIdRef.current} → ${currentBotId}. Cancelling all voice.`)
      cancelAllVoice()
      setIsSpeaking(false)
      setIsListening(false)
      setTranscript("")
      setResponse("")
    }

    prevBotIdRef.current = currentBotId
  }, [bot?.bot_id])

  // Welcome message when bot changes — only ONCE per bot per session
  useEffect(() => {
    if (!bot?.bot_id || !voiceEnabled) return

    // Check if we've already greeted this bot in this browser session
    const greetedKey = `voice_greeted_${bot.bot_id}`
    if (sessionStorage.getItem(greetedKey)) return

    // Mark as greeted immediately so re-renders don't trigger again
    sessionStorage.setItem(greetedKey, "1")

    const timer = setTimeout(() => {
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
      
      setResponse(welcomeMsg)
      setIsSpeaking(true)
      
      voiceAgentRef.current.speak(welcomeMsg, () => {
        setIsSpeaking(false)
      })
    }, 200)

    return () => clearTimeout(timer)
  }, [bot?.bot_id, voiceEnabled])

  // Cleanup on unmount — cancel everything
  useEffect(() => {
    return () => {
      cancelAllVoice()
    }
  }, [])

  const handleMicClick = () => {
    if (isListening) {
      // Stop listening
      voiceAgentRef.current.stopListening()
      setIsListening(false)
    } else {
      // Stop any current speech before listening
      if (isSpeaking) {
        voiceAgentRef.current.stopSpeaking()
        setIsSpeaking(false)
      }
      
      // Start listening
      setIsListening(true)
      setTranscript("")
      setResponse("")

      voiceAgentRef.current.listen(
        (text, _isFinal) => {
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

  const handleStopSpeaking = useCallback(() => {
    cancelAllVoice()
    setIsSpeaking(false)
    setIsListening(false)
  }, [])

  const toggleVoice = () => {
    if (voiceEnabled) {
      // Turning voice OFF — stop everything
      cancelAllVoice()
      setIsSpeaking(false)
      setIsListening(false)
    }
    setVoiceEnabled(!voiceEnabled)
  }

  return (
    <div className="flex flex-col items-center justify-start w-full h-full py-2 md:py-4 px-2 md:px-4 relative overflow-y-auto">
      {/* Voice Enable/Disable Toggle - Top Right */}
      <button
        onClick={toggleVoice}
        className="absolute top-1 right-1 md:top-2 md:right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-[oklch(0.85_0.08_175)] transition-all duration-300 group z-10"
        title={voiceEnabled ? "Voice enabled - Click to mute" : "Voice muted - Click to enable"}
      >
        {voiceEnabled ? (
          <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-[oklch(0.50_0.15_175)]" />
        ) : (
          <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        )}
      </button>
      
      {/* Animated AI Avatar */}
      <div className="relative mb-2 md:mb-3">
        <AnimatedAvatar
          isSpeaking={isSpeaking}
          agentId={bot?.bot_id}
          size="lg"
          exerciseMode={null}
        />

        {/* Listening overlay */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-red-500/80 flex items-center justify-center animate-pulse shadow-lg">
              <Mic className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center mb-2 md:mb-3 min-h-12 md:min-h-16 max-w-xl px-2 md:px-4">
        {isListening && (
          <div className="space-y-1 md:space-y-2">
            <p className="text-base md:text-lg font-medium text-red-600 animate-pulse">🎤 Listening...</p>
            {transcript && (
              <p className="text-xs md:text-sm text-muted-foreground italic">"{transcript}"</p>
            )}
          </div>
        )}

        {isSpeaking && (
          <div className="space-y-1 md:space-y-2">
            <p className="text-base md:text-lg font-medium text-[oklch(0.50_0.15_175)] animate-pulse">
              {bot?.title || 'AI'} is speaking...
            </p>
            {response && (
              <p className="text-xs md:text-sm text-foreground leading-relaxed">"{response}"</p>
            )}
          </div>
        )}

        {!isListening && !isSpeaking && response && (
          <div className="space-y-1 md:space-y-2">
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">Last Response:</p>
            <p className="text-xs md:text-sm text-foreground leading-relaxed">"{response}"</p>
          </div>
        )}

        {!isListening && !isSpeaking && !response && (
          <div className="space-y-1 md:space-y-2">
            <p className="text-lg md:text-xl font-medium text-foreground">Ready to help!</p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Tap the microphone below and {bot?.bot_id === 'wellness' ? "tell me what's bothering you" : bot?.bot_id === 'finance' ? 'ask me about your finances' : bot?.bot_id === 'planner' ? 'tell me about your day' : bot?.bot_id === 'speakup' ? 'share what you need to talk about' : 'tell me what you need'}
            </p>
          </div>
        )}
      </div>

      {/* Voice Controls */}
      <div className="flex gap-2 md:gap-3 items-center mb-2 md:mb-3">
        {/* Main Mic Button */}
        <Button
          size="lg"
          onClick={handleMicClick}
          disabled={isSpeaking || !voiceEnabled}
          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg transition-all ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-[oklch(0.50_0.15_175)] hover:bg-[oklch(0.45_0.15_175)]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isListening ? "Stop listening" : "Start speaking"}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
          ) : (
            <Mic className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
          )}
        </Button>

        {/* Prominent STOP Button — visible whenever voice is active */}
        {(isSpeaking || isListening) && (
          <Button
            size="lg"
            onClick={handleStopSpeaking}
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg bg-red-500 hover:bg-red-600 text-white transition-all animate-pulse"
            title="Stop everything"
          >
            <Square className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 fill-white" />
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center max-w-md px-2 md:px-4 mb-2 md:mb-3">
        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
          {isListening
            ? `Speak clearly. ${bot?.bot_id === 'wellness' ? 'Tell me about pain or stress.' : bot?.bot_id === 'finance' ? 'Ask about budgeting.' : bot?.bot_id === 'planner' ? 'Describe your tasks.' : bot?.bot_id === 'speakup' ? 'Share your concerns.' : 'Tell me what you need.'}`
            : isSpeaking
            ? 'Tap the red stop button to stop speaking'
            : `Tap the mic to speak OR type in the chat box below`
          }
        </p>
      </div>

      {/* Agent-Specific Quick Actions */}
      {!isListening && !isSpeaking && bot && (
        <div className="w-full max-w-2xl px-2 md:px-4">
          <div className="bg-white rounded-lg md:rounded-xl border-2 border-teal-200 shadow-md p-3 md:p-4">
            {/* Header */}
            <div className="flex items-center justify-center gap-1 md:gap-2 mb-2 md:mb-3">
              <span className="text-lg md:text-xl">{bot.icon_emoji || '✨'}</span>
              <h3 className="text-sm md:text-base font-bold text-gray-900">
                {bot.bot_id === 'wellness' && 'Wellness Actions'}
                {bot.bot_id === 'planner' && "Today's Schedule"}
                {bot.bot_id === 'speakup' && 'Support Resources'}
                {bot.bot_id === 'upskill' && 'Career Growth'}
                {bot.bot_id === 'finance' && 'Financial Tools'}
              </h3>
            </div>
            
            {/* Quick Action Cards */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
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
                    "flex flex-col gap-1 md:gap-2 px-2 py-2 md:px-3 md:py-3 text-left rounded-lg md:rounded-xl border-2 hover:shadow-md transition-all",
                    card.bgColor,
                    card.borderColor,
                    "hover:scale-[1.02]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[8px] md:text-[10px] font-bold uppercase tracking-wider", card.color)}>
                      {card.type}
                    </span>
                    <div className="flex items-center gap-0.5 md:gap-1 text-gray-500">
                      <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      <span className="text-[8px] md:text-[10px] font-medium">{card.duration}</span>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2">{card.title}</p>
                  <span className={cn("text-[10px] md:text-xs font-medium", card.color)}>{card.cta}</span>
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

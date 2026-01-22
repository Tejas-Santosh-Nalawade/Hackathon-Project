"use client"

import React, { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Volume2, VolumeX, Loader2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getVoiceAgent } from "@/lib/voice-agent"
import { GuidedSessionModal } from "@/components/guided-session-modal"
import { getSessionsForBot, type GuidedSession } from "@/lib/guided-sessions"
import type { Bot } from "@/lib/types"

interface VoiceAvatarProps {
  bot: Bot | null
  onSendMessage?: (message: string) => void
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
    <div className="flex flex-col items-center justify-center h-full p-8 relative">
      {/* Voice Enable/Disable Toggle - Top Right */}
      <button
        onClick={toggleVoice}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-[oklch(0.85_0.08_175)] transition-all duration-300 group z-10"
        title={voiceEnabled ? "Voice enabled - Click to disable" : "Voice disabled - Click to enable"}
      >
        {voiceEnabled ? (
          <Volume2 className="w-6 h-6 text-[oklch(0.50_0.15_175)]" />
        ) : (
          <VolumeX className="w-6 h-6 text-gray-400" />
        )}
      </button>
      {/* Avatar - Large and Central */}
      <div className="relative mb-8">
        {/* Animated Glow */}
        <div
          className={`absolute inset-0 bg-[oklch(0.85_0.08_175)] rounded-full blur-3xl transition-all duration-1000 ${
            isListening || isSpeaking ? "opacity-70 scale-110 animate-pulse" : "opacity-40 scale-100"
          }`}
        />

        {/* Avatar Image */}
        <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-2xl flex items-center justify-center bg-gradient-to-br from-teal-100 to-blue-100">
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
      <div className="text-center mb-6 min-h-[120px] max-w-2xl">
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
      <div className="flex gap-4 items-center">
        {/* Main Mic Button */}
        <Button
          size="lg"
          onClick={handleMicClick}
          disabled={isSpeaking || !voiceEnabled}
          className={`w-20 h-20 rounded-full shadow-lg transition-all ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-[oklch(0.50_0.15_175)] hover:bg-[oklch(0.45_0.15_175)]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isListening ? "Stop listening" : "Start speaking"}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </Button>

        {/* Stop Speaking Button - Always visible when speaking */}
        {isSpeaking && (
          <Button
            size="lg"
            variant="outline"
            onClick={handleStopSpeaking}
            className="w-16 h-16 rounded-full border-2 hover:border-red-500 hover:text-red-500 transition-all"
            title="Stop speaking"
          >
            <VolumeX className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isListening
            ? `Speak clearly. ${bot?.bot_id === 'wellness' ? 'Tell me about pain or stress areas.' : bot?.bot_id === 'finance' ? 'Ask about budgeting or savings.' : bot?.bot_id === 'planner' ? 'Describe your tasks and schedule.' : bot?.bot_id === 'speakup' ? 'Share your concerns freely.' : 'Tell me what you need help with.'}`
            : `Tap a guided session below or use the microphone to talk with me`
          }
        </p>
      </div>

      {/* Guided Sessions - Agent Specific */}
      {!isListening && !isSpeaking && bot && (
        <div className="mt-6 w-full max-w-2xl">
          <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 rounded-2xl border-2 border-pink-200 shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-2xl">💝</span>
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
                Wellness Sessions for You
              </h3>
            </div>
            
            {/* Sessions Grid - No Scrolling */}
            <div className="grid grid-cols-1 gap-4">
              {getSessionsForBot(bot.bot_id).map((session, index) => (
                <button
                  key={session.id}
                  onClick={() => {
                    setCurrentSession(session)
                    setIsSessionModalOpen(true)
                  }}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left bg-white border-2 border-pink-300 rounded-xl hover:bg-gradient-to-r hover:from-pink-100 hover:via-purple-100 hover:to-rose-100 hover:border-purple-400 hover:shadow-xl transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-purple-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-800 group-hover:text-purple-700 transition-colors mb-1">
                      {session.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="text-pink-500">✨</span>
                        {session.steps.length} steps
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-purple-500">🎵</span>
                        Voice guided
                      </span>
                    </div>
                  </div>
                  <Play className="flex-shrink-0 w-8 h-8 text-pink-500 group-hover:text-purple-600 group-hover:scale-125 transition-transform" />
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

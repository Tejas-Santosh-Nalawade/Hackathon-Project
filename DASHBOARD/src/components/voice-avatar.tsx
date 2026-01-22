"use client"

import React, { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getVoiceAgent } from "@/lib/voice-agent"
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
  const voiceAgentRef = useRef(getVoiceAgent())

  // Welcome message when component mounts - Agent specific
  useEffect(() => {
    if (bot?.bot_id && voiceEnabled) {
      let welcomeMsg = ""
      
      switch (bot.bot_id) {
        case "wellness":
          welcomeMsg = "Hi! I'm FitHer, your wellness companion. Just tap the microphone and tell me what's bothering you. I'm listening."
          break
        case "finance":
          welcomeMsg = "Namaste! I'm PaisaWise, your financial advisor. Tell me about your savings goals or budget questions."
          break
        case "planner":
          welcomeMsg = "Hello! I'm PlanPal, your time management assistant. Tell me about your day and I'll help you organize it."
          break
        case "speakup":
          welcomeMsg = "Hi, I'm SpeakUp. This is a safe, private space. Share anything you need support with. I'm here to listen."
          break
        case "upskill":
          welcomeMsg = "Hey! I'm GrowthGuru, your career coach. Tell me about your career goals or skills you want to develop."
          break
        default:
          welcomeMsg = "Hello! Tap the microphone to start our conversation."
      }
      
      voiceAgentRef.current.speak(welcomeMsg)
      setResponse(welcomeMsg)
      setIsSpeaking(true)
      setTimeout(() => setIsSpeaking(false), 8000)
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
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isListening
            ? `Speak clearly. ${bot?.bot_id === 'wellness' ? 'Tell me about pain or stress areas.' : bot?.bot_id === 'finance' ? 'Ask about budgeting or savings.' : bot?.bot_id === 'planner' ? 'Describe your tasks and schedule.' : bot?.bot_id === 'speakup' ? 'Share your concerns freely.' : 'Tell me what you need help with.'}`
            : `Example: ${bot?.bot_id === 'wellness' ? "Say 'My neck hurts' or 'I'm stressed'" : bot?.bot_id === 'finance' ? "Say 'Help me budget' or 'Savings plan'" : bot?.bot_id === 'planner' ? "Say 'Plan my day' or 'Schedule meeting'" : bot?.bot_id === 'speakup' ? "Say 'I need to talk' or 'Safety concern'" : "Say 'I need help with...'"}`
          }
        </p>
      </div>

      {/* Quick Voice Commands - Agent Specific */}
      {!isListening && !isSpeaking && (
        <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
          {bot?.bot_id === 'wellness' && (
            <>
              <button
                onClick={() => {
                  const msg = "My neck hurts"
                  setTranscript(msg)
                  if (onSendMessage) onSendMessage(msg)
                  voiceAgentRef.current.converse(msg, (res) => {
                    setResponse(res)
                  })
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "My neck hurts"
              </button>
              <button
                onClick={() => {
                  const msg = "I'm stressed"
                  setTranscript(msg)
                  if (onSendMessage) onSendMessage(msg)
                  voiceAgentRef.current.converse(msg, (res) => {
                    setResponse(res)
                  })
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "I'm stressed"
              </button>
              <button
                onClick={() => {
                  const msg = "My eyes are tired"
                  setTranscript(msg)
                  if (onSendMessage) onSendMessage(msg)
                  voiceAgentRef.current.converse(msg, (res) => {
                    setResponse(res)
                  })
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Eyes tired"
              </button>
              <button
                onClick={() => {
                  const msg = "Shoulder pain"
                  setTranscript(msg)
                  if (onSendMessage) onSendMessage(msg)
                  voiceAgentRef.current.converse(msg, (res) => {
                    setResponse(res)
                  })
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Shoulder pain"
              </button>
            </>
          )}
          
          {bot?.bot_id === 'finance' && (
            <>
              <button
                onClick={() => {
                  setTranscript("Help me budget")
                  voiceAgentRef.current.converse("Help me budget my monthly expenses", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Help me budget"
              </button>
              <button
                onClick={() => {
                  setTranscript("Savings plan")
                  voiceAgentRef.current.converse("I want to start a savings plan", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Savings plan"
              </button>
              <button
                onClick={() => {
                  setTranscript("Tax planning")
                  voiceAgentRef.current.converse("Help me with tax planning", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Tax planning"
              </button>
              <button
                onClick={() => {
                  setTranscript("Track expenses")
                  voiceAgentRef.current.converse("How can I track my expenses better", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Track expenses"
              </button>
            </>
          )}
          
          {bot?.bot_id === 'planner' && (
            <>
              <button
                onClick={() => {
                  setTranscript("Plan my day")
                  voiceAgentRef.current.converse("Help me plan my day", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Plan my day"
              </button>
              <button
                onClick={() => {
                  setTranscript("Balance work-life")
                  voiceAgentRef.current.converse("Help me balance work and life", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Balance work-life"
              </button>
              <button
                onClick={() => {
                  setTranscript("Add buffer time")
                  voiceAgentRef.current.converse("I need buffer time in my schedule", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Add buffer time"
              </button>
              <button
                onClick={() => {
                  setTranscript("Prioritize tasks")
                  voiceAgentRef.current.converse("Help me prioritize my tasks", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Prioritize tasks"
              </button>
            </>
          )}
          
          {bot?.bot_id === 'speakup' && (
            <>
              <button
                onClick={() => {
                  setTranscript("Need to talk")
                  voiceAgentRef.current.converse("I need someone to talk to", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Need to talk"
              </button>
              <button
                onClick={() => {
                  setTranscript("Safety resources")
                  voiceAgentRef.current.converse("What safety resources are available", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Safety resources"
              </button>
              <button
                onClick={() => {
                  setTranscript("Need support")
                  voiceAgentRef.current.converse("I need support", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Need support"
              </button>
              <button
                onClick={() => {
                  setTranscript("Private conversation")
                  voiceAgentRef.current.converse("I need a private conversation", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Private talk"
              </button>
            </>
          )}
          
          {bot?.bot_id === 'upskill' && (
            <>
              <button
                onClick={() => {
                  setTranscript("Course recommendations")
                  voiceAgentRef.current.converse("Recommend courses for me", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Course recommendations"
              </button>
              <button
                onClick={() => {
                  setTranscript("Skill gap analysis")
                  voiceAgentRef.current.converse("Analyze my skill gaps", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Skill gap analysis"
              </button>
              <button
                onClick={() => {
                  setTranscript("Resume help")
                  voiceAgentRef.current.converse("Help me improve my resume", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Resume help"
              </button>
              <button
                onClick={() => {
                  setTranscript("Career goals")
                  voiceAgentRef.current.converse("Help me set career goals", (res) => setResponse(res))
                }}
                className="px-4 py-2 text-xs bg-card border border-border rounded-lg hover:bg-accent transition-colors"
              >
                "Career goals"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

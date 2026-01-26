"use client"

import React, { useState, useEffect } from "react"
import { X, Volume2, VolumeX, CheckCircle2, Circle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getVoiceAgent } from "@/lib/voice-agent"

interface Step {
  id: number
  instruction: string
  duration: number
}

interface GuidedSessionModalProps {
  isOpen: boolean
  onClose: () => void
  botId: string
  botTitle: string
  sessionType: string
  steps: Step[]
}

export function GuidedSessionModal({
  isOpen,
  onClose,
  botId,
  botTitle,
  sessionType,
  steps,
}: GuidedSessionModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const voiceAgent = getVoiceAgent()

  useEffect(() => {
    if (isOpen && !isMuted) {
      // Welcome message
      const welcomeMsg = `Let's begin your ${sessionType} session. I'll guide you through ${steps.length} steps. Listen carefully and follow along.`
      voiceAgent.speak(welcomeMsg)
      setIsPlaying(true)
      
      setTimeout(() => {
        startStep(0)
      }, 5000)
    }

    return () => {
      voiceAgent.stopSpeaking()
    }
  }, [isOpen])

  const startStep = (stepIndex: number) => {
    if (stepIndex >= steps.length || isMuted) return

    setCurrentStep(stepIndex)
    setIsPlaying(true)
    
    const step = steps[stepIndex]
    voiceAgent.speak(step.instruction, () => {
      setIsPlaying(false)
      setCompletedSteps(prev => [...prev, step.id])
      
      // Auto-advance to next step after duration
      setTimeout(() => {
        if (stepIndex < steps.length - 1) {
          startStep(stepIndex + 1)
        } else {
          // Session complete
          const completeMsg = `Great job! You've completed the ${sessionType} session. How do you feel?`
          voiceAgent.speak(completeMsg)
        }
      }, step.duration * 1000)
    })
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false)
      voiceAgent.speak("Voice guidance enabled")
    } else {
      setIsMuted(true)
      voiceAgent.stopSpeaking()
    }
  }

  const handleSkipStep = () => {
    voiceAgent.stopSpeaking()
    if (currentStep < steps.length - 1) {
      startStep(currentStep + 1)
    }
  }

  const handleClose = () => {
    voiceAgent.stopSpeaking()
    setCurrentStep(0)
    setCompletedSteps([])
    setIsPlaying(false)
    onClose()
  }

  if (!isOpen) return null

  const progress = ((completedSteps.length) / steps.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 border-2 border-pink-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 p-6 text-white relative overflow-hidden shrink-0 z-20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-3xl font-bold tracking-tight">{sessionType}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMuteToggle}
                className="text-white hover:bg-white/20 rounded-xl transition-all hover:scale-110"
                title={isMuted ? "Unmute voice" : "Mute voice"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-xl transition-all hover:scale-110"
                title="Close session"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-white/95 text-base font-medium">Guided by {botTitle}</p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/90 mb-2 font-medium">
              <span>Session Progress</span>
              <span className="bg-white/20 px-3 py-0.5 rounded-full">{completedSteps.length} of {steps.length} completed</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-white rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          </div>
        </div>

        {/* Avatar Demonstration Area */}
        <div className="bg-linear-to-br from-pink-50 via-purple-50 to-white p-4 border-b-2 border-pink-200 shrink-0">
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-2">
              {/* Animated Avatar Circle */}
              <div className={`w-20 h-20 rounded-full bg-linear-to-br from-pink-300 via-purple-300 to-rose-300 flex items-center justify-center shadow-2xl ${
                isPlaying ? 'animate-pulse' : ''
              }`}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <div className="text-3xl">
                    {isPlaying ? '🧘‍♀️' : '💃'}
                  </div>
                </div>
              </div>
              
              {/* Sound Wave Animation */}
              {isPlaying && (
                <div className="absolute -right-12 top-1/2 transform -translate-y-1/2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-pink-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 30 + 15}px`,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '0.8s'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-sm font-semibold text-purple-700">
            {isPlaying ? '🎵 Follow along with the movements...' : '💖 Ready to begin your wellness journey'}
            </p>
          </div>
        </div>

        {/* Steps Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-transparent to-muted/20 min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ec4899 #fce7f3' }}>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = currentStep === index
              const isPending = index > currentStep

              return (
                <div
                  key={step.id}
                  className={`flex gap-4 p-5 rounded-2xl transition-all duration-300 ${
                    isCurrent
                      ? "bg-gradient-to-r from-pink-100 via-purple-100 to-rose-100 border-2 border-pink-400 shadow-lg ring-2 ring-pink-300"
                      : isCompleted
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 shadow-sm"
                      : "bg-muted/30 border border-border/50 opacity-60"
                  }`}
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${
                        isCurrent ? "border-pink-500 bg-pink-100 animate-pulse" : "border-gray-300 bg-white"
                      }`}>
                        <span className={`text-base font-bold ${
                          isCurrent ? "text-pink-600" : "text-gray-400"
                        }`}>{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Step {index + 1}
                      </span>
                      {isCurrent && isPlaying && (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse shadow-md">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>🎵 Voice Guiding</span>
                        </div>
                      )}
                    </div>
                    <p className={`text-base leading-relaxed mb-3 ${
                      isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}>
                      {step.instruction}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full border border-pink-200 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-pink-500" />
                        <span className="font-semibold">{step.duration}s duration</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 flex justify-between items-center shrink-0">
          <div>
            {completedSteps.length === steps.length ? (
              <div className="flex items-center gap-2">
                <div className="text-2xl">🎉</div>
                <div>
                  <p className="text-base font-bold text-green-600">Session Completed!</p>
                  <p className="text-xs text-muted-foreground">Great job on completing all steps</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-foreground">Follow the voice guidance</p>
                <p className="text-xs text-muted-foreground mt-0.5">Listen carefully to each instruction</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {currentStep < steps.length - 1 && (
              <Button
                variant="outline"
                onClick={handleSkipStep}
                disabled={!isPlaying}
                className="border-2 hover:bg-muted font-semibold"
              >
                Skip Step →
              </Button>
            )}
            {completedSteps.length === steps.length && (
              <Button 
                onClick={handleClose} 
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 hover:from-pink-600 hover:via-purple-600 hover:to-rose-600 text-white font-bold shadow-lg hover:shadow-xl transition-all px-6 rounded-full"
              >
                ✓ Complete Session
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

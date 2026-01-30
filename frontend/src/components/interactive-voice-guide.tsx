"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react"
import { VoiceOutput } from "@/lib/voice-agent"
import { SpeakingAvatar } from "@/components/speaking-avatar"

interface InteractiveVoiceGuideProps {
  exerciseType: "box-breathing" | "neck-relief" | "deep-breathing"
  onComplete?: () => void
  onCancel?: () => void
}

interface BreathingStep {
  instruction: string
  duration: number
  countdown?: boolean
}

const BOX_BREATHING: BreathingStep[] = [
  { instruction: "Get comfortable. Relax your shoulders. We'll do Box Breathing together.", duration: 3 },
  { instruction: "Inhale slowly through your nose", duration: 4, countdown: true },
  { instruction: "Hold your breath", duration: 4, countdown: true },
  { instruction: "Exhale slowly through your mouth", duration: 4, countdown: true },
  { instruction: "Hold with empty lungs", duration: 4, countdown: true },
]

const NECK_RELIEF: BreathingStep[] = [
  { instruction: "Sit comfortably with feet flat on the floor", duration: 3 },
  { instruction: "Drop your right ear toward your right shoulder", duration: 5, countdown: true },
  { instruction: "Slowly return to center", duration: 2 },
  { instruction: "Drop your left ear toward your left shoulder", duration: 5, countdown: true },
  { instruction: "Return to center", duration: 2 },
  { instruction: "Roll your shoulders backward", duration: 5, countdown: true },
  { instruction: "Take a deep breath in and relax", duration: 3 },
]

const DEEP_BREATHING: BreathingStep[] = [
  { instruction: "Find a comfortable position and relax", duration: 3 },
  { instruction: "Breathe in deeply through your nose", duration: 4, countdown: true },
  { instruction: "Hold the breath", duration: 2, countdown: true },
  { instruction: "Exhale slowly through your mouth", duration: 4, countdown: true },
  { instruction: "Rest and breathe normally", duration: 2 },
]

export function InteractiveVoiceGuide({ 
  exerciseType, 
  onComplete, 
  onCancel 
}: InteractiveVoiceGuideProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [totalCycles] = useState(exerciseType === "box-breathing" ? 4 : 2)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const voiceRef = useRef<VoiceOutput | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const shouldContinueRef = useRef(false)

  const exercises = {
    "box-breathing": BOX_BREATHING,
    "neck-relief": NECK_RELIEF,
    "deep-breathing": DEEP_BREATHING,
  }

  const steps = exercises[exerciseType]

  useEffect(() => {
    voiceRef.current = new VoiceOutput()
    voiceRef.current.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking)
    })
    return () => {
      if (voiceRef.current) {
        voiceRef.current.stop()
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const speak = async (text: string, fast: boolean = false) => {
    if (voiceRef.current) {
      try {
        await voiceRef.current.speak(text, fast ? 1.4 : 1.25)
      } catch (error) {
        console.error("Speech error:", error)
      }
    }
  }

  const startExercise = async () => {
    setIsActive(true)
    shouldContinueRef.current = true
    setCurrentStepIndex(0)
    setCycleCount(0)
    await runStep(0, 0)
  }

  const runStep = async (stepIndex: number, cycle: number) => {
    // Check if we should stop
    if (!shouldContinueRef.current) {
      return
    }
    
    if (stepIndex >= steps.length) {
      // Cycle complete
      const nextCycle = cycle + 1
      if (nextCycle < totalCycles) {
        setCycleCount(nextCycle)
        // Start next cycle
        await speak(`Cycle ${nextCycle + 1}. Let's continue.`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        await runStep(0, nextCycle)
      } else {
        // All cycles complete
        await speak("Excellent work! You completed the exercise. Notice how much better you feel?")
        setIsActive(false)
        if (onComplete) {
          onComplete()
        }
      }
      return
    }

    const step = steps[stepIndex]
    setCurrentStepIndex(stepIndex)

    // Speak the instruction
    await speak(step.instruction)
    await new Promise(resolve => setTimeout(resolve, 200))

    if (step.countdown) {
      // Do countdown
      for (let i = step.duration; i > 0; i--) {
        setCountdown(i)
        if (i <= 4) {
          // Speak countdown faster
          await speak(i.toString(), true)
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      setCountdown(0)
    } else {
      // Just wait
      setCountdown(step.duration)
      await new Promise(resolve => setTimeout(resolve, step.duration * 1000))
      setCountdown(0)
    }

    // Move to next step
    await runStep(stepIndex + 1, cycle)
  }

  const stopExercise = () => {
    shouldContinueRef.current = false
    setIsActive(false)
    setCurrentStepIndex(0)
    setCountdown(0)
    if (voiceRef.current) {
      voiceRef.current.stop()
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  const resetExercise = () => {
    stopExercise()
    setCycleCount(0)
  }

  // Stop everything when component unmounts or guide closes
  useEffect(() => {
    return () => {
      shouldContinueRef.current = false
      if (voiceRef.current) {
        voiceRef.current.stop()
      }
      setIsActive(false)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-100 p-8 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
      {/* Exercise Header with Speaking Avatar */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Animated Speaking Avatar */}
          <SpeakingAvatar isSpeaking={isSpeaking} size="lg" />
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <Volume2 className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-semibold text-foreground">
            {exerciseType === "box-breathing" && "Box Breathing"}
            {exerciseType === "neck-relief" && "Neck Relief"}
            {exerciseType === "deep-breathing" && "Deep Breathing"}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Follow the voice guidance - I'll guide you through each step
        </p>
      </div>

      {/* Current Instruction */}
      {isActive && (
        <div className="text-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-purple-300 dark:border-purple-700 min-w-100">
            <p className="text-xl font-medium text-foreground mb-4">
              {steps[currentStepIndex]?.instruction}
            </p>
            
            {countdown > 0 && (
              <div className="mt-6">
                <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 animate-pulse">
                  {countdown}
                </div>
                <p className="text-sm text-muted-foreground mt-2">seconds</p>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">
              Cycle {cycleCount + 1} of {totalCycles}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4">
        {!isActive ? (
          <Button
            onClick={startExercise}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Guided Session
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                stopExercise()
                if (onCancel) onCancel()
              }}
              size="lg"
              variant="destructive"
              className="px-8 py-6 text-lg"
            >
              <Pause className="w-5 h-5 mr-2" />
              Stop
            </Button>
          </>
        )}

        {!isActive && cycleCount > 0 && (
          <Button
            onClick={resetExercise}
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Info */}
      {!isActive && (
        <div className="mt-8 text-center max-w-md">
          <p className="text-sm text-muted-foreground">
            💜 Make sure your volume is on. I'll speak the instructions and count down for you.
          </p>
        </div>
      )}
    </div>
  )
}

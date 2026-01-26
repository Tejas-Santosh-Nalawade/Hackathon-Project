"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, Volume2, VolumeX, Play, Pause } from "lucide-react"
import { VoiceGuide, playExerciseInstructions } from "@/lib/voice-instructions"

export interface Exercise {
  id: string
  title: string
  duration: string
  category: "neck" | "shoulders" | "breathing" | "eyes" | "wrists" | "back"
  steps: string[]
  benefits: string
  safetyNote?: string
}

export const SITTING_EXERCISES: Exercise[] = [
  {
    id: "neck-relief",
    title: "Sitting Neck Relief",
    duration: "2 min",
    category: "neck",
    steps: [
      "Sit upright with feet flat on the floor",
      "Slowly tilt your head to the right, hold for 5 seconds",
      "Return to center, then tilt left, hold for 5 seconds",
      "Roll your shoulders backward 5 times",
      "Take one deep inhale through nose, slow exhale through mouth",
    ],
    benefits: "Relieves neck tension from prolonged sitting",
    safetyNote: "Move slowly, never force the stretch",
  },
  {
    id: "shoulder-stretch",
    title: "Shoulder & Upper Back Stretch",
    duration: "3 min",
    category: "shoulders",
    steps: [
      "Sit tall, relax your shoulders down",
      "Bring right arm across your chest",
      "Hold it with your left hand, feel the stretch (20 seconds)",
      "Release and repeat with left arm",
      "Interlace fingers behind your back, gently lift arms",
      "Hold for 15 seconds while breathing deeply",
    ],
    benefits: "Reduces shoulder and upper back tension",
  },
  {
    id: "eye-relaxation",
    title: "Eye Relaxation for Screen Fatigue",
    duration: "1 min",
    category: "eyes",
    steps: [
      "Look away from your screen",
      "Focus on something 20 feet away for 20 seconds (20-20 rule)",
      "Close your eyes gently",
      "Cup your palms over your eyes without pressing",
      "Breathe slowly for 30 seconds in darkness",
      "Slowly open your eyes when ready",
    ],
    benefits: "Reduces eye strain and prevents digital eye fatigue",
  },
  {
    id: "box-breathing",
    title: "Box Breathing for Stress Relief",
    duration: "2 min",
    category: "breathing",
    steps: [
      "Sit comfortably, place hands on lap",
      "Inhale slowly through nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly through mouth for 4 counts",
      "Hold empty lungs for 4 counts",
      "Repeat 4-5 cycles",
    ],
    benefits: "Calms nervous system, reduces stress instantly",
    safetyNote: "If you feel dizzy, return to normal breathing",
  },
  {
    id: "wrist-relief",
    title: "Wrist & Hand Relief",
    duration: "2 min",
    category: "wrists",
    steps: [
      "Extend right arm forward, palm facing up",
      "Gently pull fingers back with left hand (15 seconds)",
      "Flip palm down, pull fingers toward you (15 seconds)",
      "Make tight fists, then spread fingers wide (repeat 10 times)",
      "Repeat entire sequence with left hand",
      "Shake both hands gently to finish",
    ],
    benefits: "Prevents carpal tunnel, improves circulation",
  },
  {
    id: "spine-twist",
    title: "Sitting Spine Twist",
    duration: "2 min",
    category: "back",
    steps: [
      "Sit with feet flat, spine tall",
      "Place right hand on back of chair",
      "Place left hand on right knee",
      "Gently twist to the right, hold 20 seconds",
      "Keep breathing normally",
      "Return to center, repeat on left side",
    ],
    benefits: "Releases lower back tension, improves spinal mobility",
    safetyNote: "Twist from the core, not just shoulders",
  },
]

interface ExerciseCardProps {
  exercise: Exercise
  onStart: (exercise: Exercise) => void
  isCompleted?: boolean
}

export function ExerciseCard({ exercise, onStart, isCompleted }: ExerciseCardProps) {
  const categoryColors = {
    neck: "bg-rose-100 text-rose-700",
    shoulders: "bg-blue-100 text-blue-700",
    breathing: "bg-teal-100 text-teal-700",
    eyes: "bg-amber-100 text-amber-700",
    wrists: "bg-purple-100 text-purple-700",
    back: "bg-green-100 text-green-700",
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${categoryColors[exercise.category]}`}>
          {exercise.category}
        </span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{exercise.duration}</span>
        </div>
      </div>

      <h3 className="font-medium text-foreground mb-2">{exercise.title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{exercise.benefits}</p>

      <Button
        size="sm"
        onClick={() => onStart(exercise)}
        className={`w-full ${isCompleted ? 'bg-teal-500 hover:bg-teal-600' : ''}`}
        disabled={isCompleted}
      >
        {isCompleted ? (
          <>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </>
        ) : (
          "Start Exercise"
        )}
      </Button>
    </div>
  )
}

interface ExerciseGuideProps {
  exercise: Exercise
  onComplete: () => void
  onClose: () => void
}

export function ExerciseGuide({ exercise, onComplete, onClose }: ExerciseGuideProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [voiceEnabled, setVoiceEnabled] = React.useState(true)
  const [isVoicePlaying, setIsVoicePlaying] = React.useState(false)
  const voiceGuideRef = React.useRef<VoiceGuide | null>(null)

  // Initialize voice guide
  React.useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      voiceGuideRef.current = new VoiceGuide()
    }
    
    return () => {
      if (voiceGuideRef.current) {
        voiceGuideRef.current.stop()
      }
    }
  }, [])

  // Auto-play with voice guidance
  React.useEffect(() => {
    if (isPlaying && voiceEnabled && voiceGuideRef.current) {
      setIsVoicePlaying(true)
      playExerciseInstructions(exercise.id, voiceGuideRef.current, setCurrentStep)
        .then(() => {
          setIsPlaying(false)
          setIsVoicePlaying(false)
          setCurrentStep(exercise.steps.length - 1)
        })
        .catch((error) => {
          console.error("Voice guidance error:", error)
          setIsPlaying(false)
          setIsVoicePlaying(false)
        })
    } else if (isPlaying && !voiceEnabled) {
      // Manual step-through without voice
      const timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= exercise.steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 8000) // 8 seconds per step

      return () => clearInterval(timer)
    }
  }, [isPlaying, voiceEnabled, exercise.steps.length, exercise.id])

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (voiceGuideRef.current && isVoicePlaying) {
        voiceGuideRef.current.stop()
        setIsVoicePlaying(false)
      }
    } else {
      setIsPlaying(true)
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (voiceGuideRef.current && isVoicePlaying) {
      voiceGuideRef.current.stop()
      setIsVoicePlaying(false)
      setIsPlaying(false)
    }
  }

  const handleComplete = () => {
    if (voiceGuideRef.current) {
      voiceGuideRef.current.stop()
    }
    onComplete()
    onClose()
  }

  const handleClose = () => {
    if (voiceGuideRef.current) {
      voiceGuideRef.current.stop()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-1">{exercise.title}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {exercise.duration}
              </span>
              {voiceEnabled && (
                <span className="flex items-center gap-1 text-[oklch(0.50_0.15_175)]">
                  <Volume2 className="w-4 h-4" />
                  Voice guidance enabled
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              title={voiceEnabled ? "Disable voice" : "Enable voice"}
              className="hover:bg-accent"
            >
              {voiceEnabled ? (
                <Volume2 className="w-5 h-5 text-[oklch(0.50_0.15_175)]" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
            <Button variant="ghost" onClick={handleClose}>
              ✕
            </Button>
          </div>
        </div>

        {exercise.safetyNote && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-amber-800">⚠️ {exercise.safetyNote}</p>
          </div>
        )}

        {/* Voice Instructions Indicator */}
        {isVoicePlaying && (
          <div className="bg-[oklch(0.85_0.08_175)] border border-[oklch(0.70_0.10_175)] rounded-xl p-3 mb-4 animate-pulse">
            <p className="text-sm text-[oklch(0.30_0.05_175)] flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              🎧 Listen carefully... FitHer is guiding you through each step
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {exercise.steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex gap-3 p-3 rounded-xl transition-all ${
                currentStep === idx
                  ? "bg-[oklch(0.85_0.08_175)] border-2 border-[oklch(0.70_0.10_175)]"
                  : currentStep > idx
                  ? "bg-teal-50 border border-teal-200"
                  : "bg-muted border border-transparent"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  currentStep > idx
                    ? "bg-teal-500 text-white"
                    : currentStep === idx
                    ? "bg-[oklch(0.50_0.15_175)] text-white"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {currentStep > idx ? "✓" : idx + 1}
              </div>
              <p
                className={`text-sm leading-relaxed ${
                  currentStep === idx ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          {!isPlaying && currentStep < exercise.steps.length - 1 && (
            <Button onClick={handlePlayPause} className="flex-1 flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              {voiceEnabled ? "Start Voice Guidance" : "Start Exercise"}
            </Button>
          )}
          {isPlaying && (
            <Button onClick={handlePlayPause} variant="outline" className="flex-1 flex items-center justify-center gap-2">
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
          {currentStep === exercise.steps.length - 1 && (
            <Button onClick={handleComplete} className="flex-1 bg-teal-500 hover:bg-teal-600">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          )}
          <Button onClick={handleClose} variant="ghost">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState, useRef, useCallback } from "react"

interface AnimatedAvatarProps {
  isSpeaking: boolean
  agentId?: string
  size?: "sm" | "md" | "lg"
  exerciseMode?: "breathing" | "neck-stretch" | "shoulder-roll" | null
}

// Agent-specific color themes
const agentThemes: Record<string, { primary: string; secondary: string; accent: string; bg: string; label: string; emoji: string }> = {
  wellness: { primary: "#a855f7", secondary: "#e879f9", accent: "#f0abfc", bg: "#fae8ff", label: "FitHer", emoji: "💪" },
  planner:  { primary: "#14b8a6", secondary: "#2dd4bf", accent: "#5eead4", bg: "#ccfbf1", label: "PlanPal", emoji: "📅" },
  finance:  { primary: "#f59e0b", secondary: "#fbbf24", accent: "#fcd34d", bg: "#fef3c7", label: "PaisaWise", emoji: "💰" },
  speakup:  { primary: "#ef4444", secondary: "#f87171", accent: "#fca5a5", bg: "#fee2e2", label: "SpeakUp", emoji: "🛡️" },
  upskill:  { primary: "#3b82f6", secondary: "#60a5fa", accent: "#93c5fd", bg: "#dbeafe", label: "GrowthGuru", emoji: "🚀" },
}

const defaultTheme = { primary: "#a855f7", secondary: "#e879f9", accent: "#f0abfc", bg: "#fae8ff", label: "AI", emoji: "✨" }

export function AnimatedAvatar({ isSpeaking, agentId, size = "md", exerciseMode = null }: AnimatedAvatarProps) {
  // Lip sync state — driven by actual speech events
  const [mouthOpen, setMouthOpen] = useState(0)
  const [targetMouth, setTargetMouth] = useState(0)
  const mouthRef = useRef(0)
  const animRef = useRef<number>(0)

  // Visual states
  const [blinkState, setBlinkState] = useState(false)
  const [headTilt, setHeadTilt] = useState(0)
  const [breathPhase, setBreathPhase] = useState(0)
  const [neckAngle, setNeckAngle] = useState(0)
  const [shoulderY, setShoulderY] = useState(0)
  const [eyeX, setEyeX] = useState(0)

  const theme = agentThemes[agentId || ""] || defaultTheme
  const sizeMap = { sm: 80, md: 140, lg: 200 }
  const s = sizeMap[size]

  // ── LIP SYNC: Listen to word-boundary events from VoiceOutput ──
  const handleWordBoundary = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail
    if (detail && typeof detail.openness === "number") {
      setTargetMouth(detail.openness)
      // Auto-close mouth after the word duration (~200ms per word)
      setTimeout(() => setTargetMouth(0.1), 180)
    }
  }, [])

  const handleSpeakStart = useCallback(() => {
    setTargetMouth(0.3) // Slight open at start
  }, [])

  const handleSpeakEnd = useCallback(() => {
    setTargetMouth(0)
    setMouthOpen(0)
    mouthRef.current = 0
  }, [])

  useEffect(() => {
    window.addEventListener("herspace-speak-word", handleWordBoundary)
    window.addEventListener("herspace-speak-start", handleSpeakStart)
    window.addEventListener("herspace-speak-end", handleSpeakEnd)
    return () => {
      window.removeEventListener("herspace-speak-word", handleWordBoundary)
      window.removeEventListener("herspace-speak-start", handleSpeakStart)
      window.removeEventListener("herspace-speak-end", handleSpeakEnd)
    }
  }, [handleWordBoundary, handleSpeakStart, handleSpeakEnd])

  // Smooth mouth interpolation — animate toward target value
  useEffect(() => {
    const smoothAnimate = () => {
      const diff = targetMouth - mouthRef.current
      mouthRef.current += diff * 0.35 // Smooth easing
      if (Math.abs(diff) > 0.01) {
        setMouthOpen(mouthRef.current)
      } else {
        mouthRef.current = targetMouth
        setMouthOpen(targetMouth)
      }
      animRef.current = requestAnimationFrame(smoothAnimate)
    }
    animRef.current = requestAnimationFrame(smoothAnimate)
    return () => cancelAnimationFrame(animRef.current)
  }, [targetMouth])

  // Fallback: if isSpeaking but no word events arrive (some browsers don't fire boundary)
  useEffect(() => {
    if (!isSpeaking) {
      setTargetMouth(0)
      mouthRef.current = 0
      setMouthOpen(0)
      return
    }
    // Fallback random animation if boundary events aren't supported
    let fallbackTimer: ReturnType<typeof setInterval> | null = null
    const checkTimeout = setTimeout(() => {
      // If mouth hasn't moved after 500ms of speaking, use fallback
      if (mouthRef.current < 0.05 && isSpeaking) {
        fallbackTimer = setInterval(() => {
          const val = Math.random() * 0.7 + 0.2
          setTargetMouth(val)
          setTimeout(() => setTargetMouth(0.05 + Math.random() * 0.15), 100 + Math.random() * 80)
        }, 160 + Math.random() * 80)
      }
    }, 500)
    return () => {
      clearTimeout(checkTimeout)
      if (fallbackTimer) clearInterval(fallbackTimer)
    }
  }, [isSpeaking])

  // ── BLINK ──
  useEffect(() => {
    const blink = () => {
      setBlinkState(true)
      setTimeout(() => setBlinkState(false), 120)
    }
    const interval = setInterval(blink, 2800 + Math.random() * 2200)
    blink() // Initial blink
    return () => clearInterval(interval)
  }, [])

  // ── HEAD MOVEMENT when speaking ──
  useEffect(() => {
    if (!isSpeaking) { setHeadTilt(0); return }
    const interval = setInterval(() => {
      setHeadTilt((Math.random() - 0.5) * 5)
    }, 1200)
    return () => clearInterval(interval)
  }, [isSpeaking])

  // ── EYE MOVEMENT ──
  useEffect(() => {
    const interval = setInterval(() => {
      setEyeX((Math.random() - 0.5) * 3)
    }, 2500 + Math.random() * 1500)
    return () => clearInterval(interval)
  }, [])

  // ── BREATHING ──
  useEffect(() => {
    let frame = 0
    let raf: number
    const animate = () => {
      frame += exerciseMode === "breathing" ? 0.025 : 0.012
      setBreathPhase(Math.sin(frame) * (exerciseMode === "breathing" ? 8 : 2.5))
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [exerciseMode])

  // ── NECK STRETCH exercise ──
  useEffect(() => {
    if (exerciseMode !== "neck-stretch") { setNeckAngle(0); return }
    let phase = 0
    const interval = setInterval(() => {
      phase += 0.04
      setNeckAngle(Math.sin(phase) * 18)
    }, 50)
    return () => clearInterval(interval)
  }, [exerciseMode])

  // ── SHOULDER ROLL exercise ──
  useEffect(() => {
    if (exerciseMode !== "shoulder-roll") { setShoulderY(0); return }
    let phase = 0
    const interval = setInterval(() => {
      phase += 0.05
      setShoulderY(Math.sin(phase) * 5)
    }, 50)
    return () => clearInterval(interval)
  }, [exerciseMode])

  // Mouth dimensions derived from lip sync value
  const mouthRx = 4 + mouthOpen * 7
  const mouthRy = 1.5 + mouthOpen * 7
  const jawDrop = mouthOpen * 3

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Outer glow — pulses with speech */}
      <div
        className="absolute rounded-full transition-all duration-300"
        style={{
          width: s + 30, height: s + 30, top: -15, left: -15,
          background: `radial-gradient(circle, ${theme.primary}${isSpeaking ? '55' : '25'} 0%, transparent 70%)`,
          transform: `scale(${isSpeaking ? 1.1 + mouthOpen * 0.08 : 1})`,
        }}
      />

      <svg
        width={s} height={s} viewBox="0 0 200 200"
        className="relative z-10"
        style={{ filter: `drop-shadow(0 4px 16px ${theme.primary}40)` }}
      >
        <defs>
          <radialGradient id={`bg-${agentId}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={theme.bg} />
            <stop offset="100%" stopColor={theme.accent} />
          </radialGradient>
          <linearGradient id={`hair-${agentId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#16213e" />
          </linearGradient>
          <linearGradient id={`skin-${agentId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5d0a9" />
            <stop offset="100%" stopColor="#e8b88a" />
          </linearGradient>
          <linearGradient id={`dress-${agentId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.primary} />
            <stop offset="100%" stopColor={theme.secondary} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle cx="100" cy="100" r="96" fill={`url(#bg-${agentId})`} stroke={theme.primary} strokeWidth="3" />

        {/* Body — breathing + shoulder animation */}
        <g transform={`translate(0, ${breathPhase * 0.3})`}>
          <rect x="88" y="130" width="24" height="20" rx="8"
            fill={`url(#skin-${agentId})`}
            transform={`rotate(${neckAngle}, 100, 140)`}
          />
          <g transform={`translate(0, ${shoulderY})`}>
            <ellipse cx="100" cy="170" rx="55" ry="30" fill={`url(#dress-${agentId})`} />
            <path d="M 75 155 Q 100 165 125 155" stroke={theme.accent} strokeWidth="2" fill="none" />
            <ellipse cx="100" cy="168"
              rx={48 + breathPhase * 0.6} ry={25 + breathPhase * 0.4}
              fill={theme.primary} opacity="0.2"
            />
          </g>
        </g>

        {/* Head — tilt + breath bob + jaw drop for lip sync */}
        <g transform={`rotate(${headTilt}, 100, 110) translate(0, ${breathPhase * 0.15 + jawDrop * 0.3})`}>
          {/* Hair back */}
          <ellipse cx="100" cy="85" rx="52" ry="55" fill={`url(#hair-${agentId})`} />

          {/* Face — drops slightly when mouth opens */}
          <ellipse cx="100" cy={95 + jawDrop * 0.2} rx="42" ry={48 + jawDrop * 0.3} fill={`url(#skin-${agentId})`} />

          {/* Hair front */}
          <path d="M 58 78 Q 70 55 100 58 Q 130 55 142 78 Q 135 65 100 62 Q 65 65 58 78" fill={`url(#hair-${agentId})`} />
          <path d="M 58 85 Q 50 100 52 130 Q 55 115 62 100" fill={`url(#hair-${agentId})`} />
          <path d="M 142 85 Q 150 100 148 130 Q 145 115 138 100" fill={`url(#hair-${agentId})`} />

          {/* Eyebrows — lift slightly when speaking */}
          <path d={`M 78 ${82 - mouthOpen * 2} Q 85 ${78 - mouthOpen * 2} 92 ${82 - mouthOpen * 2}`}
            stroke="#3d2914" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d={`M 108 ${82 - mouthOpen * 2} Q 115 ${78 - mouthOpen * 2} 122 ${82 - mouthOpen * 2}`}
            stroke="#3d2914" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Eyes */}
          {blinkState ? (
            <>
              <line x1="78" y1="92" x2="92" y2="92" stroke="#3d2914" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="108" y1="92" x2="122" y2="92" stroke="#3d2914" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="85" cy="92" rx="8" ry="7" fill="white" />
              <ellipse cx={86 + eyeX} cy="92" rx="4.5" ry="5" fill="#3d2914" />
              <circle cx={87.5 + eyeX} cy="90.5" r="1.5" fill="white" />
              <ellipse cx="115" cy="92" rx="8" ry="7" fill="white" />
              <ellipse cx={116 + eyeX} cy="92" rx="4.5" ry="5" fill="#3d2914" />
              <circle cx={117.5 + eyeX} cy="90.5" r="1.5" fill="white" />
            </>
          )}

          {/* Nose */}
          <path d="M 98 98 Q 100 106 102 98" stroke="#d4a574" strokeWidth="1.5" fill="none" />

          {/* ── MOUTH — real lip sync ── */}
          {mouthOpen > 0.08 ? (
            <g>
              {/* Upper lip */}
              <path
                d={`M ${100 - mouthRx} 114 Q 100 ${112 - mouthOpen * 1.5} ${100 + mouthRx} 114`}
                stroke="#c0392b" strokeWidth="2" fill="#c0392b"
              />
              {/* Mouth opening */}
              <ellipse cx="100" cy={114 + mouthRy * 0.3} rx={mouthRx} ry={mouthRy}
                fill="#5c1a1a" />
              {/* Teeth hint when wide open */}
              {mouthOpen > 0.5 && (
                <rect x={100 - mouthRx * 0.6} y={113} width={mouthRx * 1.2} height={mouthRy * 0.45}
                  rx="1" fill="white" opacity="0.85" />
              )}
              {/* Tongue hint when very open */}
              {mouthOpen > 0.6 && (
                <ellipse cx="100" cy={115 + mouthRy * 0.5} rx={mouthRx * 0.5} ry={mouthRy * 0.3}
                  fill="#e74c3c" opacity="0.6" />
              )}
              {/* Lower lip */}
              <path
                d={`M ${100 - mouthRx} ${114 + mouthRy * 0.5} Q 100 ${114 + mouthRy * 1.8} ${100 + mouthRx} ${114 + mouthRy * 0.5}`}
                stroke="#c0392b" strokeWidth="1.5" fill="none"
              />
            </g>
          ) : (
            /* Gentle smile when not speaking */
            <path d="M 90 113 Q 100 120 110 113" stroke="#c0392b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}

          {/* Blush */}
          <ellipse cx="72" cy="105" rx="8" ry="5" fill="#f5a0a0" opacity="0.3" />
          <ellipse cx="128" cy="105" rx="8" ry="5" fill="#f5a0a0" opacity="0.3" />

          {/* Bindi */}
          <circle cx="100" cy="75" r="2.5" fill="#e74c3c" />

          {/* Earrings */}
          <circle cx="57" cy="105" r="3" fill={theme.primary} opacity="0.8" />
          <circle cx="143" cy="105" r="3" fill={theme.primary} opacity="0.8" />
        </g>

        {/* Agent badge */}
        <circle cx="165" cy="170" r="16" fill="white" stroke={theme.primary} strokeWidth="2" />
        <text x="165" y="175" textAnchor="middle" fontSize="14">{theme.emoji}</text>
      </svg>

      {/* Speaking wave bars — amplitude synced to mouth */}
      {isSpeaking && (
        <div className="flex gap-[3px] mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 3,
                height: 4 + mouthOpen * 16,
                backgroundColor: theme.primary,
                animation: `waveBar 0.5s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes waveBar {
              0%, 100% { transform: scaleY(0.6); }
              50% { transform: scaleY(1.4); }
            }
          `}} />
        </div>
      )}

      {/* Exercise label */}
      {exerciseMode && (
        <div
          className="mt-1 px-3 py-1 rounded-full text-white text-[10px] font-semibold animate-pulse"
          style={{ backgroundColor: theme.primary }}
        >
          {exerciseMode === "breathing" && "🫁 Breathing..."}
          {exerciseMode === "neck-stretch" && "🧘 Neck Stretch..."}
          {exerciseMode === "shoulder-roll" && "💪 Shoulder Roll..."}
        </div>
      )}
    </div>
  )
}

/* Drop-in replacement exports */
export function AnimatedSpeakingAvatar({ isSpeaking, agentId, size = "md" }: { isSpeaking: boolean; agentId?: string; size?: "sm" | "md" | "lg" }) {
  return <AnimatedAvatar isSpeaking={isSpeaking} agentId={agentId} size={size} />
}

export function AnimatedSpeakingIndicator({ isSpeaking, agentId }: { isSpeaking: boolean; agentId?: string }) {
  const theme = agentThemes[agentId || ""] || defaultTheme
  if (!isSpeaking) return null
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${theme.primary}20` }}>
      <div className="flex gap-[2px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1 rounded-full"
            style={{ height: 12, backgroundColor: theme.primary, animation: `avatarWave 0.6s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: theme.primary }}>{theme.label} speaking...</span>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes avatarWave { 0%, 100% { transform: scaleY(0.5); opacity: 0.5; } 50% { transform: scaleY(1.3); opacity: 1; } }` }} />
    </div>
  )
}

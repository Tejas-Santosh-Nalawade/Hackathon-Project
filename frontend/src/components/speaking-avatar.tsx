"use client"

import { useEffect, useState } from "react"
import { Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpeakingAvatarProps {
  isSpeaking: boolean
  avatarUrl?: string
  size?: "sm" | "md" | "lg"
}

export function SpeakingAvatar({ isSpeaking, avatarUrl = "/avatar-ai.jpg", size = "md" }: SpeakingAvatarProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0)

  useEffect(() => {
    if (isSpeaking) {
      // Animate pulse intensity to simulate speech
      const interval = setInterval(() => {
        setPulseIntensity(Math.random() * 0.6 + 0.4) // Random between 0.4-1.0
      }, 150) // Change every 150ms for natural speech rhythm

      return () => clearInterval(interval)
    } else {
      setPulseIntensity(0)
    }
  }, [isSpeaking])

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer Glow - Breathing effect when speaking */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full blur-xl transition-all duration-300",
          isSpeaking ? "bg-purple-400/40" : "bg-purple-400/0"
        )}
        style={{
          transform: isSpeaking ? `scale(${1.2 + pulseIntensity * 0.3})` : "scale(1)",
          opacity: isSpeaking ? pulseIntensity : 0
        }}
      />
      
      {/* Middle Ring - Pulse effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full border-4 transition-all duration-200",
          isSpeaking ? "border-purple-500/60" : "border-purple-300/20"
        )}
        style={{
          transform: isSpeaking ? `scale(${1.1 + pulseIntensity * 0.15})` : "scale(1)",
          opacity: isSpeaking ? 0.6 + pulseIntensity * 0.4 : 0.3
        }}
      />
      
      {/* Avatar Container */}
      <div 
        className={cn(
          "relative rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-purple-100 to-pink-100 transition-all duration-200",
          sizeClasses[size]
        )}
        style={{
          transform: isSpeaking ? `scale(${1.0 + pulseIntensity * 0.05})` : "scale(1)"
        }}
      >
        <img
          src={avatarUrl}
          alt="AI Avatar"
          className="w-full h-full object-cover"
        />
        
        {/* Speaking Overlay with animated gradient */}
        {isSpeaking && (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse"
            style={{
              opacity: pulseIntensity * 0.4
            }}
          />
        )}
      </div>
      
      {/* Voice Indicator Icon */}
      {isSpeaking && (
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <Volume2 className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* Audio Wave Bars - Visual speaking indicator */}
      {isSpeaking && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-purple-500 rounded-full"
              style={{
                height: `${8 + Math.sin((Date.now() / 100) + i) * 6 * pulseIntensity}px`,
                animation: `wave 0.6s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.2); }
        }
      `}} />
    </div>
  )
}

// Simplified version for chat messages
export function SpeakingIndicator({ isSpeaking }: { isSpeaking: boolean }) {
  if (!isSpeaking) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 bg-purple-600 dark:bg-purple-400 rounded-full"
            style={{
              height: "12px",
              animation: `wave 0.6s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>
      <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Speaking...</span>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }
      `}} />
    </div>
  )
}

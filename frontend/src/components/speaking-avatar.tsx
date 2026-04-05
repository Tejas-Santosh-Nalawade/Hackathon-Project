"use client"

import { AnimatedAvatar } from "@/components/animated-avatar"

interface SpeakingAvatarProps {
  isSpeaking: boolean
  avatarUrl?: string
  size?: "sm" | "md" | "lg"
  agentId?: string
}

export function SpeakingAvatar({ isSpeaking, size = "md", agentId }: SpeakingAvatarProps) {
  return (
    <AnimatedAvatar
      isSpeaking={isSpeaking}
      agentId={agentId}
      size={size}
    />
  )
}

// Simplified version for chat messages
export function SpeakingIndicator({ isSpeaking, agentId }: { isSpeaking: boolean; agentId?: string }) {
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

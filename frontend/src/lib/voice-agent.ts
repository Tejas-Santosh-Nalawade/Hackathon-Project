/**
 * Complete Voice Agent System
 * Speech-to-Text (User Input) + Text-to-Speech (AI Response)
 *
 * Key features:
 * - Cleans markdown/emojis/formatting before speaking (no "asterisk asterisk")
 * - Natural, warm companion voice (not robotic)
 * - Session-aware: prevents voice collisions across agent switches
 * - Proper stop/cancel at every level
 */

export interface VoiceRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

// ────────────────────────────────────────────────────────
// TEXT CLEANING — Strip markdown, emojis, symbols before TTS
// ────────────────────────────────────────────────────────

/**
 * Cleans raw AI/chat response text into natural spoken English.
 * Removes markdown bold/italic, bullet points, emojis, numbered lists,
 * special characters, and collapses whitespace.
 */
function cleanTextForSpeech(raw: string): string {
  let text = raw

  // Remove emoji characters (unicode ranges)
  text = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '')   // emoticons
  text = text.replace(/[\u{1F300}-\u{1F5FF}]/gu, '')   // misc symbols & pictographs
  text = text.replace(/[\u{1F680}-\u{1F6FF}]/gu, '')   // transport & map
  text = text.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')   // flags
  text = text.replace(/[\u{2600}-\u{26FF}]/gu, '')     // misc symbols
  text = text.replace(/[\u{2700}-\u{27BF}]/gu, '')     // dingbats
  text = text.replace(/[\u{FE00}-\u{FE0F}]/gu, '')     // variation selectors
  text = text.replace(/[\u{1F900}-\u{1F9FF}]/gu, '')   // supplemental symbols
  text = text.replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')   // chess symbols
  text = text.replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')   // symbols extended
  text = text.replace(/[\u{200D}]/gu, '')               // zero width joiner
  text = text.replace(/[\u{20E3}]/gu, '')               // combining enclosing keycap
  text = text.replace(/[\u{E0020}-\u{E007F}]/gu, '')   // tags

  // Remove common text emojis via simple string replacement
  const emojisToRemove = ['❤️','💜','💪','🎯','📅','🛡️','🚀','💰','📋','⚡','🔒','✨','✓','☑️','⭐','🌅','🎉','📈','📊','🧘','🫁','👁️','💤','🔴','🟡','🔵','⚪','💡','📞','🎓','👩‍💼','💕','💞','💝','🐍','🧾','💳','📝','🏃','☀️','🌟','⏰','🙅','🔄','❗','⚖️','📚','🔥','✅','❌','🤝','👏','🙏','💎','🌈','🎶','🎵','🏆','🥇','🎁','🎄','🎃','🎪','🫁','💗','🌸','🍽️','🎤','👀','😊','😔','😢','😃','🤗','🙌','👍','🤔','💼','🎯','⭕','🔑','💡','📌','🔗','🌐','🖥️']
  for (const emoji of emojisToRemove) {
    text = text.split(emoji).join('')
  }

  // Remove markdown bold **text** → text
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  // Remove markdown italic *text* → text
  text = text.replace(/\*([^*]+)\*/g, '$1')
  // Remove markdown bold __text__ → text
  text = text.replace(/__([^_]+)__/g, '$1')
  // Remove markdown italic _text_ → text
  text = text.replace(/_([^_]+)_/g, '$1')
  // Remove remaining standalone asterisks
  text = text.replace(/\*/g, '')

  // Remove markdown headers (# ## ###)
  text = text.replace(/^#{1,6}\s+/gm, '')

  // Replace bullet points with natural pauses
  text = text.replace(/^[\s]*[-•●◦▪]\s*/gm, '. ')  // bullets → sentence pause
  text = text.replace(/^[\s]*\d+[.)]\s*/gm, '. ')    // numbered lists → sentence pause
  text = text.replace(/^[\s]*\d+️⃣\s*/gm, '. ')     // keycap numbered lists

  // Remove markdown links [text](url) → text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove inline code `text` → text
  text = text.replace(/`([^`]+)`/g, '$1')

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '')

  // Remove blockquotes
  text = text.replace(/^>\s*/gm, '')

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}$/gm, '')

  // Clean up special characters that sound weird when spoken
  text = text.replace(/→/g, 'to')
  text = text.replace(/←/g, 'from')
  text = text.replace(/\|/g, ', ')
  text = text.replace(/\//g, ' or ')
  text = text.replace(/&/g, ' and ')
  text = text.replace(/₹/g, 'rupees ')
  text = text.replace(/\$/g, 'dollars ')
  text = text.replace(/%/g, ' percent')
  text = text.replace(/\+/g, ' plus ')
  text = text.replace(/=/g, ' equals ')
  text = text.replace(/\n{2,}/g, '. ')  // double newlines → pause
  text = text.replace(/\n/g, '. ')       // single newlines → pause
  text = text.replace(/\(([^)]*)\)/g, ', $1, ')  // parentheses → commas

  // Collapse multiple spaces
  text = text.replace(/\s{2,}/g, ' ')
  // Collapse multiple periods
  text = text.replace(/\.{2,}/g, '.')
  // Remove leading/trailing punctuation issues
  text = text.replace(/^[.,;:\s]+/, '')
  text = text.replace(/[.,;:\s]+$/, '.')
  // Remove "., " patterns
  text = text.replace(/\.\s*,/g, '.')
  text = text.replace(/,\s*\./g, '.')

  return text.trim()
}

/**
 * Shorten text for speech — pick the first 2-3 key sentences
 * so the bot doesn't read a massive wall of text endlessly.
 */
function shortenForSpeech(text: string, maxSentences: number = 4): string {
  // Split on sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  if (sentences.length <= maxSentences) {
    return text
  }

  // Take first few sentences + a closing so it doesn't feel cut off
  const shortened = sentences.slice(0, maxSentences).join(' ')
  return shortened + ' You can read the full details in the chat.'
}

// ────────────────────────────────────────────────────────
// SPEECH RECOGNITION
// ────────────────────────────────────────────────────────

export class VoiceRecognition {
  private recognition: unknown
  private isListening: boolean = false
  private onResultCallback?: (result: VoiceRecognitionResult) => void
  private onEndCallback?: () => void

  constructor() {
    if (typeof window !== "undefined") {
      // @ts-expect-error SpeechRecognition browser API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        const rec = this.recognition as Record<string, unknown>
        rec.continuous = false
        rec.interimResults = true
        rec.lang = "en-IN"
        rec.maxAlternatives = 1

        this.setupEventHandlers()
      } else {
        console.warn("Speech Recognition not supported in this browser")
      }
    }
  }

  private setupEventHandlers() {
    const rec = this.recognition as Record<string, unknown>

    rec.onresult = (event: { results: { length: number; [key: number]: { [key: number]: { transcript: string; confidence: number }; isFinal: boolean } } }) => {
      const last = event.results.length - 1
      const result = event.results[last]
      const transcript = result[0].transcript
      const confidence = result[0].confidence
      const isFinal = result.isFinal

      if (this.onResultCallback) {
        this.onResultCallback({ transcript, confidence, isFinal })
      }
    }

    rec.onend = () => {
      this.isListening = false
      if (this.onEndCallback) {
        this.onEndCallback()
      }
    }

    rec.onerror = (event: { error: string }) => {
      console.error("Speech recognition error:", event.error)
      this.isListening = false
    }
  }

  start(onResult: (result: VoiceRecognitionResult) => void, onEnd?: () => void) {
    if (!this.recognition) {
      console.error("Speech Recognition not available")
      return
    }

    this.onResultCallback = onResult
    this.onEndCallback = onEnd
    this.isListening = true
    ;(this.recognition as { start: () => void }).start()
  }

  stop() {
    if (this.recognition && this.isListening) {
      ;(this.recognition as { stop: () => void }).stop()
      this.isListening = false
    }
  }

  isActive(): boolean {
    return this.isListening
  }
}

// ────────────────────────────────────────────────────────
// TEXT-TO-SPEECH OUTPUT
// ────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export class VoiceOutput {
  private audioElement: HTMLAudioElement | null = null
  private synthesis: SpeechSynthesis
  private fallbackVoice: SpeechSynthesisVoice | null = null
  private fallbackUtterance: SpeechSynthesisUtterance | null = null
  private isSpeakingFlag: boolean = false
  private onSpeakingChangeCallback?: (isSpeaking: boolean) => void
  private currentSessionId: number = 0

  constructor() {
    this.synthesis = window.speechSynthesis
    this.initFallbackVoice()
  }

  private async initFallbackVoice() {
    if (this.synthesis.getVoices().length === 0) {
      await new Promise((resolve) => {
        this.synthesis.addEventListener("voiceschanged", resolve, { once: true })
      })
    }
    const voices = this.synthesis.getVoices()
    
    // Select a warm, grounded female voice suitable for a Yoga Instructor persona
    this.fallbackVoice = 
      voices.find((v) => v.name.includes("Google UK English Female")) ||
      voices.find((v) => v.name.includes("Microsoft Zira")) ||
      voices.find((v) => v.name.includes("Samantha")) ||
      voices.find((v) => v.name.includes("Moira")) ||
      voices.find((v) => v.lang === "en-IN" && v.name.toLowerCase().includes("female")) ||
      voices.find((v) => v.name.toLowerCase().includes("female") && v.lang.startsWith("en")) ||
      voices[0]
  }

  onSpeakingChange(callback: (isSpeaking: boolean) => void) {
    this.onSpeakingChangeCallback = callback
  }

  /**
   * Speak cleaned text using high-fidelity ElevenLabs backend integration.
   */
  speak(text: string, rate: number = 1.0, onEnd?: () => void): Promise<void> {
    return new Promise<void>((resolve) => {
      (async () => {
      this.stop()
      this.currentSessionId++
      const mySessionId = this.currentSessionId

      // ── CLEAN the text: remove markdown, emojis, symbols ──
      const cleanedText = shortenForSpeech(cleanTextForSpeech(text), 4)

      if (!cleanedText || cleanedText.length < 3) {
        if (onEnd) onEnd()
        resolve()
        return
      }

      const finishAndResolve = () => {
        if (onEnd) onEnd()
        resolve()
      }

    try {
      if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(true)
      this.isSpeakingFlag = true
      window.dispatchEvent(new CustomEvent("herspace-speak-start"))

      // Request stream from backend Voice integration
      const res = await fetch(`${API_BASE_URL}/api/v2/voice-tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanedText })
      })
      
      if (!res.ok) {
        throw new Error(`Voice fetch failed with status ${res.status}`)
      }
      
      if (mySessionId !== this.currentSessionId) {
         resolve()
         return
      }
      
      const blob = await res.blob()
      // If the backend threw an empty stream (e.g., due to an API 402 rejection handled silently)
      if (blob.size < 500) {
        throw new Error("Received invalid or empty audio stream from backend. Triggering fallback.")
      }

      const url = URL.createObjectURL(blob)
      
      this.audioElement = new Audio(url)
      this.audioElement.playbackRate = rate
      
      // Simulate visemes/lip sync since we have raw audio bytes
      const syncInterval = setInterval(() => {
        if (mySessionId !== this.currentSessionId || !this.isSpeakingFlag) {
          clearInterval(syncInterval)
          return
        }
        const openness = 0.3 + Math.random() * 0.7
        window.dispatchEvent(new CustomEvent("herspace-speak-word", {
          detail: { word: "speech", openness, charIndex: 0 }
        }))
      }, 150)

      this.audioElement.onended = () => {
        clearInterval(syncInterval)
        if (mySessionId !== this.currentSessionId) {
          resolve()
          return
        }
        this.isSpeakingFlag = false
        if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(false)
        window.dispatchEvent(new CustomEvent("herspace-speak-end"))
        finishAndResolve()
      }

      this.audioElement.onerror = () => {
        console.error("Audio element error playback. Triggering fallback.")
        clearInterval(syncInterval)
        this.fallbackSpeak(cleanedText, mySessionId, finishAndResolve)
      }

      await this.audioElement.play().catch(err => {
         console.warn("Autoplay or decode error. Triggering fallback.", err)
         clearInterval(syncInterval)
         this.fallbackSpeak(cleanedText, mySessionId, finishAndResolve)
      })

    } catch (error) {
      console.warn("ElevenLabs TTS failed. Using native browser fallback.", error)
      this.fallbackSpeak(cleanedText, mySessionId, finishAndResolve)
    }
    })()
    })
  }

  /**
   * Native Open Source Fallback with Yoga Instructor Persona
   */
  private fallbackSpeak(cleanedText: string, expectedSessionId: number, onEnd?: () => void) {
    if (expectedSessionId !== this.currentSessionId) return
    
    // We already stopped the previous synthesis in speak() / stop(), but let's be sure
    this.synthesis.cancel()
    
    const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText]
    let currentIndex = 0
    let keepAliveTimer: ReturnType<typeof setInterval> | null = null

    const cleanup = () => {
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer)
        keepAliveTimer = null
      }
    }

    const markDone = () => {
      this.isSpeakingFlag = false
      cleanup()
      if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(false)
      window.dispatchEvent(new CustomEvent("herspace-speak-end"))
      if (onEnd) onEnd()
    }

    const speakNext = () => {
      if (expectedSessionId !== this.currentSessionId) {
        cleanup()
        return
      }

      if (currentIndex >= sentences.length) {
        markDone()
        return
      }

      const sentence = sentences[currentIndex].trim()
      if (!sentence || sentence.length < 2) {
        currentIndex++
        speakNext()
        return
      }

      this.fallbackUtterance = new SpeechSynthesisUtterance(sentence)

      // ── YOGA INSTRUCTOR PERSONA SETTINGS ──
      // Calming, grounded, slow paced
      this.fallbackUtterance.rate = 0.85       
      this.fallbackUtterance.pitch = 0.95      
      this.fallbackUtterance.volume = 1.0     

      if (this.fallbackVoice) {
        this.fallbackUtterance.voice = this.fallbackVoice
      }

      this.fallbackUtterance.onstart = () => {
        if (expectedSessionId !== this.currentSessionId) {
          this.synthesis.cancel()
          cleanup()
          return
        }
        this.isSpeakingFlag = true
        if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(true)
        if (currentIndex === 0) {
          window.dispatchEvent(new CustomEvent("herspace-speak-start"))
        }

        if (keepAliveTimer) clearInterval(keepAliveTimer)
        keepAliveTimer = setInterval(() => {
          if (expectedSessionId !== this.currentSessionId) {
            this.synthesis.cancel()
            cleanup()
            return
          }
          if (this.synthesis.speaking && !this.synthesis.paused) {
            this.synthesis.pause()
            this.synthesis.resume()
          }
        }, 10000)
      }

      this.fallbackUtterance.onboundary = (event) => {
        if (expectedSessionId !== this.currentSessionId) return
        if (event.name === "word") {
          const word = sentence.substring(event.charIndex, event.charIndex + event.charLength)
          const vowels = (word.match(/[aeiouAEIOU]/g) || []).length
          const openness = Math.min(0.4 + vowels * 0.2, 1.0)
          window.dispatchEvent(new CustomEvent("herspace-speak-word", {
            detail: { word, openness, charIndex: event.charIndex }
          }))
        }
      }

      this.fallbackUtterance.onend = () => {
        if (expectedSessionId !== this.currentSessionId) {
          cleanup()
          return
        }
        currentIndex++
        setTimeout(speakNext, 400) // Slightly longer pause for calmer rhythm
      }

      this.fallbackUtterance.onerror = (e) => {
        if (e.error === "interrupted" || expectedSessionId !== this.currentSessionId) {
          cleanup()
          return
        }
        currentIndex++
        setTimeout(speakNext, 100)
      }

      this.synthesis.speak(this.fallbackUtterance)
    }

    speakNext()
  }

  stop() {
    this.currentSessionId++
    this.isSpeakingFlag = false
    if (this.synthesis) {
       this.synthesis.cancel()
    }
    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement.currentTime = 0
      this.audioElement = null
    }
    if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(false)
    window.dispatchEvent(new CustomEvent("herspace-speak-end"))
  }

  pause() {
    if (this.audioElement && !this.audioElement.paused) this.audioElement.pause()
    if (this.synthesis && this.synthesis.speaking) this.synthesis.pause()
  }

  resume() {
    if (this.audioElement && this.audioElement.paused) this.audioElement.play()
    if (this.synthesis && this.synthesis.paused) this.synthesis.resume()
  }

  isCurrentlySpeaking(): boolean {
    const isAudioNative = this.audioElement ? !this.audioElement.paused : false
    const isSynthesizing = this.synthesis ? this.synthesis.speaking : false
    return this.isSpeakingFlag || isAudioNative || isSynthesizing
  }
}

// ────────────────────────────────────────────────────────
// VOICE AGENT — Full conversation controller
// ────────────────────────────────────────────────────────

export class VoiceAgent {
  private voiceRecognition: VoiceRecognition
  private voiceOutput: VoiceOutput
  private isProcessing: boolean = false
  private isCancelled: boolean = false

  constructor() {
    this.voiceRecognition = new VoiceRecognition()
    this.voiceOutput = new VoiceOutput()
  }

  cancelAll() {
    this.isCancelled = true
    this.voiceRecognition.stop()
    this.voiceOutput.stop()
    this.isProcessing = false
    // Reset cancel flag after a tick
    setTimeout(() => { this.isCancelled = false }, 100)
  }

  listen(
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onComplete: (finalTranscript: string) => void
  ) {
    let finalTranscript = ""

    this.voiceRecognition.start(
      (result) => {
        onTranscript(result.transcript, result.isFinal)
        if (result.isFinal) {
          finalTranscript = result.transcript
        }
      },
      () => {
        if (finalTranscript) {
          onComplete(finalTranscript)
        }
      }
    )
  }

  stopListening() {
    this.voiceRecognition.stop()
  }

  /**
   * Speak text in a natural, companion-like voice.
   * Cleans markdown automatically. Cancels any current speech.
   */
  async speak(text: string, onComplete?: () => void) {
    // Always cancel before speaking new text
    this.voiceOutput.stop()
    this.isCancelled = false

    // Small delay for cancel to propagate
    await new Promise(resolve => setTimeout(resolve, 50))

    // Don't proceed if cancelled during the delay
    if (this.isCancelled) {
      if (onComplete) onComplete()
      return
    }

    await this.voiceOutput.speak(text, 0.92)

    if (onComplete) onComplete()
  }

  stopSpeaking() {
    this.voiceOutput.stop()
  }

  isListening(): boolean {
    return this.voiceRecognition.isActive()
  }

  isSpeaking(): boolean {
    return this.voiceOutput.isCurrentlySpeaking()
  }

  async converse(
    userInput: string,
    onResponse: (response: string) => void
  ): Promise<void> {
    if (this.isCancelled) return
    this.isProcessing = true

    try {
      const response = await this.processWithBackend(userInput)

      if (this.isCancelled) return

      await this.speak(response)
      onResponse(response)
    } catch (error) {
      console.error("Conversation error:", error)
      if (!this.isCancelled) {
        await this.speak("I'm sorry, I didn't catch that. Could you please repeat?")
      }
    } finally {
      this.isProcessing = false
    }
  }

  private async processWithBackend(userInput: string): Promise<string> {
    const input = userInput.toLowerCase()

    if (input.includes("neck") || input.includes("stiff neck") || input.includes("hurt")) {
      return "I understand your neck is bothering you. Let me guide you through a gentle 2-minute sitting stretch."
    }
    if (input.includes("stress") || input.includes("anxious") || input.includes("overwhelm")) {
      return "I hear you. Let me help you calm down with a simple breathing technique."
    }
    if (input.includes("eye") || input.includes("screen") || input.includes("tired eyes")) {
      return "Your eyes need a break. Let me guide you through a quick eye relaxation exercise."
    }
    if (input.includes("shoulder") || input.includes("back") || input.includes("tense")) {
      return "Those shoulders need attention. I have a simple seated stretch that feels amazing."
    }
    if (input.includes("breathing") || input.includes("breath")) {
      return "Let me guide you through a calming breathing technique. It takes just 2 minutes."
    }
    if (input.includes("wrist") || input.includes("hand") || input.includes("typing")) {
      return "Your hands and wrists need relief. I can show you gentle stretches at your desk."
    }
    if (input.includes("exercise") || input.includes("help") || input.includes("stretch")) {
      return "I can guide you through desk exercises. Tell me what area needs attention, like neck, shoulders, eyes, or back."
    }
    if (input.includes("hi") || input.includes("hello") || input.includes("hey")) {
      return "Hi! I'm FitHer, your wellness companion. What's bothering you today?"
    }
    return "I'm here to help you feel better. Tell me what area needs relief."
  }

  async getExerciseRecommendation(symptoms: string): Promise<string> {
    return this.processWithBackend(symptoms)
  }
}

// ────────────────────────────────────────────────────────
// SINGLETON + GLOBAL CANCEL
// ────────────────────────────────────────────────────────

let voiceAgentInstance: VoiceAgent | null = null

export function getVoiceAgent(): VoiceAgent {
  if (!voiceAgentInstance) {
    voiceAgentInstance = new VoiceAgent()
  }
  return voiceAgentInstance
}

/**
 * Global: cancel all voice activity instantly.
 */
export function cancelAllVoice() {
  if (voiceAgentInstance) {
    voiceAgentInstance.cancelAll()
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

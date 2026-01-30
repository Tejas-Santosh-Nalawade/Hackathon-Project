/**
 * Complete Voice Agent System
 * Speech-to-Text (User Input) + Text-to-Speech (AI Response)
 * No text input needed - fully voice-based interaction
 */

export interface VoiceRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

/**
 * Speech Recognition (User Voice Input)
 */
export class VoiceRecognition {
  private recognition: any
  private isListening: boolean = false
  private onResultCallback?: (result: VoiceRecognitionResult) => void
  private onEndCallback?: () => void

  constructor() {
    if (typeof window !== "undefined") {
      // @ts-ignore - SpeechRecognition browser API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = true
        this.recognition.lang = "en-IN" // English (India) for Indian women
        this.recognition.maxAlternatives = 1
        
        this.setupEventHandlers()
      } else {
        console.warn("Speech Recognition not supported in this browser")
      }
    }
  }

  private setupEventHandlers() {
    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1
      const result = event.results[last]
      const transcript = result[0].transcript
      const confidence = result[0].confidence
      const isFinal = result.isFinal

      if (this.onResultCallback) {
        this.onResultCallback({ transcript, confidence, isFinal })
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
      if (this.onEndCallback) {
        this.onEndCallback()
      }
    }

    this.recognition.onerror = (event: any) => {
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
    this.recognition.start()
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  isActive(): boolean {
    return this.isListening
  }
}

/**
 * Text-to-Speech (AI Voice Output)
 */
export class VoiceOutput {
  private synthesis: SpeechSynthesis
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private voice: SpeechSynthesisVoice | null = null
  private queue: string[] = []
  private isSpeaking: boolean = false
  private onSpeakingChangeCallback?: (isSpeaking: boolean) => void

  constructor() {
    this.synthesis = window.speechSynthesis
    this.initVoice()
  }

  onSpeakingChange(callback: (isSpeaking: boolean) => void) {
    this.onSpeakingChangeCallback = callback
  }

  private async initVoice() {
    // Wait for voices to load
    if (this.synthesis.getVoices().length === 0) {
      await new Promise((resolve) => {
        this.synthesis.addEventListener("voiceschanged", resolve, { once: true })
      })
    }

    // Select best Indian female voice
    const voices = this.synthesis.getVoices()
    
    // Priority order for Indian female voice:
    // 1. Indian female voice (en-IN)
    // 2. Female voices with Indian/Hindi origins
    // 3. Generic female English voice
    this.voice =
      voices.find((v) => v.lang === "en-IN" && v.name.includes("Female")) ||
      voices.find((v) => v.lang === "hi-IN" && v.name.includes("Female")) ||
      voices.find((v) => v.lang === "en-IN") ||
      voices.find((v) => v.lang === "hi-IN") ||
      voices.find((v) => v.name.includes("Google UK English Female")) ||
      voices.find((v) => v.name.includes("Female") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Samantha")) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
    
    console.log("Selected voice:", this.voice?.name, "Lang:", this.voice?.lang)
  }

  speak(text: string, rate: number = 1.25, onEnd?: () => void, pitch: number = 1.1): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any current speech
      if (this.currentUtterance) {
        this.synthesis.cancel()
      }

      this.currentUtterance = new SpeechSynthesisUtterance(text)
      this.currentUtterance.rate = rate // Faster, more natural pace
      this.currentUtterance.pitch = pitch // Slightly higher for female voice
      this.currentUtterance.volume = 1.0

      if (this.voice) {
        this.currentUtterance.voice = this.voice
      }

      this.currentUtterance.onstart = () => {
        this.isSpeaking = true
        if (this.onSpeakingChangeCallback) {
          this.onSpeakingChangeCallback(true)
        }
      }

      this.currentUtterance.onend = () => {
        this.isSpeaking = false
        if (this.onSpeakingChangeCallback) {
          this.onSpeakingChangeCallback(false)
        }
        if (onEnd) onEnd()
        resolve()
      }
      
      this.currentUtterance.onerror = (error) => {
        this.isSpeaking = false
        if (this.onSpeakingChangeCallback) {
          this.onSpeakingChangeCallback(false)
        }
        reject(error)
      }

      this.synthesis.speak(this.currentUtterance)
    })
  }

  stop() {
    this.synthesis.cancel()
    this.currentUtterance = null
    this.isSpeaking = false
    this.queue = []
    if (this.onSpeakingChangeCallback) {
      this.onSpeakingChangeCallback(false)
    }
  }

  pause() {
    if (this.synthesis.speaking) {
      this.synthesis.pause()
    }
  }

  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume()
    }
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking || this.synthesis.speaking
  }
}

/**
 * Complete Voice Agent - handles full conversation
 */
export class VoiceAgent {
  private voiceRecognition: VoiceRecognition
  private voiceOutput: VoiceOutput
  private isProcessing: boolean = false

  constructor() {
    this.voiceRecognition = new VoiceRecognition()
    this.voiceOutput = new VoiceOutput()
  }

  /**
   * Listen for user voice input
   */
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

  /**
   * Stop listening
   */
  stopListening() {
    this.voiceRecognition.stop()
  }

  /**
   * Speak AI response
   */
  async speak(text: string, onComplete?: () => void) {
    await this.voiceOutput.speak(text, 0.9, onComplete)
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    this.voiceOutput.stop()
  }

  /**
   * Check if listening
   */
  isListening(): boolean {
    return this.voiceRecognition.isActive()
  }

  /**
   * Check if speaking
   */
  isSpeaking(): boolean {
    return this.voiceOutput.isCurrentlySpeaking()
  }

  /**
   * Complete conversation flow
   */
  async converse(
    userInput: string,
    onResponse: (response: string) => void
  ): Promise<void> {
    this.isProcessing = true
    
    try {
      // This would call your backend API
      const response = await this.processWithBackend(userInput)
      
      // Speak the response
      await this.speak(response)
      onResponse(response)
      
    } catch (error) {
      console.error("Conversation error:", error)
      await this.speak("I'm sorry, I didn't catch that. Could you please repeat?")
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process user input with backend
   */
  private async processWithBackend(userInput: string): Promise<string> {
    // This integrates with your existing backend API
    // For now, using intelligent pattern matching
    
    const input = userInput.toLowerCase()
    
    // Exercise requests - simplified conversational responses
    if (input.includes("neck") || input.includes("stiff neck") || input.includes("hurt")) {
      return "I understand your neck is bothering you. I can guide you through a gentle 2-minute sitting stretch that really helps. Would you like me to guide you through it now, or would you prefer some other relief options?"
    }
    
    if (input.includes("stress") || input.includes("anxious") || input.includes("overwhelm")) {
      return "I hear you. Stress can be overwhelming. Let me help you calm down with a simple breathing technique. Would you like to try a 2-minute box breathing exercise, or would you prefer something else?"
    }
    
    if (input.includes("eye") || input.includes("screen") || input.includes("tired eyes")) {
      return "Your eyes need a break from the screen. I can guide you through a quick 20-second eye relaxation exercise. Shall we do it together now?"
    }
    
    if (input.includes("shoulder") || input.includes("back") || input.includes("tense")) {
      return "Those shoulders carry a lot of tension! I have a simple seated stretch that takes just 2 minutes and feels amazing. Want to try it?"
    }
    
    if (input.includes("breathing") || input.includes("breath")) {
      return "Breathing exercises are so helpful! I can guide you through a calming technique that takes just 2 minutes. Ready to feel more relaxed?"
    }
    
    if (input.includes("wrist") || input.includes("hand") || input.includes("typing")) {
      return "Your hands and wrists work so hard! I can show you some gentle stretches you can do right at your desk. Takes about 2 minutes. Interested?"
    }
    
    // General requests
    if (input.includes("exercise") || input.includes("help") || input.includes("stretch")) {
      return "I can guide you through several desk exercises. I have neck relief, shoulder stretches, breathing exercises, eye relaxation, wrist relief, or spine twists. All can be done sitting. Which area needs attention most?"
    }
    
    // Greeting
    if (input.includes("hi") || input.includes("hello") || input.includes("hey")) {
      return "Hi! I'm FitHer, your wellness companion. I'm here to guide you through desk exercises, breathing techniques, and stress relief - all while you stay seated. What's bothering you today? Your neck, shoulders, eyes, or stress?"
    }
    
    // Default
    return "I'm here to help you feel better at your desk. You can ask me for neck relief, shoulder stretches, breathing exercises, eye relaxation, or stress relief. What would help you most right now?"
  }

  /**
   * Get exercise recommendation based on voice input
   */
  async getExerciseRecommendation(symptoms: string): Promise<string> {
    // Backend would use AI to analyze symptoms and recommend exercise
    return this.processWithBackend(symptoms)
  }
}

// Export singleton instance
let voiceAgentInstance: VoiceAgent | null = null

export function getVoiceAgent(): VoiceAgent {
  if (!voiceAgentInstance) {
    voiceAgentInstance = new VoiceAgent()
  }
  return voiceAgentInstance
}

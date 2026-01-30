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

  constructor() {
    this.synthesis = window.speechSynthesis
    this.initVoice()
  }

  private async initVoice() {
    // Wait for voices to load
    if (this.synthesis.getVoices().length === 0) {
      await new Promise((resolve) => {
        this.synthesis.addEventListener("voiceschanged", resolve, { once: true })
      })
    }

    // Select best female voice for Indian context
    const voices = this.synthesis.getVoices()
    this.voice =
      voices.find((v) => v.name.includes("Female") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Samantha")) ||
      voices.find((v) => v.lang === "en-IN") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
  }

  speak(text: string, rate: number = 0.75, onEnd?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any current speech
      if (this.currentUtterance) {
        this.synthesis.cancel()
      }

      this.currentUtterance = new SpeechSynthesisUtterance(text)
      this.currentUtterance.rate = rate // Slower, human-like pace
      this.currentUtterance.pitch = 1.0
      this.currentUtterance.volume = 1.0

      if (this.voice) {
        this.currentUtterance.voice = this.voice
      }

      this.currentUtterance.onend = () => {
        this.isSpeaking = false
        if (onEnd) onEnd()
        resolve()
      }
      
      this.currentUtterance.onerror = (error) => {
        this.isSpeaking = false
        reject(error)
      }

      this.isSpeaking = true
      this.synthesis.speak(this.currentUtterance)
    })
  }

  stop() {
    this.synthesis.cancel()
    this.currentUtterance = null
    this.isSpeaking = false
    this.queue = []
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
   * Speak AI response with natural pauses
   */
  async speak(text: string, onComplete?: () => void) {
    // Split text into sentences for more natural speech
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim()
      if (sentence) {
        await this.voiceOutput.speak(sentence, 0.75)
        // Add natural pause between sentences (500ms)
        if (i < sentences.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }
    
    if (onComplete) onComplete()
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
    
    // Exercise requests - simplified conversational responses (one thing at a time)
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
    
    // General requests
    if (input.includes("exercise") || input.includes("help") || input.includes("stretch")) {
      return "I can guide you through desk exercises. Tell me what area needs attention. Neck, shoulders, eyes, or back?"
    }
    
    // Greeting
    if (input.includes("hi") || input.includes("hello") || input.includes("hey")) {
      return "Hi! I'm FitHer, your wellness companion. What's bothering you today?"
    }
    
    // Default
    return "I'm here to help you feel better. Tell me what area needs relief."
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

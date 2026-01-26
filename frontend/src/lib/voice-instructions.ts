/**
 * Voice Instructions for Wellness Exercises
 * Provides audio guidance for sitting exercises
 */

export interface VoiceInstruction {
  text: string
  duration: number // milliseconds
  pauseAfter?: number // milliseconds
}

// Voice instruction scripts for each exercise
export const VOICE_INSTRUCTIONS = {
  "neck-relief": [
    {
      text: "Let's begin your neck relief exercise. Get comfortable in your chair.",
      duration: 4000,
      pauseAfter: 1000,
    },
    {
      text: "Sit upright with your feet flat on the floor. Relax your shoulders.",
      duration: 5000,
      pauseAfter: 2000,
    },
    {
      text: "Slowly tilt your head to the right. Feel the gentle stretch. Hold for five seconds.",
      duration: 8000,
      pauseAfter: 1000,
    },
    {
      text: "Good. Now bring your head back to center.",
      duration: 3000,
      pauseAfter: 1000,
    },
    {
      text: "Tilt your head to the left. Hold for five seconds. Breathe normally.",
      duration: 8000,
      pauseAfter: 1000,
    },
    {
      text: "Return to center. Now we'll do shoulder rolls.",
      duration: 4000,
      pauseAfter: 1000,
    },
    {
      text: "Roll your shoulders backward slowly. One, two, three, four, five.",
      duration: 10000,
      pauseAfter: 2000,
    },
    {
      text: "Take a deep breath in through your nose. Hold it. Now exhale slowly through your mouth.",
      duration: 8000,
      pauseAfter: 1000,
    },
    {
      text: "Beautiful. How does your neck feel now? You did great.",
      duration: 4000,
    },
  ],
  "shoulder-stretch": [
    {
      text: "Welcome to your shoulder and upper back stretch. Let's release that tension.",
      duration: 5000,
      pauseAfter: 1000,
    },
    {
      text: "Sit tall in your chair. Let your shoulders drop down, away from your ears.",
      duration: 6000,
      pauseAfter: 2000,
    },
    {
      text: "Bring your right arm across your chest.",
      duration: 4000,
      pauseAfter: 1000,
    },
    {
      text: "Use your left hand to gently hold your right arm. Feel the stretch in your shoulder.",
      duration: 6000,
      pauseAfter: 20000,
    },
    {
      text: "Good. Release and switch sides. Left arm across your chest.",
      duration: 5000,
      pauseAfter: 1000,
    },
    {
      text: "Hold with your right hand. Breathe into the stretch.",
      duration: 5000,
      pauseAfter: 20000,
    },
    {
      text: "Release. Now, reach both arms behind your back and interlace your fingers.",
      duration: 6000,
      pauseAfter: 2000,
    },
    {
      text: "Gently lift your arms, opening your chest. Hold for fifteen seconds. Keep breathing.",
      duration: 18000,
      pauseAfter: 2000,
    },
    {
      text: "Excellent work. Release and let your arms rest. Feel the difference?",
      duration: 5000,
    },
  ],
  "eye-relaxation": [
    {
      text: "Let's give your eyes a much-needed break from the screen.",
      duration: 4000,
      pauseAfter: 1000,
    },
    {
      text: "Look away from your screen right now. Find something about twenty feet away.",
      duration: 6000,
      pauseAfter: 1000,
    },
    {
      text: "Focus on that distant object for twenty seconds. Let your eyes relax.",
      duration: 22000,
      pauseAfter: 1000,
    },
    {
      text: "Now gently close your eyes.",
      duration: 3000,
      pauseAfter: 2000,
    },
    {
      text: "Cup your palms over your eyes. Don't press. Just let the warmth soothe them.",
      duration: 6000,
      pauseAfter: 1000,
    },
    {
      text: "Breathe slowly. Stay in this peaceful darkness for thirty seconds.",
      duration: 32000,
      pauseAfter: 2000,
    },
    {
      text: "When you're ready, slowly remove your hands and open your eyes. Your eyes are refreshed.",
      duration: 6000,
    },
  ],
  "box-breathing": [
    {
      text: "Welcome to box breathing. This will calm your nervous system in just two minutes.",
      duration: 6000,
      pauseAfter: 1000,
    },
    {
      text: "Sit comfortably. Place your hands on your lap. Close your eyes if you'd like.",
      duration: 6000,
      pauseAfter: 2000,
    },
    {
      text: "Let's begin. Breathe in slowly through your nose. One, two, three, four.",
      duration: 6000,
      pauseAfter: 500,
    },
    {
      text: "Hold your breath. One, two, three, four.",
      duration: 5000,
      pauseAfter: 500,
    },
    {
      text: "Breathe out slowly through your mouth. One, two, three, four.",
      duration: 6000,
      pauseAfter: 500,
    },
    {
      text: "Hold with empty lungs. One, two, three, four.",
      duration: 5000,
      pauseAfter: 1000,
    },
    {
      text: "Good. Let's do that again. Breathe in. One, two, three, four.",
      duration: 6000,
      pauseAfter: 500,
    },
    {
      text: "Hold. One, two, three, four.",
      duration: 5000,
      pauseAfter: 500,
    },
    {
      text: "Breathe out. One, two, three, four.",
      duration: 6000,
      pauseAfter: 500,
    },
    {
      text: "Hold. One, two, three, four.",
      duration: 5000,
      pauseAfter: 1000,
    },
    {
      text: "One more cycle. Breathe in. One, two, three, four.",
      duration: 6000,
      pauseAfter: 500,
    },
    {
      text: "Hold. One, two, three, four.",
      duration: 5000,
      pauseAfter: 500,
    },
    {
      text: "Breathe out. One, two, three, four.",
      duration: 6000,
      pauseAfter: 500,
    },
    {
      text: "Hold. One, two, three, four.",
      duration: 5000,
      pauseAfter: 2000,
    },
    {
      text: "Perfect. Return to your natural breathing. Notice how much calmer you feel.",
      duration: 6000,
    },
  ],
  "wrist-relief": [
    {
      text: "Let's take care of your wrists and hands. You've been typing a lot.",
      duration: 5000,
      pauseAfter: 1000,
    },
    {
      text: "Extend your right arm forward, palm facing up.",
      duration: 4000,
      pauseAfter: 2000,
    },
    {
      text: "With your left hand, gently pull your right fingers back toward you. Feel the stretch.",
      duration: 7000,
      pauseAfter: 15000,
    },
    {
      text: "Good. Now flip your palm down.",
      duration: 3000,
      pauseAfter: 2000,
    },
    {
      text: "Pull your fingers toward you again. Stretch the other side.",
      duration: 5000,
      pauseAfter: 15000,
    },
    {
      text: "Release. Now make tight fists with both hands.",
      duration: 4000,
      pauseAfter: 2000,
    },
    {
      text: "Spread your fingers wide. Fist. Spread. Keep going. Ten times.",
      duration: 15000,
      pauseAfter: 2000,
    },
    {
      text: "Now switch. Left arm forward, palm up. Pull fingers back with right hand.",
      duration: 6000,
      pauseAfter: 15000,
    },
    {
      text: "Flip palm down. Pull again.",
      duration: 4000,
      pauseAfter: 15000,
    },
    {
      text: "Shake both hands gently. You're all done. Your wrists thank you.",
      duration: 5000,
    },
  ],
  "spine-twist": [
    {
      text: "Time to release your lower back with a gentle sitting twist.",
      duration: 5000,
      pauseAfter: 1000,
    },
    {
      text: "Sit with your feet flat on the floor. Sit up tall, lengthening your spine.",
      duration: 6000,
      pauseAfter: 2000,
    },
    {
      text: "Place your right hand on the back of your chair.",
      duration: 4000,
      pauseAfter: 1000,
    },
    {
      text: "Place your left hand on your right knee.",
      duration: 4000,
      pauseAfter: 2000,
    },
    {
      text: "Gently twist to the right. Turn from your core, not just your shoulders.",
      duration: 6000,
      pauseAfter: 1000,
    },
    {
      text: "Hold this twist for twenty seconds. Keep breathing normally.",
      duration: 22000,
      pauseAfter: 2000,
    },
    {
      text: "Slowly come back to center.",
      duration: 3000,
      pauseAfter: 2000,
    },
    {
      text: "Now the other side. Left hand on the back of your chair.",
      duration: 5000,
      pauseAfter: 1000,
    },
    {
      text: "Right hand on your left knee.",
      duration: 3000,
      pauseAfter: 2000,
    },
    {
      text: "Twist to the left. Hold for twenty seconds. Breathe.",
      duration: 22000,
      pauseAfter: 2000,
    },
    {
      text: "Return to center. Beautiful work. Your spine feels more mobile now.",
      duration: 5000,
    },
  ],
}

/**
 * Text-to-Speech utility using Web Speech API
 */
export class VoiceGuide {
  private synthesis: SpeechSynthesis
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isPaused: boolean = false
  private voice: SpeechSynthesisVoice | null = null

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

    // Select a calm, female voice if available
    const voices = this.synthesis.getVoices()
    this.voice =
      voices.find((v) => v.name.includes("Female") || v.name.includes("Samantha")) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
  }

  speak(text: string, rate: number = 0.9): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.currentUtterance) {
        this.synthesis.cancel()
      }

      this.currentUtterance = new SpeechSynthesisUtterance(text)
      this.currentUtterance.rate = rate // Slow, calm pace
      this.currentUtterance.pitch = 1.0
      this.currentUtterance.volume = 1.0

      if (this.voice) {
        this.currentUtterance.voice = this.voice
      }

      this.currentUtterance.onend = () => resolve()
      this.currentUtterance.onerror = (error) => reject(error)

      this.synthesis.speak(this.currentUtterance)
    })
  }

  pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause()
      this.isPaused = true
    }
  }

  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume()
      this.isPaused = false
    }
  }

  stop() {
    this.synthesis.cancel()
    this.currentUtterance = null
    this.isPaused = false
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking
  }

  isPausedState(): boolean {
    return this.isPaused
  }
}

// Voice instructions for OTHER AGENTS (PlanPal, SpeakUp, GrowthGuru, PaisaWise)
export const AGENT_VOICE_GREETINGS = {
  wellness: "Hi! I'm FitHer, your wellness companion. I'm here to guide you through desk exercises and breathing techniques. All without leaving your chair.",
  planner: "Hello! I'm PlanPal, your time management assistant. I'll help you organize your day, prioritize tasks, and balance work with self-care.",
  speakup: "I'm SpeakUp, and I'm here for you. This is a safe, private space. You can share anything, and I'll listen without judgment.",
  upskill: "Welcome! I'm GrowthGuru, your career development coach. Let's explore courses, build your skills, and advance your career together.",
  finance: "Namaste! I'm PaisaWise, your personal finance advisor. I'll help you budget wisely, save smartly, and reach your financial goals.",
}

export const AGENT_VOICE_RESPONSES: Record<string, string[]> = {
  planner: [
    "Let me help you organize your day. What are your top three priorities right now?",
    "Time management starts with knowing what matters most. Let's create a realistic schedule together.",
    "Remember, it's okay to say no to some things. Let's focus on what's truly important.",
    "I see you have a busy day. Let's add some buffer time between tasks so you don't feel rushed.",
  ],
  speakup: [
    "Thank you for trusting me with this. Your feelings are completely valid.",
    "I'm here to support you. Would you like to talk about what happened, or would you prefer to just document it?",
    "You're not alone. Many women face similar situations. This is not your fault.",
    "Take your time. There's no pressure to share more than you're comfortable with.",
  ],
  upskill: [
    "I found some excellent courses that match your interests. Would you like me to tell you about them?",
    "Skill-building takes time, but even 15 minutes a day can make a difference. What skill interests you most?",
    "Let's look at your career goals. Where do you see yourself in the next year?",
    "I've researched some free certifications that could boost your resume. Interested?",
  ],
  finance: [
    "Let's talk about your savings goals. How much would you like to save each month?",
    "The fifty-thirty-twenty rule is a great starting point: fifty percent for needs, thirty percent for wants, twenty percent for savings.",
    "Small changes add up. Even saving five hundred rupees a week becomes twenty-six thousand a year.",
    "Would you like help creating a monthly budget? I can make it simple and realistic.",
  ],
}

/**
 * Speak a message for any agent
 */
export async function speakAgentMessage(
  botId: string,
  message: string,
  voiceGuide: VoiceGuide
): Promise<void> {
  try {
    await voiceGuide.speak(message)
  } catch (error) {
    console.error(`Error speaking message for ${botId}:`, error)
  }
}

/**
 * Speak agent greeting
 */
export async function speakAgentGreeting(
  botId: string,
  voiceGuide: VoiceGuide
): Promise<void> {
  const greeting = AGENT_VOICE_GREETINGS[botId as keyof typeof AGENT_VOICE_GREETINGS]
  if (greeting) {
    await speakAgentMessage(botId, greeting, voiceGuide)
  }
}

/**
 * Play voice instructions for an exercise
 */
export async function playExerciseInstructions(
  exerciseId: string,
  voiceGuide: VoiceGuide,
  onStepChange?: (step: number) => void
): Promise<void> {
  const instructions = VOICE_INSTRUCTIONS[exerciseId as keyof typeof VOICE_INSTRUCTIONS]
  
  if (!instructions) {
    console.warn(`No voice instructions found for exercise: ${exerciseId}`)
    return
  }

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i]
    onStepChange?.(i)

    try {
      await voiceGuide.speak(instruction.text)
      
      // Pause after instruction
      if (instruction.pauseAfter) {
        await new Promise((resolve) => setTimeout(resolve, instruction.pauseAfter))
      }
    } catch (error) {
      console.error("Error playing voice instruction:", error)
      break
    }
  }
}

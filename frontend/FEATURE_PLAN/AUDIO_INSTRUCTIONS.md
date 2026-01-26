# 🎧 Audio Instructions Guide for Wellness Avatar

## Overview

The **FitHer Wellness Avatar** now includes **voice-guided audio instructions** using the Web Speech API. The avatar speaks in a calm, soothing voice to guide users through each exercise step-by-step.

## ✨ Features

### 1. **Text-to-Speech Voice Guidance**
- Automatic voice narration for all exercises
- Calm, slow-paced female voice (when available)
- Natural pauses between instructions
- Synchronized with visual step indicators

### 2. **Voice Control Toggle**
- Enable/disable voice guidance
- Visual indicator when voice is active (pulsing icon)
- Tooltip feedback on hover
- Persists user preference

### 3. **Smart Timing**
- Each instruction has precise duration
- Built-in pauses for exercise holds
- Breathing cue timing
- Natural flow between steps

## 🗣️ Voice Instruction Scripts

### Available Exercises with Audio

All 6 exercises include full voice scripts:

#### 1. **Neck Relief** (2 min)
```
"Let's begin your neck relief exercise. Get comfortable in your chair."
"Sit upright with your feet flat on the floor. Relax your shoulders."
"Slowly tilt your head to the right. Feel the gentle stretch. Hold for five seconds."
... [full script in voice-instructions.ts]
```

#### 2. **Shoulder Stretch** (3 min)
```
"Welcome to your shoulder and upper back stretch. Let's release that tension."
"Sit tall in your chair. Let your shoulders drop down, away from your ears."
... [continues with detailed guidance]
```

#### 3. **Eye Relaxation** (1 min)
```
"Let's give your eyes a much-needed break from the screen."
"Look away from your screen right now. Find something about twenty feet away."
... [includes 20-20-20 rule timing]
```

#### 4. **Box Breathing** (2 min)
```
"Welcome to box breathing. This will calm your nervous system in just two minutes."
"Sit comfortably. Place your hands on your lap. Close your eyes if you'd like."
"Let's begin. Breathe in slowly through your nose. One, two, three, four."
... [guided breathing cycles with counts]
```

#### 5. **Wrist Relief** (2 min)
```
"Let's take care of your wrists and hands. You've been typing a lot."
"Extend your right arm forward, palm facing up."
... [detailed stretching guidance]
```

#### 6. **Spine Twist** (2 min)
```
"Time to release your lower back with a gentle sitting twist."
"Sit with your feet flat on the floor. Sit up tall, lengthening your spine."
... [safe twisting instructions]
```

## 🎯 Voice Characteristics

### Tone & Pace
- **Rate:** 0.9 (10% slower than normal speech)
- **Pitch:** 1.0 (natural)
- **Volume:** 1.0 (full)
- **Style:** Calm, encouraging, zen-like

### Voice Selection Priority
1. Female voice (if available)
2. "Samantha" voice (Mac/iOS)
3. English language voice
4. System default

### Language Patterns
✅ **Use:**
- "Let's begin..."
- "Good. Now..."
- "Feel the stretch..."
- "You're doing great..."
- "Beautiful work..."

❌ **Avoid:**
- Rushed commands
- Technical jargon
- Pressure language
- Judgmental phrases

## 🔧 Technical Implementation

### VoiceGuide Class

```typescript
class VoiceGuide {
  speak(text: string, rate: number): Promise<void>
  pause(): void
  resume(): void
  stop(): void
  isSpeaking(): boolean
}
```

### Voice Instruction Format

```typescript
interface VoiceInstruction {
  text: string          // What to say
  duration: number      // How long it takes (ms)
  pauseAfter?: number   // Silence after (ms)
}
```

### Example Instruction Timing

```typescript
{
  text: "Hold for twenty seconds. Keep breathing.",
  duration: 22000,  // 22 seconds total
  pauseAfter: 2000  // 2 second pause before next
}
```

## 🎨 UI Integration

### Avatar Panel Indicators

**Voice Enabled:**
- Pulsing Volume2 icon (teal color)
- Tooltip: "Voice guidance enabled"
- Animated pulse effect

**Voice Disabled:**
- Static VolumeX icon (muted color)
- Tooltip: "Enable voice guidance"

### Exercise Guide Modal

**During Voice Playback:**
- 🎧 Banner: "Listen carefully... FitHer is guiding you"
- Animated pulse effect
- Current step highlighted
- Progress through steps

**Play/Pause Button:**
- Voice ON: "Start Voice Guidance" 
- Voice OFF: "Start Exercise"
- Shows Play/Pause icons

## 🎬 User Flow

```
1. User opens exercise guide
   ↓
2. Voice guidance is ON by default
   ↓
3. User clicks "Start Voice Guidance"
   ↓
4. Avatar begins speaking instructions
   ↓
5. Visual steps highlight in sync
   ↓
6. Natural pauses for holds/breathing
   ↓
7. Exercise completes
   ↓
8. "Mark as Complete" appears
```

## 🔇 Accessibility Features

### For Users Who Want Silence
- Easy toggle to disable voice
- Visual-only mode still available
- All text instructions visible
- Manual step-through option

### For Users With Hearing Difficulties
- Full text transcripts visible
- Visual progress indicators
- Synchronized text highlighting
- Can follow along visually

## 🌐 Browser Compatibility

### Supported Browsers
✅ **Chrome/Edge:** Full support
✅ **Safari:** Full support (best voices)
✅ **Firefox:** Full support
✅ **Mobile Safari:** Full support
✅ **Mobile Chrome:** Full support

### Fallback Behavior
If Speech Synthesis unavailable:
- Voice toggle hidden
- Visual-only mode
- Manual timing continues
- All exercises still functional

## 💡 Best Practices

### For Voice Scripts

1. **Use Natural Language**
   ```
   ✅ "Gently tilt your head to the right"
   ❌ "Head tilt right execute now"
   ```

2. **Include Breathing Cues**
   ```
   ✅ "Hold for five seconds. Keep breathing normally."
   ❌ "Hold five seconds"
   ```

3. **Provide Encouragement**
   ```
   ✅ "Good. Now switch sides."
   ❌ "Switch sides"
   ```

4. **Count Out Loud**
   ```
   ✅ "One, two, three, four, five"
   ❌ "Count to five"
   ```

### For Timing

- **Instruction:** 3-6 seconds to speak
- **Action:** 5-20 seconds to perform
- **Transition:** 1-2 seconds pause
- **Breathing:** 20-30 seconds guided

## 🎤 Voice Customization (Future)

Potential enhancements:
- [ ] User-selectable voice
- [ ] Speed adjustment (0.7x - 1.0x)
- [ ] Language selection
- [ ] Voice personality choice
- [ ] Background meditation music
- [ ] Sound effects (chimes, bells)

## 📊 User Preferences Storage

```typescript
localStorage.setItem('wellness_voice_enabled', 'true')
localStorage.setItem('wellness_voice_rate', '0.9')
localStorage.setItem('wellness_voice_name', 'Samantha')
```

## 🐛 Error Handling

### Common Issues

**Voice Not Playing:**
- Check browser permissions
- Ensure user interaction occurred first
- Verify Speech Synthesis support
- Fall back to visual-only mode

**Voice Interrupted:**
- Handle page navigation
- Stop on modal close
- Cancel on pause
- Clean up on unmount

**Timing Sync Issues:**
- Use Promise-based flow
- Track current step
- Allow manual override
- Provide pause/resume

## 🎯 Success Metrics

Voice guidance succeeds when:
- ✨ Users feel personally coached
- 🧘 They can close their eyes and follow along
- ⏱️ Timing feels natural and not rushed
- 💙 Voice feels calm and supportive
- 🔄 They want to use it again

## 📖 Related Files

- [`voice-instructions.ts`](../lib/voice-instructions.ts) - Voice scripts & TTS
- [`wellness-exercises.tsx`](./wellness-exercises.tsx) - Exercise guide with audio
- [`avatar-panel.tsx`](./avatar-panel.tsx) - Voice control toggle
- [`WELLNESS_FEATURES.md`](../WELLNESS_FEATURES.md) - Main feature docs

---

**Remember:** The voice should feel like a supportive friend sitting next to you, not a drill sergeant or robot. Calm, warm, and patient.

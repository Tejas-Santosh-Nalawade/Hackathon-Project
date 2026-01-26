# 🎧 Audio Instructions - Quick Start Guide

## How to Use Voice Guidance

### For Users

1. **Select FitHer (Wellness Bot)** from the left sidebar
2. **Click on any Quick Relief button** (e.g., "2-min Neck Relief")
3. **Look for the voice icon** 🔊 in the exercise modal (enabled by default)
4. **Click "Start Voice Guidance"** button
5. **Listen and follow along** - you can close your eyes!
6. **The avatar will speak each step** with natural pauses
7. **Visual steps highlight** in sync with the audio

### Voice Controls

- **🔊 Volume Icon (Bottom Right of Avatar):** Toggle voice on/off
- **▶️ Play Button:** Start the voice-guided exercise
- **⏸️ Pause Button:** Stop the audio and visual guidance
- **✕ Close Button:** Exit (automatically stops audio)

### Tips for Best Experience

- 🎧 Use **headphones** for privacy in office
- 📱 Works on **mobile** (iOS/Android)
- 🖥️ Best on **Chrome/Safari** browsers
- 🔇 Can disable voice and just read
- 👁️ Close eyes and just listen
- ⏸️ Pause anytime you need

---

## Example: Neck Relief with Audio

**What You'll Hear:**

```
🎤 FitHer speaks:

"Let's begin your neck relief exercise. Get comfortable in your chair."
[1 second pause]

"Sit upright with your feet flat on the floor. Relax your shoulders."
[2 second pause]

"Slowly tilt your head to the right. Feel the gentle stretch. 
Hold for five seconds."
[8 seconds - you perform the stretch]

"Good. Now bring your head back to center."
[3 seconds]

"Tilt your head to the left. Hold for five seconds. Breathe normally."
[8 seconds]

"Return to center. Now we'll do shoulder rolls."
[4 seconds]

"Roll your shoulders backward slowly. One, two, three, four, five."
[10 seconds]

"Take a deep breath in through your nose. Hold it. 
Now exhale slowly through your mouth."
[8 seconds]

"Beautiful. How does your neck feel now? You did great."
```

**Visual Display (Synchronized):**

- Step 1 highlights ✅ → "Sit upright..."
- Step 2 highlights ✅ → "Slowly tilt..."
- Step 3 highlights ✅ → "Good. Now..."
- And so on...

---

## Technical Details

### Browser Support

| Browser | Voice Support | Quality |
|---------|--------------|---------|
| Chrome Desktop | ✅ Full | Good |
| Safari Desktop | ✅ Full | Excellent (Samantha) |
| Firefox Desktop | ✅ Full | Good |
| Edge Desktop | ✅ Full | Good |
| Chrome Mobile | ✅ Full | Good |
| Safari Mobile | ✅ Full | Excellent |

### Voice Characteristics

- **Rate:** 0.9x (slightly slower than normal)
- **Pitch:** 1.0 (natural)
- **Volume:** 100%
- **Preferred Voice:** Female, English
- **Fallback:** System default voice

### API Used

```typescript
// Web Speech API (built into browsers)
const utterance = new SpeechSynthesisUtterance(text)
utterance.rate = 0.9  // Calm pace
utterance.voice = femaleVoice  // Selected voice
speechSynthesis.speak(utterance)
```

---

## Exercise Duration with Audio

| Exercise | Text Duration | With Audio | Total Time |
|----------|---------------|------------|------------|
| Neck Relief | 2 min | + voice | ~2.5 min |
| Shoulder Stretch | 3 min | + voice | ~3.5 min |
| Eye Relaxation | 1 min | + voice | ~1.5 min |
| Box Breathing | 2 min | + voice | ~2 min |
| Wrist Relief | 2 min | + voice | ~2.5 min |
| Spine Twist | 2 min | + voice | ~2.5 min |

*Audio adds ~30 seconds for instructions but feels more guided*

---

## Accessibility

### For Users With Hearing Difficulties
- ✅ All text visible simultaneously
- ✅ Visual step highlighting
- ✅ Can follow along without audio
- ✅ Progress indicators

### For Users Who Prefer Silence
- ✅ Easy toggle to disable voice
- ✅ Same exercise quality without audio
- ✅ Manual step-through option

### For Users in Quiet Offices
- ✅ Use headphones
- ✅ Lower device volume
- ✅ Disable voice, read silently

---

## Privacy & Safety

- 🔒 **No recording** - only playback
- 🔇 **Local processing** - no data sent
- 👥 **Office-safe** - use headphones
- 🚫 **No internet required** for voice (after page load)

---

## Troubleshooting

### Voice Not Working?

1. **Check browser:** Use Chrome/Safari/Edge
2. **Enable permissions:** Allow audio playback
3. **Check volume:** Device not muted
4. **Try manual mode:** Disable voice, read steps

### Voice Too Fast/Slow?

Currently set to 0.9x (calm pace). Future updates will allow adjustment.

### Wrong Language?

Voice uses system language settings. English is default.

### Audio Cuts Off?

- Don't switch tabs during exercise
- Keep browser window active
- Pause before navigating away

---

## Future Enhancements

- [ ] Speed control slider (0.7x - 1.0x)
- [ ] Voice selection (male/female/accent)
- [ ] Background ambient sounds
- [ ] Multilingual support (Hindi, Tamil, etc.)
- [ ] Save favorite voice preference
- [ ] Volume control within app

---

## Demo Video (Conceptual)

```
[Visual Flow]

1. User clicks "2-min Neck Relief"
   ↓
2. Modal opens with avatar image
   ↓
3. Voice icon shows 🔊 (enabled)
   ↓
4. User clicks "Start Voice Guidance"
   ↓
5. 🎧 Banner appears: "Listen carefully..."
   ↓
6. Avatar speaks: "Let's begin..."
   ↓
7. Step 1 highlights in teal
   ↓
8. Avatar speaks next instruction
   ↓
9. Step 2 highlights
   ↓
10. Continues through all steps
   ↓
11. "Mark as Complete" button appears
   ↓
12. User feels calmer 💙
```

---

## Code Example

```typescript
// Simple usage
import { VoiceGuide, playExerciseInstructions } from '@/lib/voice-instructions'

const voiceGuide = new VoiceGuide()

// Play exercise with voice
await playExerciseInstructions(
  'neck-relief',  // exercise ID
  voiceGuide,     // voice instance
  setCurrentStep  // callback for step updates
)

// Manual control
voiceGuide.speak("Take a deep breath")
voiceGuide.pause()
voiceGuide.resume()
voiceGuide.stop()
```

---

## Success Stories (Expected)

> "I love that I can close my eyes and just follow the voice. It feels like having a personal trainer at my desk!" - *Future User*

> "The voice guidance makes it so much easier. I don't have to keep looking at the screen." - *Future User*

> "Finally, a wellness app that actually guides you through exercises, not just shows text." - *Future User*

---

## Summary

✅ **What Works:**
- 6 exercises with full audio scripts
- Voice-first, screen-optional design
- Natural, calm female voice
- Synchronized visual + audio
- Easy toggle on/off

🎯 **Core Value:**
Users can practice wellness with their **eyes closed**, fully guided by a supportive voice, making it feel like a **personal wellness coach** at their desk.

💙 **Mission Accomplished:**
"Calmer and lighter, without leaving your chair" - now with **audio support**!

---

For complete technical documentation, see [`AUDIO_INSTRUCTIONS.md`](./AUDIO_INSTRUCTIONS.md)

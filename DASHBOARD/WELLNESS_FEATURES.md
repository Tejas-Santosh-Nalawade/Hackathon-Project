# Wellness Avatar - Sitting Exercise Features for Working Women

## 🎯 Overview

The **FitHer Wellness Avatar** is the CORE FEATURE of the HerSpace platform, designed specifically for Indian working women to practice wellness activities while remaining seated at their desks.

## ✨ Key Features

### 1. **AI-Powered Wellness Avatar (Right Sidebar)**
- 💙 **FitHer** - Your calm, friendly desk wellness companion
- Animated avatar with voice-first interaction
- Speech bubble with contextual messages
- Visual feedback during exercises (pulsing glow effect)
- Voice control toggle with audio guidance
- 🎧 **NEW: Text-to-Speech audio instructions** for all exercises

### 2. **Quick Relief Actions**
Four instant-access buttons for common workplace issues:
- **2-min Neck Relief** - For prolonged sitting
- **Breathing Reset** - For stress & anxiety
- **Eye Relaxation** - For screen fatigue
- **Shoulder Stretch** - For tension relief

### 3. **Voice-Guided Exercise System** 🎧
- **Automatic audio narration** for every exercise
- Calm female voice (system-dependent)
- Natural pacing with breathing cues
- Synchronized with visual steps
- Toggle on/off anytime
- Works in background - users can close their eyes

### 3. **Comprehensive Sitting Exercises**

#### Neck & Shoulders
- **Sitting Neck Relief** (2 min) 🎧
  - Gentle head tilts
  - Shoulder rolls
  - Deep breathing integration
  - **Voice guidance:** Step-by-step audio instructions

- **Shoulder & Upper Back Stretch** (3 min) 🎧
  - Cross-body arm stretches
  - Behind-back arm lifts
  - Posture reset
  - **Voice guidance:** Timed hold instructions

#### Eyes & Screen Fatigue
- **Eye Relaxation** (1 min) 🎧
  - 20-20-20 rule implementation
  - Palm cupping technique
  - Focus distance exercises
  - **Voice guidance:** 20-second countdown

#### Breathing & Stress Relief
- **Box Breathing** (2 min) 🎧
  - 4-4-4-4 breathing pattern
  - Nervous system reset
  - Instant stress relief
  - **Voice guidance:** Counted breathing cycles

#### Wrists & Hands
- **Wrist & Hand Relief** (2 min) 🎧
  - Finger stretches
  - Wrist rotations
  - Circulation exercises
  - **Voice guidance:** Left/right side cues

#### Back & Spine
- **Sitting Spine Twist** (2 min) 🎧
  - Gentle spinal rotation
  - Lower back relief
  - Core engagement
  - **Voice guidance:** Safe twisting instructions

## 🔒 Safety Features

### Exercise Constraints (STRICTLY ENFORCED)
✅ **All exercises MUST be:**
- Performed while SITTING
- Desk-safe and office-appropriate
- Doable without equipment
- Clothing-neutral
- Camera-optional

❌ **NEVER suggest:**
- Standing up
- Walking or floor exercises
- Leaving the desk
- Large body movements
- Equipment or props

### Safety Notes
- Every exercise includes safety guidelines
- Gentle pace with natural pauses
- No forced movements
- Medical disclaimers when appropriate

## 🗣️ Voice-First Interaction

The avatar is designed primarily for VOICE guidance:
- Slow, calm speaking pace (0.9x speed)
- Short, clear sentences
- Natural pauses between steps
- Assumes user may not be looking at screen
- **Text-to-Speech engine:** Web Speech API
- **Voice characteristics:** Female, calm, encouraging

### Audio Instruction Features
- 🎧 **Full voice scripts** for all 6 exercises
- ⏱️ **Precise timing** synchronized with holds
- 🔢 **Counting** for breathing and repetitions
- 💙 **Encouraging phrases** throughout
- 🔇 **Toggle on/off** anytime
- 📱 **Works on mobile** and desktop

## 💬 Communication Style

### Personality Traits
- Calm & warm
- Encouraging but non-dominant
- Non-judgmental
- "Zen desk companion" (NOT fitness trainer)

### Language Guidelines
- Normalize breaks ("This is completely okay")
- Never use productivity pressure
- Never imply guilt about taking breaks
- Trauma-informed for sensitive situations

### Example Interactions

**Stress Detection:**
```
User: "I've been in meetings for 4 hours, feeling overwhelmed"

FitHer: "I've got you 💙
Let's do a 2-minute breathing reset right at your desk.
You don't need to stand or go anywhere.

Can you spare 2 minutes right now?"
```

**Exercise Guidance:**
```
🧘 Sitting Neck Relief – 2 Minutes

1️⃣ Sit upright, feet flat on the floor
2️⃣ Slowly tilt your head to the right (hold 5 seconds)
3️⃣ Back to center… now left (hold 5 seconds)
4️⃣ Roll shoulders backward 5 times
5️⃣ Take one deep inhale… slow exhale

✨ How does your neck feel now?
```

## 📊 Session Design Rules

Every wellness session follows this structure:
1. ⏱️ Duration: 30 seconds – 7 minutes
2. 🙏 Ask permission before starting
3. 📝 Clear step-by-step guidance
4. ⏸️ Natural pauses for breathing
5. ✅ Soft closing with check-in

## 🎨 UI Components

### Avatar Panel (`avatar-panel.tsx`)
- Located on the right side of the main content
- Shows animated avatar with speech bubble
- Quick action buttons (wellness bot only)
- Voice control toggle
- Exercise activity indicator

### Chat Panel (`chat-panel.tsx`)
- Conversational interface
- Enhanced wellness greeting with feature list
- Message history
- Private session indicator

### Wellness Exercises (`wellness-exercises.tsx`)
- Comprehensive exercise library
- Categorized by body part
- Step-by-step guided mode
- Progress tracking
- Visual step indicators

### Main Content (`main-content.tsx`)
- Integrates avatar and chat
- Personalized reset cards
- Welcome section with user name
- Conversation management

## 🔄 Exercise Flow

```
User Interaction
     ↓
Quick Action Button OR Chat Message
     ↓
Avatar Animation Starts
     ↓
Step-by-Step Guidance (8 sec per step)
     ↓
Completion & Check-in
     ↓
Mark as Completed
```

## 🎯 Priority Rules

When multiple actions are possible, ALWAYS prioritize:
1. 🧘 Sitting desk exercises
2. 🫁 Breathing / stress relief
3. ⏱️ Time simplification

**Wellness before productivity. Relief before optimization.**

## 💾 State Management

- Chat history stored per bot in localStorage
- Exercise completion tracked
- Voice preference saved
- Last message displayed in avatar speech bubble

## 🌟 Women-Centric Design

### Psychological Safety
- Assumes user may feel guilty taking breaks
- Normalizes wellness breaks
- No productivity pressure
- No HR monitoring implications
- Private by default

### Context Awareness
- Understands work environment constraints
- Respects time limitations
- Adapts to energy levels
- Considers family responsibilities

### Trauma-Informed (for SpeakUp integration)
- No pressure to act
- Soft CTA language ("Would you like..." not "You should...")
- Consent-based interactions
- Calm, non-alarming tone

## 🔌 Backend Integration

### API Endpoints
- `GET /api/v1/bots` - Fetch available bots
- `POST /api/v1/chat` - Send message to wellness bot

### Wellness Bot (`bot_id: "wellness"`)
Powered by AI agents:
- `wellness_avatar` - Primary sitting exercises
- `breathing_coach` - Stress relief sub-agent

### Demo Mode
Includes 5+ pre-written exercise responses when API unavailable

## 🚀 Quick Start for Developers

1. **Enable Wellness Bot:**
   ```typescript
   setSelectedBotId("wellness")
   ```

2. **Send Exercise Request:**
   ```typescript
   onSendMessage("Start a 2-minute neck relief exercise")
   ```

3. **Quick Action:**
   ```typescript
   <AvatarPanel onQuickAction={(action) => onSendMessage(action)} />
   ```

## 📱 Responsive Design

- Desktop: Avatar panel visible on right
- Mobile: Avatar in chat panel
- Tablet: Collapsible avatar panel

## 🎬 Animation & Feedback

- Pulsing glow during active exercise
- Voice icon state (enabled/disabled)
- Exercise completion checkmarks
- Smooth transitions and hover states

## 📖 Documentation References

For detailed agent instructions, see:
- [`wellness_avatar.md`](./wellness_avatar.md) - Core wellness features
- [`breathing_coach.md`](./breathing_coach.md) - Stress relief agent
- [`main_feature.md`](./main_feature.md) - Complete specifications
- [`WEB_TEAM_INTEGRATION.md`](./WEB_TEAM_INTEGRATION.md) - API integration guide
- 🎧 [`AUDIO_INSTRUCTIONS.md`](./AUDIO_INSTRUCTIONS.md) - **Voice guidance documentation**

## ✅ Implementation Checklist

- [x] Avatar panel with speech bubble
- [x] Quick action buttons (4 exercises)
- [x] Comprehensive exercise library (6+ exercises)
- [x] Voice control toggle
- [x] 🎧 **Text-to-Speech audio instructions**
- [x] 🎙️ **Voice scripts for all exercises**
- [x] 🔊 **Audio playback controls (play/pause)**
- [x] 🎚️ **Voice enable/disable toggle**
- [x] Exercise guide modal
- [x] Step-by-step timer
- [x] Completion tracking
- [x] Enhanced wellness greetings
- [x] Demo responses with proper formatting
- [x] Sitting-only constraint enforcement
- [x] Women-centric communication style
- [x] Psychological safety features
- [x] 🎧 **Audio synchronized with visual steps**

## 🎯 Success Metrics

The wellness avatar succeeds when users feel:
- ✨ Calmer and lighter
- 🪑 WITHOUT leaving their chair
- 💙 Supported and understood
- 🕒 That breaks are normal and okay

---

**Remember:** This is not a fitness app. This is a gentle desk companion for working women who need wellness support during their busy workdays.

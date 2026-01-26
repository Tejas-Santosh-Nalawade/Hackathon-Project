export interface GuidedSession {
  id: string
  title: string
  botId: string
  steps: {
    id: number
    instruction: string
    duration: number
  }[]
}

export const guidedSessions: Record<string, GuidedSession[]> = {
  wellness: [
    {
      id: "neck-relief",
      title: "Desk Neck & Shoulder Relief",
      botId: "wellness",
      steps: [
        {
          id: 1,
          instruction: "Hi there! I know how it feels after hours at your desk - that stiffness in your neck and shoulders. Let's fix that together. Sit comfortably in your chair with both feet flat on the floor. Take a deep breath and let your shoulders drop away from your ears. You deserve this break.",
          duration: 10,
        },
        {
          id: 2,
          instruction: "Perfect! Now, slowly and gently drop your right ear toward your right shoulder. You don't need to force it - just let gravity do the work. Feel that beautiful stretch on the left side of your neck? That's all the tension from typing and staring at screens melting away. Hold here and breathe naturally.",
          duration: 10,
        },
        {
          id: 3,
          instruction: "Wonderful! Slowly bring your head back to center. Take a moment here. Roll your shoulders back once. Notice how even this small movement helps? Now take one deep breath in through your nose, filling your belly, and exhale slowly through your mouth.",
          duration: 7,
        },
        {
          id: 4,
          instruction: "Beautiful! Now let's do the other side. Gently drop your left ear toward your left shoulder. Feel that stretch on the right side of your neck? All those hours hunched over your keyboard created this tightness, but you're releasing it now. Breathe into the stretch. You're doing great!",
          duration: 10,
        },
        {
          id: 5,
          instruction: "Excellent work! Come back to center. Now place your hands on your shoulders and gently roll both shoulders backward in slow, smooth circles. One, two, three, four, five. Feel your shoulder blades moving? This releases tension from sitting in the same position for too long.",
          duration: 12,
        },
        {
          id: 6,
          instruction: "You did it! Take one final deep breath in, and as you exhale, let go of all that desk tension. Doesn't your neck feel so much lighter? Remember, you can do this anytime you feel stiff - your body will thank you! Make this a daily habit, mama. You deserve to feel good in your body.",
          duration: 10,
        },
      ],
    },
    {
      id: "lower-back-sitting",
      title: "Lower Back Relief for Long Sitting",
      botId: "wellness",
      steps: [
        {
          id: 1,
          instruction: "Lower back pain from sitting too long? I hear you, sister. Let's give your hardworking back some love. Start by sitting at the edge of your chair with your feet flat on the floor, hip-width apart. Sit tall and place your hands on your knees. This is your safe space.",
          duration: 10,
        },
        {
          id: 2,
          instruction: "Good! Now, place both hands on your lower back for support. Gently arch your back, pushing your chest forward and lifting your gaze slightly upward. Imagine creating space between each vertebra. Hold this gentle arch for 5 seconds. This counteracts all that forward slouching we do at our desks.",
          duration: 10,
        },
        {
          id: 3,
          instruction: "Perfect! Now do the opposite. Round your back like a cat, tucking your chin to your chest and pulling your belly button toward your spine. Hold for 5 seconds. This movement massages your spine and releases compression from sitting. You're doing amazing!",
          duration: 10,
        },
        {
          id: 4,
          instruction: "Beautiful! Let's repeat this flow two more times. Arch your back, lifting your chest and gaze. Then round your back, tucking your chin. Move slowly and mindfully with your breath. Inhale as you arch, exhale as you round. This is like a massage for your spine!",
          duration: 15,
        },
        {
          id: 5,
          instruction: "Wonderful! Now come back to a neutral seated position. Place your right hand on the outside of your left knee and gently twist your upper body to the left. Look over your left shoulder. Hold for 10 seconds. Feel that release in your lower back? That's all the sitting tension unwinding.",
          duration: 12,
        },
        {
          id: 6,
          instruction: "Excellent! Return to center and switch sides. Left hand on right knee, twist to the right, look over your right shoulder. Hold for 10 seconds. These gentle twists release the pressure that builds up from sitting in one position for hours.",
          duration: 12,
        },
        {
          id: 7,
          instruction: "You're a star! Come back to center and take a deep breath. Your lower back should feel so much better now. Remember, your body wasn't designed to sit all day - it needs these little movement breaks. Do this every 2 hours and your back will love you forever!",
          duration: 10,
        },
      ],
    },
    {
      id: "wrist-hand-relief",
      title: "Wrist & Hand Relief for Typing",
      botId: "wellness",
      steps: [
        {
          id: 1,
          instruction: "Those hands of yours do so much - typing, scrolling, holding your phone. They deserve care! Let's give them relief. Shake out both hands loosely for 5 seconds. Let them dangle and shake like you're shaking off water. Feel that tingling? That's circulation returning!",
          duration: 8,
        },
        {
          id: 2,
          instruction: "Perfect! Now make gentle fists with both hands. Squeeze for 3 seconds - not too tight, just firm. Now open your hands wide, spreading all your fingers as far as they'll go. Hold for 3 seconds. Let's do that again: squeeze into fists, and spread wide. This releases typing tension!",
          duration: 10,
        },
        {
          id: 3,
          instruction: "Great work! Now extend your right arm straight out in front of you, palm facing away like you're saying 'stop'. Use your left hand to gently pull your right fingers back toward your body. Feel that stretch in your wrist and forearm? Hold for 10 seconds. This stretch is gold for keyboard warriors!",
          duration: 12,
        },
        {
          id: 4,
          instruction: "Wonderful! Now flip your right hand so the palm faces down, fingers pointing toward the floor. Use your left hand to gently press your right fingers toward your body. Hold for 10 seconds. Feel that stretch on top of your wrist? That's where so much typing tension lives!",
          duration: 12,
        },
        {
          id: 5,
          instruction: "Excellent! Switch sides. Left arm out, palm facing away. Right hand gently pulls left fingers back. Hold for 10 seconds. Then flip the left palm down, fingers toward floor, and press with the right hand. Hold for 10 seconds. Even just doing this a few times a day prevents so much pain!",
          duration: 24,
        },
        {
          id: 6,
          instruction: "Amazing! Now make big, slow circles with both wrists at the same time. Five circles one direction, then five circles the other direction. This mobilizes all those tiny joints and tendons. Finish by shaking your hands out one more time. Your hands and wrists should feel so much better! Do this hourly if you can.",
          duration: 15,
        },
      ],
    },
    {
      id: "eye-strain-relief",
      title: "Eye Relief from Screen Time",
      botId: "wellness",
      steps: [
        {
          id: 1,
          instruction: "Your eyes work so hard staring at screens all day. Let's give them a break. First, look away from your screen entirely. Find something far away - at least 20 feet if possible. Maybe a tree outside your window, or a picture on the far wall.",
          duration: 8,
        },
        {
          id: 2,
          instruction: "Good! Now focus on that distant object for the next 20 seconds. Really look at it. Blink naturally as you would normally. This is the 20-20-20 rule eye doctors recommend: every 20 minutes, look at something 20 feet away for 20 seconds. Your eye muscles are relaxing right now!",
          duration: 20,
        },
        {
          id: 3,
          instruction: "Wonderful! Now gently close your eyes. Not squeezed tight - just a soft, gentle closure. Take three slow, deep breaths. With each exhale, let your eye muscles relax more and more. They've been working so hard to focus on that bright screen.",
          duration: 10,
        },
        {
          id: 4,
          instruction: "Perfect! Keep your eyes closed. Now rub your palms together briskly for a few seconds to warm them up. Good! Now cup your warmed palms over your closed eyes without pressing on them. Let your eyes rest in this warm, comforting darkness for 30 seconds. This is called palming, and it's incredibly soothing.",
          duration: 35,
        },
        {
          id: 5,
          instruction: "Beautiful! Slowly lower your hands and gently flutter your eyelids a few times before fully opening your eyes. Blink naturally several times. Notice how refreshed your eyes feel? Try to do this exercise every hour - your eyes will thank you! And don't forget to blink often when you're working. We forget to blink enough when we're focused on screens!",
          duration: 10,
        },
      ],
    },
    {
      id: "mindful-breathing",
      title: "Mindful Breathing for Stress Relief",
      botId: "wellness",
      steps: [
        {
          id: 1,
          instruction: "Life can be overwhelming, can't it? Between work deadlines, family responsibilities, endless to-do lists... let's pause together. Sit comfortably in your chair. You can close your eyes or keep them softly focused downward - whatever feels right. This is your moment.",
          duration: 10,
        },
        {
          id: 2,
          instruction: "Let's start by noticing your breath as it is right now. Don't change it yet, just notice. Is it shallow? Quick? Held? There's no judgment here. Just awareness. Place one hand on your belly if that feels comfortable.",
          duration: 8,
        },
        {
          id: 3,
          instruction: "Now let's breathe together. I'm going to count, and you breathe in slowly through your nose. Ready? Breathe in: one, two, three, four. Good! Now hold gently for a moment. And breathe out slowly through your mouth: one, two, three, four, five, six. Feel that release?",
          duration: 15,
        },
        {
          id: 4,
          instruction: "Perfect! Let's do that again. Deep breath in through your nose: one, two, three, four. Filling your belly, your chest, all the way up. Hold it gently. And exhale slowly: one, two, three, four, five, six. With each exhale, let go of tension, worry, stress.",
          duration: 15,
        },
        {
          id: 5,
          instruction: "You're doing beautifully. One more time. Breathe in slowly: one, two, three, four. You're safe. You're here. Now exhale: one, two, three, four, five, six. Let it all go. You don't have to carry it all right now.",
          duration: 15,
        },
        {
          id: 6,
          instruction: "Wonderful! Now just breathe naturally for a moment. Notice how your shoulders have dropped. How your jaw is softer. How your mind is quieter. This calm is always available to you, anytime, with just a few deep breaths. Remember this feeling.",
          duration: 12,
        },
        {
          id: 7,
          instruction: "When you're ready, gently open your eyes if they were closed. Take one more deep breath. You just gave yourself the gift of peace in the middle of your busy day. That's powerful, mama. You deserve these moments. Come back to your breath whenever you need this calm.",
          duration: 10,
        },
      ],
    },
    {
      id: "desk-meditation",
      title: "Desk Meditation for Busy Women",
      botId: "wellness",
      steps: [
        {
          id: 1,
          instruction: "You don't need to leave your desk to meditate. Let's do this together right here, right now. Sit comfortably in your chair with your feet flat on the floor. Rest your hands on your thighs or in your lap. You can keep your eyes open or closed - your choice. This is your moment.",
          duration: 12,
        },
        {
          id: 2,
          instruction: "Take three deep breaths with me. Inhale deeply through your nose, filling your belly. Exhale slowly through your mouth, releasing everything. Let's do this together: Breathe in... and out. Breathe in... and out. One more time: Breathe in... and out.",
          duration: 18,
        },
        {
          id: 3,
          instruction: "Good! Now let's scan your body for tension. Start at the top of your head. Is your forehead scrunched? Relax it. Move to your jaw - are you clenching? Let it soften. Drop your tongue from the roof of your mouth. Just notice and release.",
          duration: 12,
        },
        {
          id: 4,
          instruction: "Move your awareness to your shoulders. Are they up by your ears? Let them drop down. Roll them back slightly. Feel your shoulder blades slide down your back. Release all that carrying, all that holding. You don't have to hold it all right now.",
          duration: 12,
        },
        {
          id: 5,
          instruction: "Check your hands. Are they gripping or clenched? Open them gently. Relax your fingers. Even your hands can hold stress. Let them rest softly.",
          duration: 8,
        },
        {
          id: 6,
          instruction: "Notice your breath again. Not changing it, just observing. Feel the cool air entering your nose, the warm air leaving. The gentle rise and fall of your chest. This simple act of breathing is keeping you alive. How amazing is that?",
          duration: 12,
        },
        {
          id: 7,
          instruction: "Your mind might wander - that's completely normal. You might think about your to-do list, a difficult conversation, what's for dinner. When you notice your mind wandering, gently - without judgment - bring your attention back to your breath. It's called practice because you keep practicing.",
          duration: 15,
        },
        {
          id: 8,
          instruction: "Let's spend the next 30 seconds in silence. Just you, your breath, and this moment of peace. I'll be here with you. Breathe naturally and let yourself just be...",
          duration: 30,
        },
        {
          id: 9,
          instruction: "Beautiful! You just meditated. That's it - that's meditation. Being present, breathing, noticing, returning. You can do this anytime you feel overwhelmed. Two minutes, five minutes, even 30 seconds helps. You deserve these moments of peace in your busy day.",
          duration: 15,
        },
        {
          id: 10,
          instruction: "Take one final deep breath in, and as you exhale, open your eyes if they were closed. Look around and notice how you feel. Calmer? More centered? That's the power you hold within you. Carry this peace with you for the rest of your day. You're doing amazing!",
          duration: 15,
        },
      ],
    },
  ],
}

export function getSessionsForBot(botId: string): GuidedSession[] {
  // Only wellness bot has guided sessions - sitting exercises and meditation
  return guidedSessions[botId] || []
}

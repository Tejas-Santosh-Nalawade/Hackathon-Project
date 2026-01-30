# Analytics Dashboard - HerSpace

## Overview
The Analytics Dashboard provides comprehensive insights into user interactions, conversations, bot usage, and platform performance.

## Features

### 📊 Key Metrics
- **Total Conversations**: Track all user conversations with AI bots
- **Active Users**: Monitor unique users engaging with the platform
- **Guided Sessions**: Count of wellness sessions completed
- **User Retention**: Measure user loyalty and return rates

### 💬 Conversations Tab
View all conversations with detailed information:
- User name and bot interaction
- Message count and duration
- Conversation topic
- Sentiment analysis (positive, neutral, concerned)
- Timestamp of each conversation

### 👥 Users Tab
Monitor user activity patterns:
- Total sessions per user
- Favorite bot preferences
- Last active timestamp
- Average session duration
- Guided sessions completed

### 🤖 Bot Usage Tab
Analyze bot performance:
- Total sessions per bot
- Unique user count
- Average rating
- Visual usage comparison

### 💡 Insights Tab
Get actionable intelligence:
- **Peak Usage Time**: Identifies when users are most active
- **Most Popular Feature**: Highlights top-performing features
- **Page Analytics**: Track page views, average time, and bounce rates
- **Data-Driven Recommendations**: AI-generated suggestions for improvement

## How to Access
1. Click on your profile picture in the top-right corner
2. Select "Analytics" from the dropdown menu
3. Or navigate directly to `/analytics`

## Analytics Tracking

### Automatic Tracking
The platform automatically tracks:
- Every message sent by users
- Bot interactions
- Guided session completions
- Page views and navigation
- User activities

### Manual Tracking
You can also track custom events using the `analyticsTracker`:

```typescript
import { analyticsTracker } from "@/lib/analytics-tracker"

// Track a conversation
analyticsTracker.trackConversation({
  userId: "user-123",
  userName: "Priya S.",
  botId: "wellness",
  botName: "FitHer Wellness",
  timestamp: new Date(),
  messageCount: 10,
  duration: 360, // seconds
  topic: "Stress relief",
  sentiment: "positive"
})

// Track page view
analyticsTracker.trackPageView({
  userId: "user-123",
  page: "/analytics",
  timestamp: new Date(),
  duration: 120 // seconds
})

// Track user activity
analyticsTracker.trackActivity({
  userId: "user-123",
  userName: "Priya S.",
  action: "completed_guided_session",
  timestamp: new Date(),
  metadata: {
    sessionId: "neck-relief",
    duration: 300
  }
})
```

## Data Storage
- All analytics data is stored locally in browser localStorage
- Data persists across sessions
- Privacy-focused: No data sent to external servers
- Clear data: Call `analyticsTracker.clearAll()` to reset

## Recommendations Engine
The Insights tab provides data-driven recommendations based on:
- User engagement patterns
- Feature popularity
- Usage time analysis
- Bounce rate evaluation
- Session completion rates

## Time Range Filters
View analytics for different periods:
- **Today**: Last 24 hours
- **Week**: Last 7 days
- **Month**: Last 30 days
- **Quarter**: Last 90 days

## Export Data
Click the "Export" button to download analytics data in JSON format for further analysis.

## Future Enhancements
- Real-time analytics dashboard
- Advanced sentiment analysis
- Predictive analytics
- Custom date range selection
- Comparison views (week-over-week, month-over-month)
- Integration with backend analytics services
- User segmentation
- Cohort analysis
- Funnel visualization

## API Reference

### analyticsTracker Methods

#### `trackConversation(event: ConversationEvent)`
Track a conversation between user and bot.

#### `trackPageView(event: PageViewEvent)`
Track when a user views a page.

#### `trackActivity(event: UserActivityEvent)`
Track any user activity or custom event.

#### `getConversations(limit?: number)`
Get all conversations, optionally limited to recent N.

#### `getUserConversations(userId: string)`
Get all conversations for a specific user.

#### `getBotConversations(botId: string)`
Get all conversations for a specific bot.

#### `getSummary()`
Get aggregated analytics summary.

#### `getBotStats()`
Get usage statistics for all bots.

#### `clearAll()`
Clear all analytics data.

## Privacy & Security
- All data stored locally
- No personal information transmitted
- User-controlled data retention
- Compliant with privacy regulations
- Opt-out available

---

Built with ❤️ for HerSpace - Empowering Women Through Technology

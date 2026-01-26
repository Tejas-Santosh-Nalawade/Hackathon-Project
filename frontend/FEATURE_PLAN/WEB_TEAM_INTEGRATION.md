# Web Team Integration Guide

**AI Support Platform for Working Women in India**

This guide contains everything you need to integrate the frontend with our backend API. Expected integration time: **1-2 hours**.

---

## 🚀 Quick Start

### Base URLs

- **Development**: `http://localhost:8000`
- **Production**: _(TBD - will be provided)_

### Running the Backend Locally

1. **Navigate to backend folder**:

   ```bash
   cd backend
   ```

2. **Create Python virtual environment** (first time only):

   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:

   ```bash
   # Windows
   venv\Scripts\activate

   # Mac/Linux
   source venv/bin/activate
   ```

4. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**:

   - Copy `.env.example` to `.env`
   - Get a free Groq API key from: https://console.groq.com/keys
   - Add your key to `.env`:
     ```
     GROQ_API_KEY=your_actual_key_here
     ```

6. **Start the server**:

   ```bash
   uvicorn main:app --reload
   ```

   Server will run at `http://localhost:8000`

7. **Verify it's running**:
   Open `http://localhost:8000` in your browser. You should see:
   ```json
   { "status": "ok", "service": "women-support-ai-backend" }
   ```

---

## 📡 API Endpoints

### 1. GET /api/v1/bots

**Purpose**: Get list of all available bots for the selector UI.

**Request**:

```javascript
GET http://localhost:8000/api/v1/bots
```

**Response** (200 OK):

```json
[
  {
    "bot_id": "wellness",
    "title": "FitHer",
    "description": "Your wellness & fitness coach — workouts, nutrition, energy tips",
    "icon_emoji": "💪"
  },
  {
    "bot_id": "planner",
    "title": "PlanPal",
    "description": "Master your time — prioritize, plan, say no to overcommitment",
    "icon_emoji": "📅"
  },
  {
    "bot_id": "speakup",
    "title": "SpeakUp",
    "description": "Harassment & safety support — guidance, process info, emotional validation",
    "icon_emoji": "🛡️"
  },
  {
    "bot_id": "upskill",
    "title": "GrowthGuru",
    "description": "Career coach — resume, interviews, negotiation, upskilling paths",
    "icon_emoji": "🚀"
  },
  {
    "bot_id": "finance",
    "title": "PaisaWise",
    "description": "Finance helper — budgeting, savings, expense tracking tips",
    "icon_emoji": "💰"
  }
]
```

---

### 2. POST /api/v1/chat

**Purpose**: Send a message to a bot and receive a response.

**Request**:

```javascript
POST http://localhost:8000/api/v1/chat
Content-Type: application/json

{
  "bot_id": "wellness",
  "message": "I'm feeling tired all the time. Any tips?",
  "history": [
    {
      "role": "user",
      "content": "Hi FitHer!"
    },
    {
      "role": "assistant",
      "content": "Hey! I'm FitHer, your wellness buddy. How can I help you today?"
    }
  ]
}
```

**Request Schema**:

- `bot_id` (string, **required**): One of: `wellness`, `planner`, `speakup`, `upskill`, `finance`
- `message` (string, **required**): User's message (1-2000 characters)
- `history` (array, **optional**): Previous conversation turns. Each object has:
  - `role`: Either `"user"` or `"assistant"`
  - `content`: Message text
  - **Default**: Empty array `[]` (no history)

**Success Response** (200 OK):

```json
{
  "reply": "Quick win: Start with 10-15 minute walks after dinner. Simple, doable, helps energy. Also check — are you drinking enough water? Dehydration = constant tiredness. Aim for 2-3L/day. How's your sleep been?",
  "bot_id": "wellness",
  "search_results": null
}
```

**Success Response with Search Results** (GrowthGuru only):

```json
{
  "reply": "I found some great free courses for you! Check out 'Python for Everybody' on Coursera...",
  "bot_id": "upskill",
  "search_results": [
    {
      "title": "Python for Everybody - Coursera",
      "url": "https://www.coursera.org/specializations/python",
      "snippet": "Learn Python programming from basics to advanced. Free to audit."
    },
    {
      "title": "Google Data Analytics Certificate",
      "url": "https://grow.google/certificates/data-analytics/",
      "snippet": "Professional certificate in data analytics. Job-ready skills."
    }
  ]
}
```

**Error Response** (400 Bad Request):

```json
{
  "error": "Invalid bot_id: 'unknown'. Valid options: wellness, planner, speakup, upskill, finance",
  "code": "INVALID_BOT_ID"
}
```

**Error Response** (500 Internal Server Error):

```json
{
  "error": "Service is temporarily busy. Please try again in a moment.",
  "code": "RATE_LIMITED"
}
```

**Possible Error Codes**:

- `INVALID_BOT_ID`: The bot_id doesn't exist
- `EMPTY_MESSAGE`: Message is empty or only whitespace
- `CONTENT_BLOCKED`: Message triggered content filter (ask user to rephrase)
- `RATE_LIMITED`: API rate limit hit (Groq free tier limit)
- `API_ERROR`: Generic error (retry recommended)

---

## 🤖 Bot Information

### All 5 Bots

| Bot ID     | Title      | Emoji | Description                  | Special Features              |
| ---------- | ---------- | ----- | ---------------------------- | ----------------------------- |
| `wellness` | FitHer     | 💪    | Wellness & fitness coach     | None                          |
| `planner`  | PlanPal    | 📅    | Time management & planning   | None                          |
| `speakup`  | SpeakUp    | 🛡️    | Harassment & safety support  | Trauma-informed, never rushes |
| `upskill`  | GrowthGuru | 🚀    | Career coaching & upskilling | **Web search enabled**        |
| `finance`  | PaisaWise  | 💰    | Personal finance & budgeting | None                          |

### GrowthGuru's Search Feature

**When is search triggered?**

- Only for bot_id `upskill` (GrowthGuru)
- Only when user message contains keywords like:
  - Course, learn, certification, skill, training
  - Job, hiring, career switch

**What's in search_results?**

- Array of 3-5 results (or `null` if no search performed)
- Each result has: `title`, `url`, `snippet`
- Results come from DuckDuckGo search

**Frontend display**:

- Show search results as **clickable cards** below the bot's reply
- Each card should show: title, snippet (truncated), and link to URL
- Open links in new tab: `target="_blank" rel="noopener noreferrer"`

---

## 💻 Frontend Implementation Guide

### 1. Chat History Management

**Recommendation: Use localStorage**

Store chat history per bot separately:

```javascript
// Save history for a specific bot
function saveChatHistory(botId, history) {
  localStorage.setItem(`chat_history_${botId}`, JSON.stringify(history));
}

// Load history for a specific bot
function loadChatHistory(botId) {
  const stored = localStorage.getItem(`chat_history_${botId}`);
  return stored ? JSON.parse(stored) : [];
}

// Clear history for a specific bot
function clearChatHistory(botId) {
  localStorage.removeItem(`chat_history_${botId}`);
}
```

**Format**: Array of message objects

```javascript
[
  { role: "user", content: "Hi!" },
  { role: "assistant", content: "Hello! How can I help?" },
  { role: "user", content: "I need career advice" },
  { role: "assistant", content: "Sure! What specifically..." },
];
```

### 2. Bot Switching Behavior

**Option A: Maintain separate histories** (Recommended)

- Each bot has its own conversation stored in localStorage
- When switching bots, load that bot's history
- User can resume conversations with any bot
- Clear history per bot with a "Clear Chat" button

**Option B: Clear on switch**

- When user switches bots, clear the chat UI
- Start fresh conversation with new bot
- Simpler UX, but users lose context

### 3. Displaying Search Results

When `search_results` is present in the response:

```javascript
function renderSearchResults(results) {
  if (!results || results.length === 0) return "";

  return `
    <div class="search-results">
      <h4>📚 Resources I found for you:</h4>
      ${results
        .map(
          (result) => `
        <a href="${result.url}" target="_blank" rel="noopener noreferrer" class="search-card">
          <h5>${result.title}</h5>
          <p>${result.snippet}</p>
          <span class="external-link">Visit →</span>
        </a>
      `
        )
        .join("")}
    </div>
  `;
}
```

**Styling suggestions**:

- Cards should be visually distinct from chat messages
- Show external link icon to indicate new tab
- Hover state for better UX
- Mobile-responsive layout

### 4. Loading States

Show loading indicator while waiting for API response:

```javascript
async function sendMessage(botId, message, history) {
  // Show loading UI
  showLoadingIndicator();

  try {
    const response = await fetch("http://localhost:8000/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bot_id: botId, message, history }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error
      showError(data.error);
      return;
    }

    // Success - display reply
    hideLoadingIndicator();
    displayBotReply(data.reply, data.search_results);
  } catch (error) {
    hideLoadingIndicator();
    showError("Network error. Please check your connection.");
  }
}
```

### 5. Error Handling

Display user-friendly error messages:

```javascript
function handleError(errorCode, errorMessage) {
  const messages = {
    INVALID_BOT_ID: "Oops! Please select a valid bot.",
    EMPTY_MESSAGE: "Please type a message before sending.",
    CONTENT_BLOCKED: "Your message couldn't be processed. Try rephrasing?",
    RATE_LIMITED:
      "We're getting lots of requests! Please try again in a minute.",
    API_ERROR: "Something went wrong. Please try again.",
  };

  return messages[errorCode] || errorMessage;
}
```

Show errors inline in the chat:

```javascript
function showErrorInChat(message) {
  // Display error message in chat UI (not as alert)
  appendMessage({
    type: "error",
    content: message,
    timestamp: new Date(),
  });
}
```

---

## 📝 Example Integration Code

### Fetch All Bots (for selector UI)

```javascript
async function loadBots() {
  try {
    const response = await fetch("http://localhost:8000/api/v1/bots");
    const bots = await response.json();

    // Render bot selector
    const botSelector = document.getElementById("bot-selector");
    botSelector.innerHTML = bots
      .map(
        (bot) => `
      <button class="bot-option" data-bot-id="${bot.bot_id}">
        <span class="emoji">${bot.icon_emoji}</span>
        <div>
          <h3>${bot.title}</h3>
          <p>${bot.description}</p>
        </div>
      </button>
    `
      )
      .join("");

    // Add click handlers
    document.querySelectorAll(".bot-option").forEach((btn) => {
      btn.addEventListener("click", () => selectBot(btn.dataset.botId));
    });
  } catch (error) {
    console.error("Failed to load bots:", error);
  }
}
```

### Send Chat Message

```javascript
async function sendChatMessage(botId, userMessage) {
  // Load existing history for this bot
  const history = loadChatHistory(botId);

  // Add user message to UI immediately
  appendMessage({ role: "user", content: userMessage });

  // Show loading
  showTypingIndicator();

  try {
    const response = await fetch("http://localhost:8000/api/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bot_id: botId,
        message: userMessage,
        history: history,
      }),
    });

    const data = await response.json();
    hideTypingIndicator();

    if (!response.ok) {
      // Error response
      showErrorInChat(data.error || "Something went wrong");
      return;
    }

    // Success - display bot reply
    appendMessage({ role: "assistant", content: data.reply });

    // Display search results if present
    if (data.search_results) {
      appendSearchResults(data.search_results);
    }

    // Update history in localStorage
    history.push({ role: "user", content: userMessage });
    history.push({ role: "assistant", content: data.reply });
    saveChatHistory(botId, history);
  } catch (error) {
    hideTypingIndicator();
    showErrorInChat("Network error. Please check your connection.");
    console.error("Chat API error:", error);
  }
}

// Usage
document.getElementById("send-btn").addEventListener("click", () => {
  const message = document.getElementById("message-input").value.trim();
  const currentBotId = getCurrentBotId(); // Your bot selection logic

  if (message) {
    sendChatMessage(currentBotId, message);
    document.getElementById("message-input").value = ""; // Clear input
  }
});
```

### Build History Array Format

```javascript
// Example: Build history from chat messages
function buildHistoryArray(messages) {
  // messages = array of {type: 'user'|'bot', text: string}
  return messages.map((msg) => ({
    role: msg.type === "user" ? "user" : "assistant",
    content: msg.text,
  }));
}

// Example usage:
const chatMessages = [
  { type: "user", text: "Hi!" },
  { type: "bot", text: "Hello! How can I help?" },
  { type: "user", text: "I need money advice" },
];

const history = buildHistoryArray(chatMessages);
// Result: [
//   { role: 'user', content: 'Hi!' },
//   { role: 'assistant', content: 'Hello! How can I help?' },
//   { role: 'user', content: 'I need money advice' }
// ]
```

---

## 🌐 CORS Configuration

**Status**: ✅ CORS is enabled

**Allowed Origins**:

- `*` (all origins allowed in development)
- In production, this will be restricted to specific frontend domains

**Allowed Methods**: All (`GET`, `POST`, `OPTIONS`, etc.)

**Allowed Headers**: All

**What this means for you**:

- You can call the API from any localhost port during development
- No CORS proxy needed
- No special headers required

---

## ⚠️ Rate Limits & Known Limitations

### API Rate Limits

- **Groq API (Free Tier)**:
  - Model: `llama-3.1-8b-instant`
  - Limit: ~14,400 requests per day
  - ~600 requests per hour
  - If hit: User sees "Service is temporarily busy" error

**Frontend handling**:

- Display friendly error message (already in error codes)
- Add retry button
- Don't auto-retry on rate limit (makes it worse)

### DuckDuckGo Search Limitations

- Search is best-effort (GrowthGuru only)
- Occasionally fails or returns no results
- Not guaranteed to always work
- **Frontend handling**: If `search_results` is `null` or empty, just show the bot's text reply

### Response Times

- **Typical**: 1-3 seconds
- **With search**: 2-5 seconds
- **Slow network**: Up to 8 seconds

**Recommendation**:

- Show loading indicator after 500ms
- Set frontend timeout at 10 seconds
- Show error if no response after timeout

### Message Limits

- User message: 1-2000 characters
- Bot reply: ~500 tokens (roughly 375 words)
- History: No hard limit, but keep last 10-15 messages for best performance

---

## 🧪 Testing Checklist

Before going live, test these scenarios:

### Basic Flow

- [ ] Load bot list successfully
- [ ] Select a bot
- [ ] Send a message
- [ ] Receive bot reply
- [ ] Send follow-up message with history
- [ ] Switch to different bot

### GrowthGuru Search

- [ ] Send message with "course" keyword
- [ ] Verify search_results appear
- [ ] Click search result links (open in new tab)
- [ ] Send message without trigger keywords (no search)

### Error Handling

- [ ] Send empty message → see error
- [ ] Send invalid bot_id → see error
- [ ] Backend is down → see network error
- [ ] Rate limit hit → see friendly message

### Chat History

- [ ] Refresh page → history persists
- [ ] Switch bots → separate histories
- [ ] Clear chat → history deleted

### Edge Cases

- [ ] Very long message (1500+ chars)
- [ ] Special characters in message: ", ', <, >, &
- [ ] Rapid fire messages (3-4 in a row)
- [ ] Slow network (throttle to 3G in DevTools)

---

## 🆘 Troubleshooting

### "Connection refused" error

- **Cause**: Backend not running
- **Fix**: Run `uvicorn main:app --reload` in backend folder

### "GROQ_API_KEY not found" error

- **Cause**: Missing or incorrect .env file
- **Fix**: Copy `.env.example` to `.env` and add your Groq API key

### CORS errors in browser console

- **Should not happen** (CORS is enabled for all origins)
- **If it does**: Check that backend is running on port 8000

### Empty bot list

- **Cause**: Wrong endpoint URL
- **Fix**: Verify you're calling `http://localhost:8000/api/v1/bots` (not `/api/bots`)

### Bot replies are slow

- **Normal**: 2-5 seconds is expected
- **Very slow (10+ sec)**: Check your internet connection or Groq API status

### Search results not showing

- **Check 1**: Is bot_id `upskill`? (Only GrowthGuru has search)
- **Check 2**: Does message contain trigger keywords? (course, job, learn, etc.)
- **Check 3**: `search_results` might be `null` (DuckDuckGo occasionally fails)

---

## 📞 Support

**Backend Developer**: _(Add contact info)_

**Questions to ask before integrating**:

1. What's the production backend URL? (when ready)
2. Do we need authentication/API keys in production?
3. Should we implement request throttling on frontend?
4. Analytics tracking for bot usage?

---

**Last Updated**: January 11, 2026  
**API Version**: 0.1.0  
**Backend Status**: Development Ready ✅

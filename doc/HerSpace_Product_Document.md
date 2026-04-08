# HerSpace - Product Documentation

An intelligent, voice-enabled multi-agent support platform built for working women in India.

## 1. What is HerSpace?
**HerSpace** is an agentic AI system designed to act as a comprehensive companion for working women. Instead of a single conventional chatbot, HerSpace relies on a team of specialized AI agents. It intelligently offers guidance for **wellness, career growth, financial planning, safety, and work-life balance.**

## 2. Who is it for?
**Target Audience**: Working women in India who are juggling workplace responsibilities, family life, and personal well-being. It is highly useful for women who need:
- Relief from workplace health issues like back pain and stress.
- Time management strategies that align with their work-life dynamics.
- Culturally relevant career and financial planning guidance.
- Fast, judgment-free mental wellness and safety support at any time.

## 3. Key Components and Features
The platform is built with several key components to ensure a seamless and tailored experience, explained simply:
- **Voice-First Interface**: Features an Indian female voice and an animated speaking avatar, enabling real-time voice guidance (e.g., interactive breathing exercises).
- **Multi-Agent Intelligence**: Five distinct expert AI agents that collaborate and share knowledge rather than just giving generic replies.
- **Continuous Personalization (Smart Dashboard)**: A live dashboard that reflects real intelligence from the agents (like wellness and productivity metrics), which updates automatically.
- **Privacy-First Philosophy**: No intrusive databases; all memory and conversations are stored securely using localized lightweight memory and secure authentication.

## 4. Core Logic: How It Works Internally
Every time the user asks a question, the system intelligently handles it using an Agentic Architecture. Here is the step-by-step logic:
1. **Intent Routing**: When a user sends a message, the Orchestrator Router analyzes the text and calculates a score (0-100) for each agent to determine who is best suited to answer.
2. **Memory Retrieval**: The chosen agent(s) look into their own independent "Vector Memory". This memory stores past conversations as small, lightweight data points (Hashes).
3. **Agent Collaboration**: If a query involves multiple topics (e.g., "I am stressed and need to save money"), the router activates multiple agents who combine their insights.
4. **Memory Update & Dashboard Sync**: After responding, the agent remembers the context of the chat for the future and immediately updates behavioral metrics on the main dashboard.

## 5. The Five Specialized Agents
HerSpace utilizes five separate AI agents, each an expert in a specific domain:
- **FitHer 💪**: Wellness Coach focusing on physical and mental well-being (desk exercises, posture correction, guided breathing).
- **PlanPal 📅**: Time Management Partner dealing with daily scheduling, prioritizing tasks, and ensuring an effective work-life balance.
- **PaisaWise 💰**: Finance Specialist tracking personalized budgets, savings goals, and giving culturally relevant financial advice.
- **SpeakUp 🛡️**: Safety Ally acting as a support system against harassment and handling safety or emergency priorities.
- **GrowthGuru 🚀**: Career Mentor offering skill up-gradation recommendations, resume checks, and direct job search integration.

## 6. How the Cumulative Dashboard Scores are Calculated
The dashboard metrics are NOT hardcoded. They are dynamically calculated using the system's memory and the user's ongoing interaction pattern. Each agent updates cumulative scores using real behavioral logic.

For example, the Wellness Score operates on a continuous feedback loop:
- **Base Initial Score**: Starts at a standard baseline (e.g., 70/100).
- **Penalty Mechanism**: If the user mentions experiencing "stress" multiple times during the week, the underlying function applies a deduction (e.g., -5 points).
- **Rewarding Mechanism**: If the user performs positive actions, such as guided breathing sessions with FitHer, bonus points are assigned (e.g., +3 points).
- **Final Metric**: The final result is clamped and reflected on the dashboard in real-time, displaying their current Wellness status and trend (improving/declining).

Similarly, PlanPal calculates task completion ratios (tasks done / total tasks), and PaisaWise calculates budgeting engagement based on active conversations. This collective computation provides a deeply personalized cumulative progress report on the frontend dashboard.

"""
Wellness Agent (FitHer)
-----------------------
Specialized agent for wellness, fitness, and mental health support.
"""

from typing import Dict, Optional, List
from datetime import datetime, timedelta
import re

from agents.base_agent import BaseAgent


WELLNESS_SEARCH_KEYWORDS = [
    "workout", "exercise", "yoga", "diet", "nutrition", "sleep", "meditation",
    "breathing", "stress relief", "fitness", "weight", "period", "pcos", "thyroid",
    "remedy", "tips", "how to", "routine"
]


class WellnessAgent(BaseAgent):
    """
    FitHer - Wellness & Fitness Coach
    
    Tracks:
    - Stress levels and mood trends
    - Wellness activities
    - Health topics discussed
    """
    
    def __init__(self, groq_client, model_priority, system_instruction: str):
        super().__init__(
            name="wellness",
            title="FitHer",
            role_description="Your wellness & fitness coach — workouts, nutrition, energy tips",
            system_instruction=system_instruction,
            groq_client=groq_client,
            model_priority=model_priority
        )
        
        # Track wellness-specific data
        self.stress_mentions = []
        self.positive_activities = []
    
    def store_memory(
        self,
        user_message: str,
        agent_response: str,
        user_id: Optional[str] = None
    ) -> None:
        """Override to extract wellness-specific insights."""
        # Call parent to store in vector memory
        super().store_memory(user_message, agent_response, user_id)
        
        # Extract stress indicators
        stress_keywords = ["stress", "tired", "exhausted", "overwhelm", "anxious", "pain"]
        if any(keyword in user_message.lower() for keyword in stress_keywords):
            self.stress_mentions.append(datetime.now())
        
        # Extract positive activities
        positive_keywords = ["yoga", "walk", "exercise", "meditation", "sleep", "breathing"]
        if any(keyword in user_message.lower() for keyword in positive_keywords):
            self.positive_activities.append(datetime.now())
    
    def _build_search_context(self, user_message: str) -> str:
        """Search for relevant wellness/health info to enrich the response."""
        msg_lower = user_message.lower()
        if not any(k in msg_lower for k in WELLNESS_SEARCH_KEYWORDS):
            return ""
        try:
            from search_utils import search_web, extract_topic
            topic = extract_topic(user_message)
            results = search_web(
                f"{topic} health tips India women",
                max_results=2,
                timelimit="y"
            )
            if not results:
                return ""
            parts = ["=== LIVE WELLNESS SEARCH RESULTS ==="]
            for r in results:
                parts.append(f"- {r['title']}: {r['url']}\n  {r['snippet']}")
            return "\n".join(parts)
        except Exception as e:
            print(f"[wellness search] {e}")
            return ""

    def generate_response(
        self,
        user_message: str,
        user_id: Optional[str] = None,
        conversation_history: Optional[List] = None
    ) -> str:
        """Override to inject live wellness search results."""
        conversation_history = conversation_history or []
        context = self.build_context(user_message, conversation_history, user_id=user_id)
        search_context = self._build_search_context(user_message)

        messages = [{"role": "system", "content": self.system_instruction}]
        if context:
            messages.append({"role": "system", "content": f"Context from memory:\n{context}"})
        if search_context:
            messages.append({
                "role": "system",
                "content": (
                    f"{search_context}\n\n"
                    "Use these real-time results to give specific, current advice."
                )
            })
        for msg in conversation_history[-5:]:
            messages.append(msg)
        messages.append({"role": "user", "content": user_message})

        response_text = None
        for model in self.model_priority:
            try:
                response = self.groq_client.chat.completions.create(
                    model=model, messages=messages, temperature=0.7, max_tokens=500
                )
                response_text = response.choices[0].message.content
                break
            except Exception as e:
                print(f"Model {model} failed: {e}")

        if not response_text:
            response_text = "I'm having trouble responding right now. Please try again."

        self.store_memory(user_message, response_text, user_id)
        self.last_interaction = datetime.now()
        self.interaction_count += 1
        self._save_state()
        return response_text

    def calculate_metrics(self, user_id: Optional[str] = None) -> Dict:
        """Calculate wellness score and trends."""
        # Count recent stress mentions (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_stress = len([d for d in self.stress_mentions if d > week_ago])
        recent_positive = len([d for d in self.positive_activities if d > week_ago])
        
        # Calculate wellness score (0-100)
        # Formula: Base 70 - stress penalty + positive activity bonus
        wellness_score = 70
        wellness_score -= min(recent_stress * 5, 30)  # Max -30 for stress
        wellness_score += min(recent_positive * 3, 30)  # Max +30 for activities
        wellness_score = max(0, min(100, wellness_score))  # Clamp to 0-100
        
        # Determine trend
        trend = "stable"
        if recent_positive > recent_stress * 1.5:
            trend = "improving"
        elif recent_stress > recent_positive * 1.5:
            trend = "needs_attention"
        
        # Determine status message
        if wellness_score >= 80:
            status = "Feeling great"
        elif wellness_score >= 60:
            status = "Doing okay"
        else:
            status = "Needs support"
        
        return {
            "score": round(wellness_score, 1),
            "status": status,
            "trend": trend,
            "stress_events": recent_stress,
            "positive_activities": recent_positive,
            "total_interactions": self.interaction_count
        }

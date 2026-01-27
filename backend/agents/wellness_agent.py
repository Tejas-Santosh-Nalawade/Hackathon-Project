"""
Wellness Agent (FitHer)
-----------------------
Specialized agent for wellness, fitness, and mental health support.
"""

from typing import Dict, Optional, List
from datetime import datetime, timedelta
import re

from agents.base_agent import BaseAgent


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

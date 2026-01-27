"""
Safety Agent (SpeakUp)
----------------------
Specialized agent for safety, harassment reporting, and support.
"""

from typing import Dict, Optional
from datetime import datetime, timedelta

from agents.base_agent import BaseAgent


class SafetyAgent(BaseAgent):
    """
    SpeakUp - Safety & Support Assistant
    
    Tracks:
    - Safety concerns
    - Alert priorities
    - Support interactions
    """
    
    def __init__(self, groq_client, model_priority, system_instruction: str):
        super().__init__(
            name="safety",
            title="SpeakUp",
            role_description="Your safety companion — report issues, get support, stay protected",
            system_instruction=system_instruction,
            groq_client=groq_client,
            model_priority=model_priority
        )
        
        # Track safety data
        self.safety_concerns = []
        self.high_priority_alerts = []
    
    def store_memory(
        self,
        user_message: str,
        agent_response: str,
        user_id: Optional[str] = None
    ) -> None:
        """Override to extract safety insights."""
        super().store_memory(user_message, agent_response, user_id)
        
        # Track safety concerns
        concern_keywords = ["unsafe", "harassment", "threat", "scared", "emergency"]
        if any(keyword in user_message.lower() for keyword in concern_keywords):
            self.safety_concerns.append(datetime.now())
            self.high_priority_alerts.append(datetime.now())
    
    def calculate_metrics(self, user_id: Optional[str] = None) -> Dict:
        """Calculate safety status metrics."""
        # Recent concerns (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_concerns = len([d for d in self.safety_concerns if d > week_ago])
        recent_high_priority = len([d for d in self.high_priority_alerts if d > week_ago])
        
        # Alert count
        total_alerts = recent_concerns
        
        # Priority level
        if recent_high_priority > 0:
            priority = "high"
            status = "Needs attention"
        elif total_alerts > 0:
            priority = "medium"
            status = "Monitoring"
        else:
            priority = "low"
            status = "All clear"
        
        return {
            "alerts": total_alerts,
            "priority": priority,
            "status": status,
            "high_priority_count": recent_high_priority,
            "total_interactions": self.interaction_count
        }

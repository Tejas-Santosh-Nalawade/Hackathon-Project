"""
Career Agent (GrowthGuru)
-------------------------
Specialized agent for career development and upskilling.
"""

from typing import Dict, Optional
from datetime import datetime, timedelta

from agents.base_agent import BaseAgent


class CareerAgent(BaseAgent):
    """
    GrowthGuru - Career Development Assistant
    
    Tracks:
    - Skill interests
    - Career goals
    - Learning activities
    """
    
    def __init__(self, groq_client, model_priority, system_instruction: str):
        super().__init__(
            name="career",
            title="GrowthGuru",
            role_description="Your career guide — upskill, grow, advance your career",
            system_instruction=system_instruction,
            groq_client=groq_client,
            model_priority=model_priority
        )
        
        # Track career data
        self.skill_interests = []
        self.learning_activities = []
    
    def store_memory(
        self,
        user_message: str,
        agent_response: str,
        user_id: Optional[str] = None
    ) -> None:
        """Override to extract career insights."""
        super().store_memory(user_message, agent_response, user_id)
        
        # Track skill interests
        skill_keywords = ["learn", "skill", "course", "training", "career", "job", "promotion"]
        if any(keyword in user_message.lower() for keyword in skill_keywords):
            self.skill_interests.append(datetime.now())
        
        # Track learning activities
        learning_keywords = ["studying", "practicing", "completed", "certification"]
        if any(keyword in user_message.lower() for keyword in learning_keywords):
            self.learning_activities.append(datetime.now())
    
    def calculate_metrics(self, user_id: Optional[str] = None) -> Dict:
        """Calculate career development metrics."""
        # Recent activity (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        recent_interests = len([d for d in self.skill_interests if d > month_ago])
        recent_learning = len([d for d in self.learning_activities if d > month_ago])
        
        # Calculate growth score
        growth_score = min(50 + recent_interests * 10 + recent_learning * 15, 100)
        
        # Status
        if growth_score >= 80:
            status = "Actively growing"
        elif growth_score >= 60:
            status = "On the path"
        else:
            status = "Ready to start"
        
        return {
            "growth_score": round(growth_score, 1),
            "status": status,
            "skills_explored": recent_interests,
            "learning_activities": recent_learning,
            "total_interactions": self.interaction_count
        }

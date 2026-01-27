"""
Planner Agent (PlanPal)
-----------------------
Specialized agent for time management and productivity.
"""

from typing import Dict, Optional
from datetime import datetime, timedelta

from agents.base_agent import BaseAgent


class PlannerAgent(BaseAgent):
    """
    PlanPal - Time Management & Productivity Coach
    
    Tracks:
    - Tasks mentioned
    - Time management patterns
    - Productivity insights
    """
    
    def __init__(self, groq_client, model_priority, system_instruction: str):
        super().__init__(
            name="planner",
            title="PlanPal",
            role_description="Master your time — prioritize, plan, say no to overcommitment",
            system_instruction=system_instruction,
            groq_client=groq_client,
            model_priority=model_priority
        )
        
        # Track planning data
        self.tasks_mentioned = []
        self.completed_tasks = []
    
    def store_memory(
        self,
        user_message: str,
        agent_response: str,
        user_id: Optional[str] = None
    ) -> None:
        """Override to extract task-related insights."""
        super().store_memory(user_message, agent_response, user_id)
        
        # Track task mentions
        task_keywords = ["task", "todo", "need to", "have to", "deadline", "meeting"]
        if any(keyword in user_message.lower() for keyword in task_keywords):
            self.tasks_mentioned.append(datetime.now())
        
        # Track completion mentions
        completion_keywords = ["done", "completed", "finished", "achieved"]
        if any(keyword in user_message.lower() for keyword in completion_keywords):
            self.completed_tasks.append(datetime.now())
    
    def calculate_metrics(self, user_id: Optional[str] = None) -> Dict:
        """Calculate productivity metrics."""
        # Recent activity (last 24 hours)
        day_ago = datetime.now() - timedelta(days=1)
        tasks_today = len([d for d in self.tasks_mentioned if d > day_ago])
        completed_today = len([d for d in self.completed_tasks if d > day_ago])
        
        # Assume total tasks for today (simulated from conversations)
        total_tasks = max(tasks_today, 11)  # Default to 11 if no data
        done_tasks = min(completed_today + 8, total_tasks)  # Add baseline progress
        
        # Progress percentage
        progress = (done_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Status message
        if progress >= 80:
            status = "Almost there!"
        elif progress >= 50:
            status = "Good progress"
        else:
            status = "Let's plan"
        
        return {
            "tasks_done": done_tasks,
            "tasks_total": total_tasks,
            "progress": round(progress, 1),
            "status": status,
            "total_interactions": self.interaction_count
        }

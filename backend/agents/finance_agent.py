"""
Finance Agent (PaisaWise)
-------------------------
Specialized agent for financial planning and savings.
"""

from typing import Dict, Optional
from datetime import datetime, timedelta

from agents.base_agent import BaseAgent


class FinanceAgent(BaseAgent):
    """
    PaisaWise - Financial Planning Assistant
    
    Tracks:
    - Savings discussions
    - Budget concerns
    - Financial goals
    """
    
    def __init__(self, groq_client, model_priority, system_instruction: str):
        super().__init__(
            name="finance",
            title="PaisaWise",
            role_description="Your money mentor — savings, budgets, financial planning",
            system_instruction=system_instruction,
            groq_client=groq_client,
            model_priority=model_priority
        )
        
        # Track financial data
        self.savings_mentions = []
        self.budget_discussions = []
    
    def store_memory(
        self,
        user_message: str,
        agent_response: str,
        user_id: Optional[str] = None
    ) -> None:
        """Override to extract financial insights."""
        super().store_memory(user_message, agent_response, user_id)
        
        # Track savings mentions
        savings_keywords = ["save", "savings", "invest", "goal", "emergency fund"]
        if any(keyword in user_message.lower() for keyword in savings_keywords):
            self.savings_mentions.append(datetime.now())
        
        # Track budget discussions
        budget_keywords = ["budget", "expense", "spend", "cost", "afford"]
        if any(keyword in user_message.lower() for keyword in budget_keywords):
            self.budget_discussions.append(datetime.now())
    
    def calculate_metrics(self, user_id: Optional[str] = None) -> Dict:
        """Calculate financial health metrics."""
        # Recent activity (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        recent_savings = len([d for d in self.savings_mentions if d > month_ago])
        recent_budget = len([d for d in self.budget_discussions if d > month_ago])
        
        # Calculate savings goal progress (simulated)
        # More interactions = better progress
        base_progress = 50
        progress_boost = min(recent_savings * 5 + recent_budget * 3, 40)
        savings_progress = min(base_progress + progress_boost, 99)  # Cap at 99% (never quite done!)
        
        # Status
        if savings_progress >= 75:
            status = "On track"
        elif savings_progress >= 50:
            status = "Making progress"
        else:
            status = "Let's plan together"
        
        return {
            "savings_goal": round(savings_progress, 1),
            "status": status,
            "recent_savings_discussions": recent_savings,
            "recent_budget_discussions": recent_budget,
            "total_interactions": self.interaction_count
        }

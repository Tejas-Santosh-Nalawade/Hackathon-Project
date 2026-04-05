"""
Dashboard Service
-----------------
Aggregates intelligence from all agents to power the personalized dashboard.
"""

from typing import Dict, Optional
from datetime import datetime


class DashboardService:
    """
    Aggregates data from all agents to create unified dashboard view.
    
    This is the KEY component that makes the UI truly agentic.
    """
    
    def __init__(self, agent_manager):
        """
        Initialize dashboard service.
        
        Args:
            agent_manager: AgentManager instance
        """
        self.agent_manager = agent_manager
    
    def get_dashboard_data(self, user_id: Optional[str] = None) -> Dict:
        """
        Get complete dashboard data from all agents.
        
        Args:
            user_id: User identifier
            
        Returns:
            Aggregated dashboard data
        """
        agents = self.agent_manager.get_all_agents()
        
        # Collect metrics from each agent
        wellness_metrics = agents["wellness"].calculate_metrics(user_id)
        planner_metrics = agents["planner"].calculate_metrics(user_id)
        finance_metrics = agents["finance"].calculate_metrics(user_id)
        safety_metrics = agents["safety"].calculate_metrics(user_id)
        career_metrics = agents["career"].calculate_metrics(user_id)
        
        # Build unified dashboard
        dashboard = {
            "wellness": {
                "score": wellness_metrics.get("score", 70),
                "status": wellness_metrics.get("status", "Doing okay"),
                "trend": wellness_metrics.get("trend", "stable"),
                "agent": "FitHer"
            },
            "planner": {
                "tasks_done": planner_metrics.get("tasks_done", 0),
                "tasks_total": planner_metrics.get("tasks_total", 0),
                "progress": planner_metrics.get("progress", 0),
                "status": planner_metrics.get("status", "Let's plan"),
                "agent": "PlanPal"
            },
            "finance": {
                "savings_goal": finance_metrics.get("savings_goal", 50),
                "status": finance_metrics.get("status", "Let's start"),
                "agent": "PaisaWise"
            },
            "safety": {
                "alerts": safety_metrics.get("alerts", 0),
                "priority": safety_metrics.get("priority", "low"),
                "status": safety_metrics.get("status", "All clear"),
                "agent": "SpeakUp"
            },
            "career": {
                "growth_score": career_metrics.get("growth_score", 50),
                "status": career_metrics.get("status", "Ready to start"),
                "agent": "GrowthGuru"
            },
            "generated_at": datetime.now().isoformat()
        }
        
        return dashboard
    
    def get_personalized_greeting(self, user_id: Optional[str] = None) -> Dict:
        """
        Generate personalized greeting based on agent insights.
        
        Args:
            user_id: User identifier
            
        Returns:
            Greeting data with insights
        """
        agents = self.agent_manager.get_all_agents()
        
        # Get key insights
        wellness_metrics = agents["wellness"].calculate_metrics(user_id)
        planner_metrics = agents["planner"].calculate_metrics(user_id)
        
        # Generate dynamic greeting
        insights = []
        
        # Wellness insight
        if wellness_metrics.get("trend") == "improving":
            insights.append("FitHer noticed your stress levels are improving this week 💜")
        elif wellness_metrics.get("trend") == "needs_attention":
            insights.append("FitHer detected elevated stress — let's prioritize your wellness")
        
        # Planner insight
        if planner_metrics.get("tasks_done", 0) > 5:
            insights.append(f"PlanPal helped you complete {planner_metrics['tasks_done']} tasks today!")
        
        # Default if no insights
        if not insights:
            insights.append("Your support team is ready to help you thrive 💪")
        
        return {
            "greeting": "Good afternoon, Tejas",
            "insights": insights,
            "time_of_day": self._get_time_of_day()
        }
    
    def _get_time_of_day(self) -> str:
        """Determine time of day for greeting."""
        hour = datetime.now().hour
        
        if hour < 12:
            return "morning"
        elif hour < 17:
            return "afternoon"
        else:
            return "evening"
    
    def get_agent_status(self, agent_name: str) -> Dict:
        """
        Get detailed status for a specific agent.
        
        Args:
            agent_name: Agent identifier
            
        Returns:
            Agent status and memory summary
        """
        agent = self.agent_manager.get_agent(agent_name)
        
        if not agent:
            return {"error": "Agent not found"}
        
        summary = agent.get_summary()
        
        # Add memory insights
        recent_memories = agent.memory.get_recent_memories(count=3)
        memory_preview = [
            {
                "content": m.content[:100] + "..." if len(m.content) > 100 else m.content,
                "timestamp": m.timestamp.isoformat()
            }
            for m in recent_memories
        ]
        
        summary["recent_memories"] = memory_preview
        
        return summary

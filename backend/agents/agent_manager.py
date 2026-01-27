"""
Agent Manager
-------------
Initializes and manages all agents in the system.
"""

from typing import Dict
from openai import OpenAI

from agents.wellness_agent import WellnessAgent
from agents.planner_agent import PlannerAgent
from agents.finance_agent import FinanceAgent
from agents.safety_agent import SafetyAgent
from agents.career_agent import CareerAgent
from bots import BOT_REGISTRY


class AgentManager:
    """
    Central manager for all HerSpace agents.
    
    Responsible for:
    - Agent initialization
    - Agent lifecycle management
    - Agent lookup
    """
    
    def __init__(self, groq_client: OpenAI, model_priority: list):
        """
        Initialize all agents.
        
        Args:
            groq_client: Groq API client
            model_priority: List of models to try in order
        """
        self.groq_client = groq_client
        self.model_priority = model_priority
        
        # Initialize all specialized agents
        self.agents: Dict[str, any] = self._initialize_agents()
    
    def _initialize_agents(self) -> Dict:
        """Create all agent instances."""
        agents = {}
        
        # Wellness Agent
        wellness_config = BOT_REGISTRY.get("wellness", {})
        agents["wellness"] = WellnessAgent(
            groq_client=self.groq_client,
            model_priority=self.model_priority,
            system_instruction=wellness_config.get("system_instruction", "")
        )
        
        # Planner Agent
        planner_config = BOT_REGISTRY.get("planner", {})
        agents["planner"] = PlannerAgent(
            groq_client=self.groq_client,
            model_priority=self.model_priority,
            system_instruction=planner_config.get("system_instruction", "")
        )
        
        # Finance Agent
        finance_config = BOT_REGISTRY.get("finance", {})
        agents["finance"] = FinanceAgent(
            groq_client=self.groq_client,
            model_priority=self.model_priority,
            system_instruction=finance_config.get("system_instruction", "")
        )
        
        # Safety Agent
        safety_config = BOT_REGISTRY.get("safety", {})
        agents["safety"] = SafetyAgent(
            groq_client=self.groq_client,
            model_priority=self.model_priority,
            system_instruction=safety_config.get("system_instruction", "")
        )
        
        # Career Agent
        career_config = BOT_REGISTRY.get("career", {})
        agents["career"] = CareerAgent(
            groq_client=self.groq_client,
            model_priority=self.model_priority,
            system_instruction=career_config.get("system_instruction", "")
        )
        
        return agents
    
    def get_agent(self, agent_name: str):
        """
        Get agent by name.
        
        Args:
            agent_name: Agent identifier
            
        Returns:
            Agent instance or None
        """
        return self.agents.get(agent_name)
    
    def get_all_agents(self) -> Dict:
        """Get all agents."""
        return self.agents
    
    def get_agent_summaries(self) -> Dict:
        """Get summaries of all agents for UI."""
        return {
            name: agent.get_summary()
            for name, agent in self.agents.items()
        }

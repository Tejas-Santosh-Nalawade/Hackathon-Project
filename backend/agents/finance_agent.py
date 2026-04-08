"""
Finance Agent (PaisaWise)
-------------------------
Specialized agent for financial planning and savings.
"""

from typing import Dict, Optional, List
from datetime import datetime, timedelta

from agents.base_agent import BaseAgent


FINANCE_SEARCH_KEYWORDS = [
    "invest", "mutual fund", "sip", "fd", "ppf", "epf", "stock", "market",
    "interest rate", "inflation", "tax", "itr", "insurance", "loan", "emi",
    "gold", "crypto", "nps", "elss", "how to save", "where to invest"
]


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
    
    def _build_search_context(self, user_message: str) -> str:
        """Search for current financial news/rates to enrich the response."""
        msg_lower = user_message.lower()
        if not any(k in msg_lower for k in FINANCE_SEARCH_KEYWORDS):
            return ""
        try:
            from search_utils import search_web, extract_topic
            topic = extract_topic(user_message)
            results = search_web(
                f"{topic} India personal finance 2024",
                max_results=2,
                timelimit="y"
            )
            if not results:
                return ""
            parts = ["=== LIVE FINANCE SEARCH RESULTS ==="]
            for r in results:
                parts.append(f"- {r['title']}: {r['url']}\n  {r['snippet']}")
            return "\n".join(parts)
        except Exception as e:
            print(f"[finance search] {e}")
            return ""

    def generate_response(
        self,
        user_message: str,
        user_id: Optional[str] = None,
        conversation_history: Optional[List] = None
    ) -> str:
        """Override to inject live finance search results."""
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
                    "Use these real-time results to give specific, current financial advice with actual numbers/rates."
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

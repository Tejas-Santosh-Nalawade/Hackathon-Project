"""
Agentic Router
--------------
Intelligent routing system that determines which agents should handle a query.
"""

from typing import List, Dict, Tuple
import re


class AgenticRouter:
    """
    Routes user messages to appropriate agents based on intent detection.
    
    Can activate multiple agents for complex queries.
    """
    
    def __init__(self):
        """Initialize router with intent patterns."""
        # Define intent patterns for each agent
        self.intent_patterns = {
            "wellness": [
                r"\b(stress|tired|exhaust|health|fitness|workout|exercise|yoga|pain|sleep|energy|mood|anxiety|wellness)\b",
                r"\b(feel|feeling|mental|physical|body)\b"
            ],
            "planner": [
                r"\b(schedule|plan|time|task|todo|deadline|meeting|calendar|organize|priority|busy|overwhelm)\b",
                r"\b(manage|balance|juggle)\b"
            ],
            "finance": [
                r"\b(money|save|savings|budget|expense|invest|financial|cost|afford|salary|income|debt)\b",
                r"\b(pay|payment|bill)\b"
            ],
            "safety": [
                r"\b(safe|unsafe|harassment|threat|danger|emergency|report|help|protect|security|concern)\b",
                r"\b(scared|afraid|worried|uncomfortable)\b"
            ],
            "career": [
                r"\b(career|job|skill|learn|course|training|certification|resume|interview|promotion|growth)\b",
                r"\b(upskill|develop|education)\b"
            ]
        }
        
        # Compile patterns for efficiency
        self.compiled_patterns = {
            agent: [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
            for agent, patterns in self.intent_patterns.items()
        }
    
    def detect_intents(self, message: str) -> List[Tuple[str, float]]:
        """
        Detect which agents are relevant to the message.
        
        Args:
            message: User's message
            
        Returns:
            List of (agent_name, confidence_score) tuples, sorted by confidence
        """
        intent_scores = {}
        
        for agent_name, patterns in self.compiled_patterns.items():
            score = 0.0
            matches = 0
            
            for pattern in patterns:
                if pattern.search(message):
                    matches += 1
            
            # Calculate confidence based on number of matches
            if matches > 0:
                score = min(0.5 + (matches * 0.2), 1.0)
                intent_scores[agent_name] = score
        
        # Sort by confidence (highest first)
        sorted_intents = sorted(
            intent_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return sorted_intents
    
    def route(self, message: str, threshold: float = 0.5) -> List[str]:
        """
        Route message to appropriate agents.
        
        Args:
            message: User's message
            threshold: Minimum confidence to activate an agent
            
        Returns:
            List of agent names to activate
        """
        intents = self.detect_intents(message)
        
        # Filter by threshold
        active_agents = [
            agent for agent, score in intents
            if score >= threshold
        ]
        
        # If no clear intent, default to wellness (general support)
        if not active_agents:
            active_agents = ["wellness"]
        
        return active_agents
    
    def route_with_scores(self, message: str) -> Dict[str, float]:
        """
        Route message and return confidence scores.
        
        Args:
            message: User's message
            
        Returns:
            Dictionary of {agent_name: confidence_score}
        """
        intents = self.detect_intents(message)
        return dict(intents)

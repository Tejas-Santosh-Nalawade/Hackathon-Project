"""
Base Agent Architecture
-----------------------
Core agent class that all specialized agents inherit from.
Handles memory, LLM interaction, and response generation.
"""

import os
import pickle
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from openai import OpenAI

from memory.embedding import get_embedding_service
from memory.vector_store import VectorMemoryStore


class BaseAgent:
    """
    Base class for all HerSpace agents.
    
    Each agent is autonomous with:
    - Its own role and system prompt
    - Isolated vector memory
    - Context-aware responses
    - Learning capabilities
    """
    
    def __init__(
        self,
        name: str,
        title: str,
        role_description: str,
        system_instruction: str,
        groq_client: OpenAI,
        model_priority: List[str]
    ):
        """
        Initialize base agent.
        
        Args:
            name: Agent identifier (e.g., "wellness", "planner")
            title: Display name (e.g., "FitHer")
            role_description: Short description of agent's purpose
            system_instruction: Detailed system prompt
            groq_client: Groq API client
            model_priority: List of models to try in order
        """
        self.name = name
        self.title = title
        self.role_description = role_description
        self.system_instruction = system_instruction
        self.groq_client = groq_client
        self.model_priority = model_priority
        
        # Initialize memory system
        self.embedding_service = get_embedding_service()
        self.memory = VectorMemoryStore(agent_name=name)
        
        # Interaction statistics
        self.last_interaction: Optional[datetime] = None
        self.interaction_count = 0
        
        # Persistent state storage path
        self._storage_dir = "storage"
        self._state_path = os.path.join(self._storage_dir, f"{name}_state.pkl")
        os.makedirs(self._storage_dir, exist_ok=True)
        self._load_state()

    def _load_state(self) -> None:
        """Load persisted agent state (keyword tracking lists, counters)."""
        if os.path.exists(self._state_path):
            try:
                with open(self._state_path, "rb") as f:
                    state = pickle.load(f)
                for key, value in state.items():
                    if hasattr(self, key):
                        setattr(self, key, value)
            except Exception as e:
                print(f"[{self.name}] Could not load state: {e}")

    def _save_state(self) -> None:
        """Persist agent state so scores survive restarts."""
        # Collect all list/counter attributes defined by subclasses
        state = {
            "interaction_count": self.interaction_count,
            "last_interaction": self.last_interaction,
        }
        for key, value in self.__dict__.items():
            if isinstance(value, list) and not key.startswith("_") and key not in ("model_priority",):
                state[key] = value
        try:
            with open(self._state_path, "wb") as f:
                pickle.dump(state, f)
        except Exception as e:
            print(f"[{self.name}] Could not save state: {e}")
    
    def recall_memories(
        self,
        query: str,
        top_k: int = 5,
        threshold: float = 0.6,
        user_id: Optional[str] = None
    ) -> List[Tuple[str, float]]:
        """
        Recall relevant memories based on current query.
        
        Args:
            query: User's current message
            top_k: Number of memories to retrieve
            threshold: Minimum relevance score
            user_id: Filter memories for specific user
            
        Returns:
            List of (memory_content, relevance_score) tuples
        """
        # Generate query embedding
        query_embedding = self.embedding_service.embed(query)
        
        # Search vector memory with user filter
        results = self.memory.search(
            query_embedding,
            top_k=top_k,
            threshold=threshold,
            user_id=user_id
        )
        
        return [(entry.content, score) for entry, score in results]
    
    def store_memory(
        self,
        user_message: str,
        agent_response: str,
        user_id: Optional[str] = None
    ) -> None:
        """
        Store interaction in agent's memory.
        
        Args:
            user_message: What the user said
            agent_response: How the agent responded
            user_id: User identifier (optional)
        """
        # Combine user message and agent response for richer context
        memory_content = f"User: {user_message}\nAgent: {agent_response}"
        
        # Generate embedding
        embedding = self.embedding_service.embed(memory_content)
        
        # Store with metadata
        metadata = {
            "user_id": user_id,
            "agent": self.name,
            "timestamp": datetime.now().isoformat()
        }
        
        self.memory.add_memory(
            content=memory_content,
            embedding=embedding,
            metadata=metadata
        )
        
        # Persist state after every memory update
        self._save_state()
    
    def build_context(
        self,
        user_message: str,
        conversation_history: List[Dict],
        user_id: Optional[str] = None
    ) -> str:
        """
        Build enriched context from memory and conversation history.
        
        Args:
            user_message: Current user message
            conversation_history: Recent conversation turns
            user_id: Filter memories for specific user
            
        Returns:
            Context string to inject into prompt
        """
        # Recall relevant long-term memories for this user
        relevant_memories = self.recall_memories(user_message, top_k=3, user_id=user_id)
        
        context_parts = []
        
        # Add relevant memories
        if relevant_memories:
            context_parts.append("=== RELEVANT PAST CONTEXT ===")
            for memory, score in relevant_memories:
                context_parts.append(f"[Relevance: {score:.2f}] {memory}")
            context_parts.append("")
        
        # Add conversation history
        if conversation_history:
            context_parts.append("=== RECENT CONVERSATION ===")
            for msg in conversation_history[-5:]:  # Last 5 turns
                role = msg.get("role", "user")
                content = msg.get("content", "")
                context_parts.append(f"{role.capitalize()}: {content}")
            context_parts.append("")
        
        return "\n".join(context_parts)
    
    def generate_response(
        self,
        user_message: str,
        user_id: Optional[str] = None,
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """
        Generate agent response using LLM + memory.
        
        Args:
            user_message: User's current message
            user_id: User identifier
            conversation_history: Recent conversation
            
        Returns:
            Agent's response
        """
        conversation_history = conversation_history or []
        
        # Build enriched context with user-specific memories
        context = self.build_context(user_message, conversation_history, user_id=user_id)
        
        # Construct messages for LLM
        messages = [
            {"role": "system", "content": self.system_instruction}
        ]
        
        # Add context if available
        if context:
            messages.append({
                "role": "system",
                "content": f"Context from memory:\n{context}"
            })
        
        # Add conversation history
        for msg in conversation_history[-5:]:
            messages.append(msg)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Try models in priority order
        response_text = None
        for model in self.model_priority:
            try:
                response = self.groq_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500
                )
                response_text = response.choices[0].message.content
                break
            except Exception as e:
                print(f"Model {model} failed: {e}")
                continue
        
        if not response_text:
            response_text = "I'm having trouble responding right now. Please try again."
        
        # Store this interaction in memory
        self.store_memory(user_message, response_text, user_id)
        
        # Update interaction stats
        self.last_interaction = datetime.now()
        self.interaction_count += 1
        self._save_state()
        
        return response_text
    
    def get_summary(self) -> Dict:
        """
        Get agent summary for dashboard/UI.
        
        Returns:
            Dictionary with agent state and statistics
        """
        return {
            "name": self.name,
            "title": self.title,
            "description": self.role_description,
            "memory_count": self.memory.count(),
            "last_interaction": self.last_interaction.isoformat() if self.last_interaction else None,
            "interaction_count": self.interaction_count,
            "status": "active" if self.interaction_count > 0 else "ready"
        }
    
    def calculate_metrics(self, user_id: Optional[str] = None) -> Dict:
        """
        Calculate agent-specific metrics for dashboard.
        
        Override this in specialized agents to provide custom metrics.
        
        Args:
            user_id: User identifier
            
        Returns:
            Dictionary of metrics specific to this agent
        """
        return {
            "total_interactions": self.interaction_count,
            "memory_size": self.memory.count()
        }

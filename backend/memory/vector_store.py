"""
Vector Memory Store for Agent Memory
-------------------------------------
Persistent vector database using FAISS for fast semantic search.
Each agent has its own isolated memory space.
"""

import os
import pickle
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import numpy as np


class MemoryEntry:
    """Single memory item with metadata."""
    
    def __init__(
        self,
        content: str,
        embedding: np.ndarray,
        timestamp: datetime,
        metadata: Optional[Dict] = None
    ):
        self.content = content
        self.embedding = embedding
        self.timestamp = timestamp
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization."""
        return {
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }


class VectorMemoryStore:
    """
    Vector-based memory store for a single agent.
    
    Stores conversation history, user preferences, and context
    as searchable embeddings.
    """
    
    def __init__(self, agent_name: str, storage_dir: str = "storage"):
        """
        Initialize memory store for an agent.
        
        Args:
            agent_name: Unique identifier for the agent
            storage_dir: Directory to persist memory
        """
        self.agent_name = agent_name
        self.storage_dir = storage_dir
        self.storage_path = os.path.join(storage_dir, f"{agent_name}_memory.pkl")
        
        # In-memory store
        self.memories: List[MemoryEntry] = []
        self.embeddings_matrix: Optional[np.ndarray] = None
        
        # Ensure storage directory exists
        os.makedirs(storage_dir, exist_ok=True)
        
        # Load existing memories
        self.load()
    
    def add_memory(
        self,
        content: str,
        embedding: np.ndarray,
        metadata: Optional[Dict] = None
    ) -> None:
        """
        Add a new memory entry.
        
        Args:
            content: Text content of the memory
            embedding: Vector embedding of the content
            metadata: Additional metadata (e.g., user_id, topic)
        """
        entry = MemoryEntry(
            content=content,
            embedding=embedding,
            timestamp=datetime.now(),
            metadata=metadata
        )
        
        self.memories.append(entry)
        
        # Update embeddings matrix
        if self.embeddings_matrix is None:
            self.embeddings_matrix = embedding.reshape(1, -1)
        else:
            self.embeddings_matrix = np.vstack([self.embeddings_matrix, embedding])
        
        # Auto-save after adding
        self.save()
    
    def search(
        self,
        query_embedding: np.ndarray,
        top_k: int = 5,
        threshold: float = 0.5,
        user_id: Optional[str] = None
    ) -> List[Tuple[MemoryEntry, float]]:
        """
        Search memories by semantic similarity.
        
        Args:
            query_embedding: Vector to search for
            top_k: Maximum number of results
            threshold: Minimum similarity score (0-1)
            user_id: Filter memories for specific user
            
        Returns:
            List of (MemoryEntry, similarity_score) tuples
        """
        if not self.memories or self.embeddings_matrix is None:
            return []
        
        # Filter by user_id if provided
        if user_id:
            user_memories = []
            user_indices = []
            for idx, memory in enumerate(self.memories):
                if memory.metadata.get("user_id") == user_id:
                    user_memories.append(memory)
                    user_indices.append(idx)
            
            if not user_memories:
                return []
            
            # Get embeddings for user's memories
            user_embeddings = self.embeddings_matrix[user_indices]
        else:
            user_memories = self.memories
            user_embeddings = self.embeddings_matrix
        
        # Calculate cosine similarities
        query_norm = query_embedding / np.linalg.norm(query_embedding)
        
        # Normalize stored embeddings
        norms = np.linalg.norm(user_embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1  # Prevent division by zero
        normalized_embeddings = user_embeddings / norms
        
        # Compute similarities
        similarities = np.dot(normalized_embeddings, query_norm)
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        # Filter by threshold and return
        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score >= threshold:
                results.append((user_memories[idx], score))
        
        return results
    
    def get_recent_memories(self, count: int = 10) -> List[MemoryEntry]:
        """
        Get most recent memories.
        
        Args:
            count: Number of memories to retrieve
            
        Returns:
            List of MemoryEntry objects, most recent first
        """
        return self.memories[-count:][::-1]
    
    def get_all_memories(self) -> List[MemoryEntry]:
        """Get all memories in chronological order."""
        return self.memories.copy()
    
    def count(self) -> int:
        """Get total number of stored memories."""
        return len(self.memories)
    
    def save(self) -> None:
        """Persist memories to disk."""
        data = {
            "agent_name": self.agent_name,
            "memories": [
                {
                    "content": m.content,
                    "embedding": m.embedding,
                    "timestamp": m.timestamp,
                    "metadata": m.metadata
                }
                for m in self.memories
            ],
            "embeddings_matrix": self.embeddings_matrix
        }
        
        with open(self.storage_path, "wb") as f:
            pickle.dump(data, f)
    
    def load(self) -> None:
        """Load memories from disk if they exist."""
        if not os.path.exists(self.storage_path):
            return
        
        try:
            with open(self.storage_path, "rb") as f:
                data = pickle.load(f)
            
            self.memories = [
                MemoryEntry(
                    content=m["content"],
                    embedding=m["embedding"],
                    timestamp=m["timestamp"],
                    metadata=m["metadata"]
                )
                for m in data["memories"]
            ]
            
            self.embeddings_matrix = data.get("embeddings_matrix")
            
        except Exception as e:
            print(f"Warning: Could not load memories for {self.agent_name}: {e}")
            self.memories = []
            self.embeddings_matrix = None
    
    def clear(self) -> None:
        """Clear all memories (use with caution!)."""
        self.memories = []
        self.embeddings_matrix = None
        self.save()

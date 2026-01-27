"""
Memory System Initialization Module
------------------------------------
Initialize all components needed for the memory system.
"""

# This file can be imported to ensure all memory components are loaded
from memory.embedding import get_embedding_service
from memory.vector_store import VectorMemoryStore

__all__ = ["get_embedding_service", "VectorMemoryStore"]

"""
Embedding Service for Agentic Memory System
--------------------------------------------
Converts text to vector embeddings for semantic search and memory recall.
Uses sentence-transformers for local, fast embeddings.
"""

from typing import List
import numpy as np


class EmbeddingService:
    """
    Manages text-to-vector conversion for agent memory.
    
    Uses a lightweight model that works offline and is fast enough
    for real-time agent interactions.
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize embedding model.
        
        Args:
            model_name: HuggingFace model name. Default is lightweight and fast.
        """
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(model_name)
            self.dimension = 384  # Dimension of all-MiniLM-L6-v2
        except ImportError:
            raise ImportError(
                "sentence-transformers not installed. "
                "Run: pip install sentence-transformers"
            )
    
    def embed(self, text: str) -> np.ndarray:
        """
        Convert single text to embedding vector.
        
        Args:
            text: Input text to embed
            
        Returns:
            numpy array of shape (dimension,)
        """
        if not text or not text.strip():
            # Return zero vector for empty text
            return np.zeros(self.dimension)
        
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding
    
    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """
        Convert multiple texts to embeddings efficiently.
        
        Args:
            texts: List of strings to embed
            
        Returns:
            numpy array of shape (len(texts), dimension)
        """
        if not texts:
            return np.array([])
        
        # Filter out empty strings
        non_empty_texts = [t if t.strip() else " " for t in texts]
        embeddings = self.model.encode(non_empty_texts, convert_to_numpy=True)
        return embeddings
    
    def similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings.
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Similarity score between -1 and 1 (higher = more similar)
        """
        # Normalize vectors
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        # Cosine similarity
        return float(np.dot(embedding1, embedding2) / (norm1 * norm2))


# Global singleton instance
_embedding_service = None


def get_embedding_service() -> EmbeddingService:
    """
    Get or create global embedding service instance.
    
    Returns:
        Shared EmbeddingService instance
    """
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service

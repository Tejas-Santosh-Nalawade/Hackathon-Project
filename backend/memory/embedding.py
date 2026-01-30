"""
Lightweight Embedding Service for Agentic Memory System
--------------------------------------------------------
Uses simple hash-based embeddings instead of ML models for memory efficiency.
Perfect for Render's 512MB free tier deployment.
"""

from typing import List
import hashlib
import numpy as np


class EmbeddingService:
    """
    Manages text-to-vector conversion using lightweight hashing.
    No ML models = minimal memory footprint (<5MB vs 400MB+)
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize lightweight embedding (model_name kept for compatibility)"""
        self.dimension = 64  # Small dimension for memory efficiency
    
    def embed(self, text: str) -> np.ndarray:
        """
        Convert single text to embedding vector using hashing.
        
        Args:
            text: Input text to embed
            
        Returns:
            numpy array of shape (dimension,)
        """
        if not text or not text.strip():
            return np.zeros(self.dimension)
        
        # Use MD5 hash and convert to normalized vector
        hash_obj = hashlib.md5(text.lower().strip().encode())
        hash_bytes = hash_obj.digest()
        
        # Convert bytes to normalized floats
        embedding = []
        for i in range(0, len(hash_bytes), 2):
            if i + 1 < len(hash_bytes):
                val = (hash_bytes[i] * 256 + hash_bytes[i + 1]) / 65535.0
                embedding.append(val * 2 - 1)  # Normalize to [-1, 1]
        
        # Pad to dimension
        while len(embedding) < self.dimension:
            embedding.append(0.0)
        
        return np.array(embedding[:self.dimension])
    
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
        
        embeddings = [self.embed(t) for t in texts]
        return np.array(embeddings)
    
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

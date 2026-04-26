import json
import faiss
import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from app.core.config import settings


class Retriever:
    """Loads FAISS index and retrieves relevant chunks."""

    def __init__(self):
        self.model = SentenceTransformer(
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )
        self.index = faiss.read_index(f"{settings.index_path}/index.faiss")
        self.chunks = self._load_chunks()

    def _load_chunks(self) -> List[Dict[str, Any]]:
        """Load chunks from JSONL file."""
        chunks = []
        with open(settings.corpus_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    chunks.append(json.loads(line))
        return chunks

    def retrieve(
        self, query: str, country: str, top_k: int = None
    ) -> List[Dict[str, Any]]:
        """
        Embbed query, search top-k chunks in FAISS, optionally filter by country.
        """
        if top_k is None:
            top_k = settings.top_k

        # Embed query
        query_embedding = self.model.encode([query], normalize_embeddings=True)
        query_embedding = np.array(query_embedding, dtype=np.float32)

        # Search FAISS
        distances, indices = self.index.search(query_embedding, min(top_k * 2, len(self.chunks)))

        # Collect retrieved chunks
        retrieved = []
        for idx in indices[0]:
            if idx < len(self.chunks):
                chunk = self.chunks[idx]
                # Filter by country if specified and different from latam
                if country and country != "latam" and chunk.get("country") not in [country, "latam"]:
                    continue
                retrieved.append(chunk)
                if len(retrieved) == top_k:
                    break

        return retrieved


# Singleton instance
_retriever = None


def get_retriever() -> Retriever:
    """Lazy-load retriever (dependency injection)."""
    global _retriever
    if _retriever is None:
        _retriever = Retriever()
    return _retriever

import argparse
import json
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

BASE = Path("knowledge_base/processed/faiss_index")
INDEX_PATH = BASE / "index.faiss"
CHUNKS_PATH = BASE / "chunks.jsonl"
CONFIG_PATH = BASE / "index_config.json"

def load_chunks():
    chunks = []
    with CHUNKS_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                chunks.append(json.loads(line))
    return chunks

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("query")
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        config = json.load(f)

    model_name = config.get("model_name") or config.get("model") or "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

    model = SentenceTransformer(model_name)
    index = faiss.read_index(str(INDEX_PATH))
    chunks = load_chunks()

    query_vector = model.encode([args.query], normalize_embeddings=True)
    query_vector = np.array(query_vector).astype("float32")

    scores, ids = index.search(query_vector, args.top_k)

    print(f"\nPregunta: {args.query}\n")

    for rank, idx in enumerate(ids[0], 1):
        if idx < 0:
            continue

        chunk = chunks[idx]
        score = float(scores[0][rank - 1])

        print("=" * 80)
        print(f"#{rank} | score={score:.4f}")
        print(f"Título: {chunk.get('title')}")
        print(f"Sección: {chunk.get('section')}")
        print(f"País: {chunk.get('country')}")
        print(f"Fuente: {chunk.get('source')}")
        print()
        print(chunk.get("text", "")[:700])
        print()

if __name__ == "__main__":
    main()

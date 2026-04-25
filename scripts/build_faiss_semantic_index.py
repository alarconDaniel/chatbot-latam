#!/usr/bin/env python3
"""
Indice semantico recomendado para el MVP final: SentenceTransformers + FAISS.

Uso en Kali, con internet disponible una vez:
  python3 -m venv .venv
  source .venv/bin/activate
  pip install sentence-transformers faiss-cpu numpy
  python scripts/build_faiss_semantic_index.py

Modelo recomendado para espanol/multilingue:
  sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


def read_jsonl(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--chunks", type=Path, default=Path("knowledge_base/processed/rag_chunks.jsonl"))
    parser.add_argument("--index-dir", type=Path, default=Path("knowledge_base/processed/faiss_index"))
    parser.add_argument("--model", default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    args = parser.parse_args()

    chunks = read_jsonl(args.chunks)
    texts = [f"{c['title']}\n{c['section']}\n{c['text']}" for c in chunks]

    model = SentenceTransformer(args.model)
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=True)
    embeddings = np.asarray(embeddings, dtype="float32")

    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    args.index_dir.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(args.index_dir / "index.faiss"))
    np.save(args.index_dir / "embeddings.npy", embeddings)
    (args.index_dir / "chunks.jsonl").write_text(args.chunks.read_text(encoding="utf-8"), encoding="utf-8")
    (args.index_dir / "index_config.json").write_text(json.dumps({
        "index_type": "faiss_IndexFlatIP",
        "model": args.model,
        "n_chunks": len(chunks),
        "embedding_dim": int(embeddings.shape[1]),
        "similarity": "inner product sobre embeddings normalizados = cosine similarity",
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"FAISS index creado en {args.index_dir}")
    print(f"Chunks indexados: {len(chunks)}")


if __name__ == "__main__":
    main()

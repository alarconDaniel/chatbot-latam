#!/usr/bin/env python3
"""Buscador simple para probar el indice vectorial generado."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Iterable, List

import numpy as np


def normalize_for_tokens(text: str) -> str:
    text = text.lower()
    text = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in text if not unicodedata.combining(ch))


def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9ñáéíóúü]+", normalize_for_tokens(text))


def stable_hash(value: str) -> int:
    return int(hashlib.md5(value.encode("utf-8")).hexdigest(), 16)


def features(text: str) -> Iterable[str]:
    toks = tokenize(text)
    for t in toks:
        if len(t) >= 2:
            yield f"w:{t}"
    for a, b in zip(toks, toks[1:]):
        if len(a) >= 2 and len(b) >= 2:
            yield f"b:{a}_{b}"


def query_vector(text: str, idf: np.ndarray) -> np.ndarray:
    n_features = idf.shape[0]
    vec = np.zeros(n_features, dtype=np.float32)
    feat_counts = Counter(stable_hash(feat) % n_features for feat in features(text))
    for col, count in feat_counts.items():
        vec[col] = math.log1p(count)
    vec *= idf
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec


def read_jsonl(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("query")
    parser.add_argument("--index-dir", type=Path, default=Path("knowledge_base/processed/vector_index"))
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    vectors = np.load(args.index_dir / "vectors.npy")
    idf = np.load(args.index_dir / "idf.npy")
    chunks = read_jsonl(args.index_dir / "chunks.jsonl")

    q = query_vector(args.query, idf)
    scores = vectors @ q
    order = np.argsort(-scores)[: args.top_k]

    for rank, idx in enumerate(order, 1):
        c = chunks[int(idx)]
        print(f"\n[{rank}] score={scores[idx]:.4f} | {c['chunk_id']}")
        print(f"Titulo: {c.get('title','')} | Seccion: {c.get('section','')} | Pais: {c.get('country','')}")
        if c.get("url"):
            print(f"URL: {c['url']}")
        print(c.get("text", "")[:700])


if __name__ == "__main__":
    main()

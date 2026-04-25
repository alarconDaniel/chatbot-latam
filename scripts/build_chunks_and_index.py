#!/usr/bin/env python3
"""
Construye chunks e indice vectorial local desde corpus_master_integrado.jsonl.

Este script NO requiere internet ni modelos externos. Usa un indice vectorial
liviano basado en hashing + TF-IDF para dejar el pipeline funcionando. Para
mejor calidad semantica, luego pueden reemplazarlo por SentenceTransformers/FAISS.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

import numpy as np

DEFAULT_INPUT = Path("knowledge_base/processed/corpus_master_integrado.jsonl")
DEFAULT_CHUNKS = Path("knowledge_base/processed/rag_chunks.jsonl")
DEFAULT_INDEX_DIR = Path("knowledge_base/processed/vector_index")


def normalize_text(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_for_tokens(text: str) -> str:
    text = text.lower()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return text


def tokenize(text: str) -> List[str]:
    text = normalize_for_tokens(text)
    return re.findall(r"[a-z0-9ñáéíóúü]+", text)


def stable_hash(value: str) -> int:
    return int(hashlib.md5(value.encode("utf-8")).hexdigest(), 16)


def sentence_split(text: str) -> List[str]:
    text = normalize_text(text)
    if not text:
        return []
    # Split simple para espanol: conserva oraciones suficientemente limpias.
    parts = re.split(r"(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ0-9])", text)
    return [p.strip() for p in parts if p.strip()]


def word_count(text: str) -> int:
    return len(tokenize(text))


def chunk_record(record: Dict[str, Any], target_words: int, overlap_words: int) -> List[Dict[str, Any]]:
    text = normalize_text(record.get("text", ""))
    sentences = sentence_split(text)
    if not sentences:
        return []

    chunks_text: List[str] = []
    current: List[str] = []
    current_words = 0

    for sent in sentences:
        sw = word_count(sent)
        if current and current_words + sw > target_words:
            chunks_text.append(normalize_text(" ".join(current)))
            # overlap aproximado por palabras desde el final del chunk previo
            prev_words = " ".join(current).split()
            overlap = prev_words[-overlap_words:] if overlap_words > 0 else []
            current = [" ".join(overlap)] if overlap else []
            current_words = word_count(" ".join(current))
        current.append(sent)
        current_words += sw

    if current:
        chunks_text.append(normalize_text(" ".join(current)))

    # Si el texto era corto, queda un solo chunk. Si algun chunk queda demasiado pequeno,
    # lo conservamos porque puede tener datos puntuales utiles, como contacto.
    out: List[Dict[str, Any]] = []
    parent_id = record.get("id") or hashlib.sha1(text[:200].encode("utf-8")).hexdigest()[:12]
    total = len(chunks_text)
    for i, chunk_text in enumerate(chunks_text, 1):
        chunk_id = f"{parent_id}__chunk_{i:03d}"
        out.append({
            "chunk_id": chunk_id,
            "parent_id": parent_id,
            "chunk_index": i,
            "chunk_total": total,
            "title": record.get("title", ""),
            "section": record.get("section", ""),
            "country": record.get("country", "latam"),
            "audience": record.get("audience", []),
            "source_ids": record.get("source_ids", []),
            "source": record.get("source", ""),
            "url": record.get("url", ""),
            "suggested_links": record.get("suggested_links", []),
            "confidence": record.get("confidence", ""),
            "status": record.get("status", "curado"),
            "language": record.get("language", "es"),
            "text": chunk_text,
            "word_count": word_count(chunk_text),
        })
    return out


def features(text: str) -> Iterable[str]:
    toks = tokenize(text)
    for t in toks:
        if len(t) >= 2:
            yield f"w:{t}"
    for a, b in zip(toks, toks[1:]):
        if len(a) >= 2 and len(b) >= 2:
            yield f"b:{a}_{b}"


def vectorize_hash_tfidf(texts: List[str], n_features: int) -> Tuple[np.ndarray, np.ndarray]:
    n = len(texts)
    counts = np.zeros((n, n_features), dtype=np.float32)
    df = np.zeros(n_features, dtype=np.float32)

    for row, text in enumerate(texts):
        feat_counts = Counter(stable_hash(feat) % n_features for feat in features(text))
        for col, count in feat_counts.items():
            counts[row, col] = math.log1p(count)
        for col in feat_counts.keys():
            df[col] += 1.0

    idf = np.log((n + 1.0) / (df + 1.0)) + 1.0
    matrix = counts * idf
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    matrix = matrix / norms
    return matrix.astype(np.float32), idf.astype(np.float32)


def read_jsonl(path: Path) -> List[Dict[str, Any]]:
    records = []
    with path.open("r", encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError as exc:
                raise ValueError(f"JSON invalido en {path}:{lineno}: {exc}") from exc
    return records


def write_jsonl(path: Path, records: List[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for item in records:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--chunks", type=Path, default=DEFAULT_CHUNKS)
    parser.add_argument("--index-dir", type=Path, default=DEFAULT_INDEX_DIR)
    parser.add_argument("--target-words", type=int, default=140)
    parser.add_argument("--overlap-words", type=int, default=35)
    parser.add_argument("--n-features", type=int, default=2048)
    args = parser.parse_args()

    records = read_jsonl(args.input)
    chunks: List[Dict[str, Any]] = []
    for record in records:
        if record.get("status", "curado") != "curado":
            continue
        chunks.extend(chunk_record(record, args.target_words, args.overlap_words))

    if not chunks:
        raise SystemExit("No se generaron chunks. Revisa el corpus de entrada.")

    write_jsonl(args.chunks, chunks)

    texts_for_index = [
        f"{c.get('title','')} {c.get('section','')} {c.get('country','')} {c.get('text','')}"
        for c in chunks
    ]
    matrix, idf = vectorize_hash_tfidf(texts_for_index, args.n_features)

    args.index_dir.mkdir(parents=True, exist_ok=True)
    np.save(args.index_dir / "vectors.npy", matrix)
    np.save(args.index_dir / "idf.npy", idf)
    write_jsonl(args.index_dir / "chunks.jsonl", chunks)

    config = {
        "index_type": "hashing_tfidf_dense_numpy",
        "description": "Indice vectorial local sin dependencias externas; util para demo y pruebas de recuperacion.",
        "input_file": str(args.input),
        "chunks_file": str(args.chunks),
        "index_dir": str(args.index_dir),
        "n_source_records": len(records),
        "n_chunks": len(chunks),
        "n_features": args.n_features,
        "target_words": args.target_words,
        "overlap_words": args.overlap_words,
        "similarity": "cosine sobre vectores normalizados",
        "recommendation": "Para produccion/MVP final, reemplazar por sentence-transformers paraphrase-multilingual-MiniLM-L12-v2 + FAISS o Chroma.",
    }
    (args.index_dir / "index_config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Registros fuente: {len(records)}")
    print(f"Chunks generados: {len(chunks)}")
    print(f"Archivo chunks: {args.chunks}")
    print(f"Indice: {args.index_dir}")


if __name__ == "__main__":
    main()

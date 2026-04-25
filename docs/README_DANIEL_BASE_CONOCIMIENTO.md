# Base de conocimiento - Daniel

## Objetivo

Construir la base documental pública y aprobada para el chatbot RAG de Latinoamérica Comparte / Colombia Comparte.

Esta parte corresponde al frente de Daniel: corpus curado, chunks, índice vectorial, preguntas de prueba y evidencias de recuperación.

## Archivos principales

- knowledge_base/processed/corpus_master_integrado.jsonl
  Corpus curado e integrado.

- knowledge_base/processed/rag_chunks.jsonl
  Chunks generados a partir del corpus.

- knowledge_base/processed/faiss_index/
  Índice vectorial local FAISS.

- knowledge_base/processed/faiss_index/index.faiss
  Archivo principal del índice FAISS.

- knowledge_base/processed/faiss_index/embeddings.npy
  Embeddings generados para los chunks.

- knowledge_base/processed/faiss_index/chunks.jsonl
  Chunks usados por el índice FAISS.

- knowledge_base/eval/questions_daniel.jsonl
  Preguntas base de evaluación.

- knowledge_base/eval/matriz_calidad_daniel.md
  Matriz de calidad y validación manual.

- docs/evidencias/
  Evidencias de recuperación semántica.

## Activar entorno virtual

Ejecutar desde la raíz del proyecto:

    cd /home/labewbew/Documentos/chatbot-latam
    source .venv/bin/activate

## Regenerar chunks

Ejecutar desde la raíz del proyecto:

    python3 scripts/build_chunks_and_index.py \
      --input knowledge_base/processed/corpus_master_integrado.jsonl \
      --chunks knowledge_base/processed/rag_chunks.jsonl \
      --index-dir knowledge_base/processed/vector_index \
      --target-words 140 \
      --overlap-words 35

## Regenerar índice FAISS

Ejecutar desde la raíz del proyecto:

    python3 scripts/build_faiss_semantic_index.py

Esto genera o actualiza:

    knowledge_base/processed/faiss_index/index.faiss
    knowledge_base/processed/faiss_index/embeddings.npy
    knowledge_base/processed/faiss_index/chunks.jsonl
    knowledge_base/processed/faiss_index/index_config.json

## Probar recuperación semántica

Ejecutar desde la raíz del proyecto:

    python3 scripts/test_faiss_retrieval.py "Qué es EDIFICA y a quién acompaña" --top-k 5

Otras pruebas recomendadas:

    python3 scripts/test_faiss_retrieval.py "Qué es NODUS" --top-k 5
    python3 scripts/test_faiss_retrieval.py "Qué es TOP SPEAKERS" --top-k 5
    python3 scripts/test_faiss_retrieval.py "Cuál es la historia de Colombia Comparte" --top-k 5
    python3 scripts/test_faiss_retrieval.py "Cómo puedo contactar a Colombia Comparte" --top-k 5

## Validar que los JSONL no estén rotos

Ejecutar desde la raíz del proyecto:

    python3 - <<'PY'
    import json
    from pathlib import Path

    files = [
        "knowledge_base/processed/corpus_master_integrado.jsonl",
        "knowledge_base/processed/rag_chunks.jsonl",
        "knowledge_base/processed/faiss_index/chunks.jsonl",
    ]

    for file in files:
        path = Path(file)
        count = 0
        with path.open("r", encoding="utf-8") as f:
            for i, line in enumerate(f, 1):
                if line.strip():
                    json.loads(line)
                    count += 1
        print(f"OK {file}: {count} registros válidos")
    PY

## Validar limpieza del corpus

Ejecutar desde la raíz del proyecto:

    rg -i "404 not found|httrack website copier|you are not logged in|skip to main content|wp-admin|wp-login|password|contraseña" \
      knowledge_base/processed/corpus_master_integrado.jsonl \
      knowledge_base/processed/rag_chunks.jsonl

Resultado esperado:

    No debería devolver coincidencias.

Nota:

Si aparece la palabra "administrativa" dentro del chunk de guardrails, se acepta porque no es basura ni información privada. Es una regla de seguridad del chatbot.

## Validar índice FAISS

Ejecutar desde la raíz del proyecto:

    python3 - <<'PY'
    import faiss
    import numpy as np
    import json

    index_path = "knowledge_base/processed/faiss_index/index.faiss"
    emb_path = "knowledge_base/processed/faiss_index/embeddings.npy"
    chunks_path = "knowledge_base/processed/faiss_index/chunks.jsonl"
    config_path = "knowledge_base/processed/faiss_index/index_config.json"

    index = faiss.read_index(index_path)
    embeddings = np.load(emb_path)

    chunks = []
    with open(chunks_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                chunks.append(json.loads(line))

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    print("FAISS ntotal:", index.ntotal)
    print("Embeddings shape:", embeddings.shape)
    print("Chunks:", len(chunks))
    print("Modelo:", config.get("model_name") or config.get("model"))

    assert index.ntotal == len(chunks), "ERROR: FAISS no coincide con la cantidad de chunks"
    assert embeddings.shape[0] == len(chunks), "ERROR: embeddings no coincide con chunks"

    print("OK: índice FAISS consistente")
    PY

## Estado actual

La base de conocimiento queda lista para integración con el backend del chatbot.

El siguiente paso para Felipe es conectar el retriever al endpoint:

    POST /api/chat/ask

El siguiente paso para Silva es validar seguridad, rechazos y comportamiento ante preguntas fuera de alcance.

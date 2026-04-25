# Chunking e índice vectorial - chatbot-latam

Este paquete deja lista la primera versión del pipeline RAG para Daniel:

1. `corpus_master_integrado.jsonl` -> corpus curado integrado.
2. `rag_chunks.jsonl` -> chunks listos para recuperación.
3. `vector_index/` -> índice vectorial local para pruebas de recuperación.
4. `scripts/build_chunks_and_index.py` -> regenera chunks e índice sin internet.
5. `scripts/search_vector_index.py` -> prueba búsquedas contra el índice.
6. `scripts/build_faiss_semantic_index.py` -> opción recomendada para índice semántico final con SentenceTransformers + FAISS.

## Copiar al proyecto

Desde la carpeta donde descargues el ZIP:

```bash
cd /home/labewbew/Documentos/chatbot-latam

cp ~/Descargas/corpus_master_integrado.jsonl knowledge_base/processed/
cp ~/Descargas/rag_chunks.jsonl knowledge_base/processed/
cp -r ~/Descargas/vector_index knowledge_base/processed/
cp ~/Descargas/build_chunks_and_index.py scripts/
cp ~/Descargas/search_vector_index.py scripts/
cp ~/Descargas/build_faiss_semantic_index.py scripts/
```

Si descomprimes el ZIP directamente dentro del proyecto, puedes hacer:

```bash
cd /home/labewbew/Documentos/chatbot-latam
unzip ~/Descargas/rag_chunks_vector_index_chatbot_latam.zip -d .
```

## Regenerar chunks e índice local

```bash
cd /home/labewbew/Documentos/chatbot-latam

python3 scripts/build_chunks_and_index.py \
  --input knowledge_base/processed/corpus_master_integrado.jsonl \
  --chunks knowledge_base/processed/rag_chunks.jsonl \
  --index-dir knowledge_base/processed/vector_index \
  --target-words 140 \
  --overlap-words 35
```

Salida esperada:

```text
Registros fuente: 22
Chunks generados: 22
Archivo chunks: knowledge_base/processed/rag_chunks.jsonl
Indice: knowledge_base/processed/vector_index
```

## Probar recuperación

```bash
python3 scripts/search_vector_index.py "que es edifica y a quien acompaña" --top-k 5
python3 scripts/search_vector_index.py "como contacto a colombia comparte" --top-k 5
python3 scripts/search_vector_index.py "que es nodus" --top-k 5
python3 scripts/search_vector_index.py "top speakers liderazgo bienestar empresas" --top-k 5
```

## Nota técnica

El índice incluido usa hashing + TF-IDF con NumPy para que funcione sin internet ni dependencias pesadas. Sirve para demo y pruebas funcionales del pipeline.

Para mejor calidad semántica en el MVP final, usen el script `build_faiss_semantic_index.py` con:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install sentence-transformers faiss-cpu numpy
python scripts/build_faiss_semantic_index.py
```

Modelo recomendado:

```text
sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
```

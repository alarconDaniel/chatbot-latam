# Glosario RAG para dummies

Este documento explica, en corto y sin tanto enredo, los conceptos principales del proyecto `chatbot-latam`.

## RAG

RAG significa `Retrieval-Augmented Generation`.

En español: generación aumentada con recuperación.

La idea es que el chatbot no responda solo con lo que "cree saber", sino que primero busca información en una base documental aprobada y luego responde usando ese contexto.

Flujo simple:

```text
Pregunta del usuario
        ↓
Buscar fragmentos relevantes
        ↓
Pasar esos fragmentos al modelo
        ↓
Generar respuesta basada en el contexto
```

## Corpus

El corpus es la base textual del proyecto.

En este caso, es el contenido público y aprobado sobre Latinoamérica Comparte / Colombia Comparte, sus programas, historia, impacto, noticias y contacto.

Archivo principal:

```text
knowledge_base/processed/corpus_master_integrado.jsonl
```

## JSONL

JSONL significa `JSON Lines`.

Es un formato donde cada línea es un JSON independiente.

Ejemplo:

```json
{"title": "EDIFICA", "section": "Programas", "text": "EDIFICA es...", "country": "co"}
{"title": "NODUS", "section": "Programas", "text": "NODUS es...", "country": "co"}
```

Sirve para guardar muchos registros de texto de forma ordenada.

## Chunk

Un chunk es un pedazo pequeño de texto sacado del corpus.

En vez de mandarle documentos completos al chatbot, se parte la información en fragmentos más manejables.

Ejemplo:

```text
Documento completo sobre Colombia Comparte
        ↓
chunk 1: historia
chunk 2: EDIFICA
chunk 3: TOP SPEAKERS
chunk 4: NODUS
chunk 5: contacto
```

Archivo principal:

```text
knowledge_base/processed/rag_chunks.jsonl
```

## Chunk size

Es el tamaño aproximado de cada chunk.

En este proyecto se usa un tamaño objetivo de 140 palabras:

```bash
--target-words 140
```

## Overlap

El overlap es una pequeña repetición entre chunks.

Sirve para que no se pierda contexto cuando una idea queda partida entre dos fragmentos.

En este proyecto se usa:

```bash
--overlap-words 35
```

## Embedding

Un embedding es una lista de números que representa el significado de un texto.

Cada chunk se convierte en un embedding.

Ejemplo simplificado:

```text
Chunk:
"EDIFICA es un programa de emprendimiento..."

Embedding:
[0.12, -0.45, 0.88, 0.03, ...]
```

La pregunta del usuario también se convierte en embedding.

Luego se comparan embeddings para encontrar qué chunks se parecen más a la pregunta.

## Modelo de embeddings

El modelo de embeddings es el encargado de convertir texto en listas de números.

Modelo usado actualmente:

```text
sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
```

Este modelo sirve para texto multilingüe, por eso es útil para preguntas y contenido en español.

## FAISS

FAISS es el índice vectorial del proyecto.

En simple: es el buscador inteligente que compara embeddings.

FAISS guarda los embeddings de los chunks y permite encontrar rápidamente cuáles son los más parecidos a la pregunta del usuario.

Archivos principales:

```text
knowledge_base/processed/faiss_index/index.faiss
knowledge_base/processed/faiss_index/embeddings.npy
knowledge_base/processed/faiss_index/chunks.jsonl
knowledge_base/processed/faiss_index/index_config.json
```

## Índice vectorial

Es una estructura que permite buscar por significado, no solo por palabras exactas.

Ejemplo:

```text
Pregunta:
"¿Qué programa apoya emprendimientos?"

Puede encontrar un chunk que diga:
"EDIFICA acompaña iniciativas de emprendimiento..."
```

Aunque la pregunta no use exactamente las mismas palabras, el índice puede recuperar el contexto correcto.

## Retriever

El retriever es la parte del sistema que busca los chunks relevantes.

Recibe una pregunta, consulta FAISS y devuelve los mejores fragmentos.

Ejemplo:

```text
Pregunta: "¿Qué es EDIFICA?"
        ↓
Retriever busca en FAISS
        ↓
Devuelve los 3 a 5 chunks más relevantes
```

## Pipeline actual

El pipeline actual funciona así:

```text
1. Corpus curado
   knowledge_base/processed/corpus_master_integrado.jsonl

2. Generación de chunks
   scripts/build_chunks_and_index.py

3. Chunks generados
   knowledge_base/processed/rag_chunks.jsonl

4. Generación de embeddings e índice FAISS
   scripts/build_faiss_semantic_index.py

5. Índice vectorial
   knowledge_base/processed/faiss_index/

6. Prueba de recuperación
   scripts/test_faiss_retrieval.py
```

## ¿Cuándo regenerar chunks?

Solo se regeneran chunks si cambia el corpus o si se quiere ajustar el tamaño de los fragmentos.

Ejemplos:

- Se agregó nuevo contenido.
- Se corrigió información del corpus.
- Se limpió texto basura.
- Se cambió `target-words`.
- Se cambió `overlap-words`.

## ¿Cuándo regenerar FAISS?

Se regenera FAISS cuando cambian los chunks o cambia el modelo de embeddings.

Ejemplos:

- Cambió `rag_chunks.jsonl`.
- Cambió el modelo de embeddings.
- Se quiere reconstruir el índice desde cero.

## Resumen corto para exposición

El chatbot usa RAG. Primero se toma contenido público aprobado, se divide en chunks, cada chunk se convierte en un embedding y se guarda en FAISS. Cuando el usuario pregunta algo, la pregunta también se convierte en embedding y FAISS recupera los chunks más parecidos. Luego el chatbot responde usando ese contexto.

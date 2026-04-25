# Matriz de calidad - Daniel

Fecha: 2026-04-24

## Estado de base de conocimiento

| Ítem | Estado | Evidencia |
|---|---|---|
| Corpus integrado creado | OK | knowledge_base/processed/corpus_master_integrado.jsonl |
| Corpus sin 404/HTTrack/login | OK | Validado con rg |
| Chunks generados | OK | knowledge_base/processed/rag_chunks.jsonl |
| Índice FAISS generado | OK | knowledge_base/processed/faiss_index/index.faiss |
| Embeddings generados | OK | knowledge_base/processed/faiss_index/embeddings.npy |
| Preguntas base creadas | OK | knowledge_base/eval/questions_daniel.jsonl |
| Pruebas de recuperación guardadas | OK | docs/evidencias/retrieval_*.txt |

## Pruebas rápidas de recuperación

| Pregunta | Resultado esperado | Estado |
|---|---|---|
| Qué es EDIFICA y a quién acompaña | Recupera chunk de EDIFICA | OK |
| Qué es NODUS | Recupera chunk de NODUS | OK |
| Qué es TOP SPEAKERS | Recupera chunk de TOP SPEAKERS | OK |
| Cuál es la historia de Colombia Comparte | Recupera chunk de historia | OK |
| Cómo puedo contactar a Colombia Comparte | Recupera chunk de contacto | OK |

## Observaciones

- El corpus usa información pública/aprobada.
- El índice es local con FAISS.
- El siguiente paso para Felipe es conectar el retriever al endpoint `/api/chat/ask`.
- El siguiente paso de seguridad es que Silva valide rechazos ante prompt injection y preguntas fuera de alcance.

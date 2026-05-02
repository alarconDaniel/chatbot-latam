# Backend RAG - Chatbot Latinoamérica Comparte

## Resumen

Backend en FastAPI para un chatbot RAG sobre Latinoamérica Comparte.

Incluye:

- Recuperación semántica con FAISS + `sentence-transformers`
- Generación con Groq
- Guardrails contra prompt injection y abuso
- Cifrado híbrido de transporte con clave pública/clave efímera
- Selección automática de dispositivo para embeddings: GPU si existe, CPU si no

## Stack

- Python 3.13
- FastAPI
- FAISS
- SentenceTransformers
- Groq API
- Pydantic Settings
- cryptography

## Estructura clave

```text
backend/
├── app/
│   ├── api/routes.py
│   ├── core/config.py
│   ├── core/logging.py
│   ├── schemas/chat.py
│   ├── services/
│   │   ├── guardrails.py
│   │   ├── model_client.py
│   │   ├── rag_service.py
│   │   └── retriever.py
│   └── utils/encryption.py
├── .env
├── .env.example
├── requirements.txt
└── README.md
```

## Inicio rápido

### 1. Crear entorno

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configurar `.env`

```ini
GROQ_API_KEY=tu_clave_real
GROQ_MODEL=llama-3.1-8b-instant
INDEX_PATH=../knowledge_base/processed/faiss_index
CORPUS_PATH=../knowledge_base/processed/rag_chunks.jsonl
TOP_K=4
MAX_MESSAGE_LENGTH=500
PORT=8000
ALLOWED_ORIGINS=["http://localhost:3000"]
LOG_LEVEL_STR=INFO
LOG_TO_CONSOLE=false
EMBEDDING_DEVICE=auto
```

### 3. Ejecutar

```bash
python -m uvicorn app.main:app --reload --port 8000
```

## Dispositivo de embeddings

El retriever elige el dispositivo automáticamente si `EMBEDDING_DEVICE=auto`:

1. `cuda` si hay GPU NVIDIA disponible
2. `mps` si está disponible en Apple Silicon
3. `cpu` como respaldo

Si quieres forzarlo, cambia el valor en `.env` a `cuda`, `cpu` o `mps`.

## Endpoints

### `GET /api/chat/health`

Devuelve el estado del servicio.

### `GET /api/chat/crypto/public-key`

Devuelve la clave pública usada para proteger la clave AES efímera del frontend.

### `GET /api/chat/crypto/public-key-meta`

Devuelve un JSON con la clave pública (`pem`) y un identificador `kid` (SHA256 hex) útil para comprobaciones de rotación de claves. Este endpoint es opcional y no rompe clientes existentes.

### `POST /api/chat/ask`

Recibe un payload cifrado y devuelve la respuesta cifrada.

## Flujo del chat

1. El frontend obtiene la clave pública del backend.
2. El frontend genera una clave AES efímera por request.
3. La clave efímera se protege con RSA-OAEP.
4. El mensaje se cifra con AES-256-GCM.
5. El backend desencripta, recupera contexto FAISS y llama a Groq.
6. La respuesta vuelve cifrada con la misma clave efímera.

## Seguridad y guardrails

- Se bloquean patrones de prompt injection.
- Se detecta abuso directo y el bot responde con un límite respetuoso.
- Si no hay contexto suficiente, el bot ofrece alternativas de búsqueda.
- La clave privada nunca sale del backend.

## Logging

- `LOG_LEVEL_STR=DEBUG|INFO|WARNING|ERROR`
- `LOG_TO_CONSOLE=false` para producción local con archivo
- Los logs se escriben en `backend/logs/`

## Variables importantes

- `GROQ_API_KEY`: clave de Groq
- `GROQ_MODEL`: modelo LLM
- `INDEX_PATH`: ruta al índice FAISS
- `CORPUS_PATH`: ruta al corpus procesado
- `TOP_K`: cantidad de chunks recuperados
- `MAX_MESSAGE_LENGTH`: límite de entrada
- `PORT`: puerto del backend
- `ALLOWED_ORIGINS`: CORS
- `EMBEDDING_DEVICE`: `auto`, `cuda`, `cpu`, `mps`

## Testing básico

### Health

```bash
curl http://localhost:8000/api/chat/health
```

### Lint/sintaxis rápida

```bash
python -m py_compile app/core/config.py app/services/retriever.py app/services/rag_service.py
```

### Verificar clave pública

```bash
python -c "from app.utils.encryption import get_server_public_key_pem; print(get_server_public_key_pem().splitlines()[0])"
```

## Notas

- El frontend no necesita una variable de secreto compartido.
- `EMBEDDING_DEVICE=auto` es el valor recomendado.
- Este backend está pensado para funcionar junto con el widget Vite del repo.

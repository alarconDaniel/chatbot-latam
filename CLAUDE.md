# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (FastAPI)

```bash
# Development server — run from repo root
cd backend && python -m uvicorn app.main:app --reload --port 8000

# Syntax check all modules
cd backend && python -m py_compile \
  app/main.py app/core/config.py app/api/routes.py \
  app/services/rag_service.py app/services/retriever.py \
  app/services/model_client.py app/services/guardrails.py \
  app/utils/encryption.py

# Run tests
cd backend && python test.py

# Health check (backend must be running)
curl http://localhost:8000/api/chat/health
```

### Frontend (React + Vite)

```bash
cd widget
npm install        # first time only
npm run dev        # dev server → http://localhost:3000
npm run build      # production bundle (reads widget/.env.production)
```

### Docker (local)

```bash
cp .env.example .env          # fill in GROQ_API_KEY
docker compose up --build     # build + start both services
docker compose up             # start without rebuilding
docker compose down           # stop and remove containers
docker compose logs -f        # tail all logs
```

### Rebuild knowledge base index

```bash
# Run from repo root
python scripts/build_faiss_semantic_index.py
python scripts/build_chunks_and_index.py
```

## Architecture

Two independent services communicate only via HTTP:

- **Backend** (`backend/`) — FastAPI + Python 3.13, port 8000
- **Frontend** (`widget/`) — React + Vite, port 3000 (dev) / 80 (Docker via Nginx)

### Request flow — POST /api/chat/ask

```
Browser
  → GET /api/chat/crypto/public-key   (RSA public key)
  → POST /api/chat/ask                (RSA-OAEP encrypted session key + AES-256-GCM payload)
  ← encrypted response (same AES session key)
```

1. Frontend fetches the backend RSA public key on first call.
2. Per request: frontend generates a random AES-256 session key, encrypts it with RSA-OAEP, encrypts the JSON payload with AES-256-GCM (random 12-byte IV).
3. Backend decrypts the session key, decrypts payload, runs guardrails.
4. `RAGService.ask()` → `Retriever.retrieve()` (FAISS top-K) → `ModelClient.generate()` (Groq API).
5. Backend re-encrypts the response with the same AES session key.

The RSA key pair is generated **in memory** at startup (`utils/encryption.py`). It is not persisted and rotates on every restart. There is no shared secret in the frontend bundle.

### Singleton services

Three singletons are lazy-loaded on the first request:

| Singleton | Loaded by | Cost |
|---|---|---|
| `Retriever` | `get_retriever()` | FAISS index + embedding model (~30–60 s cold) |
| `ModelClient` | `get_model_client()` | Groq client init |
| `RAGService` | `get_rag_service()` | holds the two above |

Cold container startup is slow because the embedding model (`paraphrase-multilingual-MiniLM-L12-v2`, ~470 MB) loads into memory on the first `/ask` call.

### Knowledge base paths

| Asset | Default (local) | Docker container |
|---|---|---|
| FAISS index | `../knowledge_base/processed/faiss_index/` | `/app/knowledge_base/processed/faiss_index/` |
| Corpus JSONL | `../knowledge_base/processed/rag_chunks.jsonl` | `/app/knowledge_base/processed/rag_chunks.jsonl` |

Paths are relative to where `uvicorn` runs (`backend/`). In Docker they are set as absolute `ENV` vars in `backend/Dockerfile`.

### Guardrails (`services/guardrails.py`)

Runs before the RAG pipeline on every message:
- Regex injection detection (ES + EN keyword patterns) → raises `ValueError`, returns HTTP 400.
- Regex rudeness detection → returns a polite refusal without calling the LLM.

### Configuration (`core/config.py`)

All settings are in `Settings(BaseSettings)` loaded via pydantic-settings. Environment variables override `.env` file values. Only `GROQ_API_KEY` is required; everything else has defaults. See `backend/.env.example` for the complete list.

## CI/CD

Workflow: `.github/workflows/ci.yml`

- **Triggers**: every push (all branches) and PRs to `main`/`develop`.
- **CI jobs**: `test-backend` → `build-backend-image` and `build-frontend` → `build-frontend-image`.
- **CD job**: present but fully commented out. Uncomment and add GitHub secrets to activate. Templates for AWS ECS and Azure Container Apps are included in the comments.
- In CI, `DOWNLOAD_MODEL=false` is passed to the backend Dockerfile to skip the 470 MB model download and keep builds fast. The model is downloaded on first container run instead.

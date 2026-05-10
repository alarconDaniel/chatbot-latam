FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (cache layer)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download embedding model so the container starts fast
# Set DOWNLOAD_MODEL=false in CI to skip this step and save time
ARG DOWNLOAD_MODEL=true
RUN if [ "$DOWNLOAD_MODEL" = "true" ]; then \
    python -c "from sentence_transformers import SentenceTransformer; \
    SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')"; \
fi

# Copy application code
COPY backend/ ./backend/

# Copy knowledge base (FAISS index + corpus) — self-contained image
COPY knowledge_base/processed/ ./knowledge_base/processed/

# Paths inside the container
ENV INDEX_PATH=/app/knowledge_base/processed/faiss_index
ENV CORPUS_PATH=/app/knowledge_base/processed/rag_chunks.jsonl
ENV PORT=8000
ENV LOG_TO_CONSOLE=true
ENV EMBEDDING_DEVICE=cpu

WORKDIR /app/backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8000/api/chat/health || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

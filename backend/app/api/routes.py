from fastapi import APIRouter, Depends
from app.schemas.chat import AskRequest, AskResponse, HealthResponse
from app.services.rag_service import get_rag_service, RAGService

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="ok")


@router.post("/ask", response_model=AskResponse)
async def ask(
    request: AskRequest, rag_service: RAGService = Depends(get_rag_service)
) -> AskResponse:
    """Answer user question using RAG pipeline."""
    return rag_service.ask(request)


@router.post("/reindex")
async def reindex() -> dict:
    """Reindex FAISS from corpus (local/admin use only)."""
    return {"status": "not implemented"}

from fastapi import APIRouter, Depends
from app.schemas.chat import AskRequest, AskResponse, HealthResponse
from app.services.rag_service import get_rag_service, RAGService
from app.core.logging import get_logger
import logging

logger = get_logger()

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    logger.debug("🏥 Health check requested")
    return HealthResponse(status="ok")


@router.post("/ask", response_model=AskResponse)
async def ask(
    request: AskRequest, rag_service: RAGService = Depends(get_rag_service)
) -> AskResponse:
    """Answer user question using RAG pipeline."""
    logger.info(f"📨 /ask endpoint called - session: {request.sessionId}")
    response = rag_service.ask(request)
    logger.info(f"📤 Response sent - safeMode: {response.safeMode}")
    return response


@router.post("/reindex")
async def reindex() -> dict:
    """Reindex FAISS from corpus (local/admin use only)."""
    logger.warning("⚠️ /reindex endpoint called (not implemented)")
    return {"status": "not implemented"}

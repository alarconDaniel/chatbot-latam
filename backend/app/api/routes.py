from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chat import (
    AskRequest,
    AskResponse,
    HealthResponse,
    EncryptedRequest,
    EncryptedResponse,
    EncryptedPayload,
)
from app.services.rag_service import get_rag_service, RAGService
from app.utils.encryption import encrypt_payload, decrypt_payload
from app.core.config import settings
from app.core.logging import get_logger
import logging

logger = get_logger()

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    logger.debug("Health check requested")
    return HealthResponse(status="ok")


@router.post("/ask", response_model=EncryptedResponse)
async def ask(
    request: EncryptedRequest, rag_service: RAGService = Depends(get_rag_service)
) -> EncryptedResponse:
    """Answer user question using RAG pipeline (encrypted)."""
    try:
        # Desencriptar request
        decrypted_data = decrypt_payload(
            {
                "iv": request.encrypted.iv,
                "ciphertext": request.encrypted.ciphertext,
            },
            settings.encryption_secret,
        )

        # Crear AskRequest a partir de datos desencriptados
        ask_request = AskRequest(**decrypted_data)

        logger.info(f"/ask endpoint called - session: {ask_request.sessionId}")

        # Procesar con RAG service
        response: AskResponse = rag_service.ask(ask_request)
        logger.info(f"Response generated - safeMode: {response.safeMode}")

        # Encriptar response
        encrypted_response = encrypt_payload(
            response.dict(), settings.encryption_secret
        )

        logger.info("Response encrypted successfully")

        return EncryptedResponse(
            encrypted=EncryptedPayload(
                iv=encrypted_response["iv"],
                ciphertext=encrypted_response["ciphertext"],
            )
        )
    except ValueError as e:
        logger.error(f"Decryption error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Encryption error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in /ask: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/reindex")
async def reindex() -> dict:
    """Reindex FAISS from corpus (local/admin use only)."""
    logger.warning("/reindex endpoint called (not implemented)")
    return {"status": "not implemented"}

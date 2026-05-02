from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chat import (
    AskRequest,
    AskResponse,
    HealthResponse,
    EncryptedRequest,
    EncryptedResponse,
    EncryptedPayload,
    PublicKeyResponse,
)
from app.services.rag_service import get_rag_service, RAGService
from app.utils.encryption import (
    encrypt_payload,
    decrypt_payload,
    decrypt_session_key,
    get_server_public_key_pem,
    get_server_public_key_meta,
)
from app.core.logging import get_logger

logger = get_logger()

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/crypto/public-key", response_model=PublicKeyResponse)
async def get_public_key() -> PublicKeyResponse:
    """Expose the backend public key used to protect per-request session keys."""

    return PublicKeyResponse(publicKey=get_server_public_key_pem())


@router.get("/crypto/public-key-meta")
async def get_public_key_meta() -> dict:
    """Non-breaking JSON endpoint that returns PEM + key id (`kid`).

    This endpoint is additive: existing clients can keep calling
    `/crypto/public-key` (plain PEM). Newer clients can query this
    endpoint to obtain a `kid` useful for key rotation checks.
    """
    return get_server_public_key_meta()


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
        # Desencriptar la clave de sesión y luego el payload de negocio
        session_key = decrypt_session_key(request.encrypted.encryptedKey)
        decrypted_data = decrypt_payload(
            {
                "iv": request.encrypted.iv,
                "ciphertext": request.encrypted.ciphertext,
            },
            session_key,
        )

        # Crear AskRequest a partir de datos desencriptados
        ask_request = AskRequest(**decrypted_data)

        logger.info(f"/ask endpoint called - session: {ask_request.sessionId}")

        # Procesar con RAG service
        response: AskResponse = rag_service.ask(ask_request)
        logger.info(f"Response generated - safeMode: {response.safeMode}")

        # Encriptar response
        encrypted_response = encrypt_payload(response.dict(), session_key)

        logger.info("Response encrypted successfully")

        return EncryptedResponse(
            encrypted=EncryptedPayload(
                encryptedKey=request.encrypted.encryptedKey,
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

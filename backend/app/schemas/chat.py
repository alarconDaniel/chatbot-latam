from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class AskRequest(BaseModel):
    """User question payload."""

    message: str
    country: str
    sessionId: str


class AskResponse(BaseModel):
    """Answer payload with sources and safety info."""

    answer: str
    sources: List[Dict[str, Any]]
    suggestedLinks: List[str]
    safeMode: bool


class EncryptedPayload(BaseModel):
    """Encrypted payload structure."""

    encryptedKey: str  # base64 encoded RSA-OAEP encrypted session key
    iv: str  # base64 encoded IV
    ciphertext: str  # base64 encoded ciphertext


class EncryptedRequest(BaseModel):
    """Encrypted request payload."""

    encrypted: EncryptedPayload


class EncryptedResponse(BaseModel):
    """Encrypted response payload."""

    encrypted: EncryptedPayload


class PublicKeyResponse(BaseModel):
    """Backend public key used by the frontend to encrypt session keys."""

    publicKey: str


class PublicKeyMeta(BaseModel):
    """Metadata about the backend public key."""

    pem: str
    kid: str


class HealthResponse(BaseModel):
    """Health check response."""

    status: str

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

    iv: str  # base64 encoded IV
    ciphertext: str  # base64 encoded ciphertext


class EncryptedRequest(BaseModel):
    """Encrypted request payload."""

    encrypted: EncryptedPayload


class EncryptedResponse(BaseModel):
    """Encrypted response payload."""

    encrypted: EncryptedPayload


class HealthResponse(BaseModel):
    """Health check response."""

    status: str

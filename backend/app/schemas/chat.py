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


class HealthResponse(BaseModel):
    """Health check response."""

    status: str

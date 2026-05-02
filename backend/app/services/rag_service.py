from typing import List, Dict, Any, Optional
from app.schemas.chat import AskRequest, AskResponse
from app.services.guardrails import sanitize_input, filter_output
from app.services.retriever import get_retriever
from app.services.model_client import get_model_client, SYSTEM_PROMPT
import logging

logger = logging.getLogger(__name__)


class RAGService:
    """Orchestrates RAG pipeline: retrieve, generate, filter."""

    def __init__(self):
        self.retriever = get_retriever()
        self.model_client = get_model_client()

    def ask(self, request: AskRequest) -> AskResponse:
        """Main RAG pipeline: sanitize → retrieve → generate → filter → response."""
        try:
            cleaned_message = self._validate_input(request.message)
            if cleaned_message is None:
                return self._respectful_boundary_response()

            chunks = self._retrieve_context(cleaned_message, request.country)
            answer = self._generate_answer(chunks, cleaned_message)
            return self._build_success_response(answer, chunks)
        except ValueError as e:
            logger.warning(f"Validation error - session: {request.sessionId}: {str(e)}")
            return self._error_response(str(e), safe_mode=False)
        except Exception as e:
            logger.error(f"RAG pipeline error - session: {request.sessionId}: {str(e)}", exc_info=True)
            return self._error_response("Ocurrió un error procesando tu pregunta. Por favor, intenta de nuevo.", safe_mode=False)

    def _validate_input(self, message: str) -> Optional[str]:
        """Check for injections and return cleaned message."""
        logger.debug(f"Validating input: '{message[:50]}...'")
        cleaned_message, is_injection, is_rude = sanitize_input(message)

        if is_injection:
            logger.warning("Injection attempt detected")
            raise ValueError("Injection pattern detected")

        if is_rude:
            logger.warning("Rude user input detected")
            return None

        return cleaned_message

    def _retrieve_context(self, query: str, country: str) -> List[Dict[str, Any]]:
        """Retrieve relevant chunks from FAISS index."""
        logger.debug(f"Retrieving chunks for: '{query[:50]}...' (country: {country})")
        chunks = self.retriever.retrieve(query=query, country=country)

        if not chunks:
            logger.warning(f"No relevant chunks found for query")
            raise ValueError("No relevant chunks found")

        logger.info(f"Retrieved {len(chunks)} chunks")
        return chunks

    def _generate_answer(self, chunks: List[Dict[str, Any]], query: str) -> str:
        """Build prompt and generate answer from LLM."""
        logger.debug(f"Building context from {len(chunks)} chunks")

        context_parts = [f"- {c.get('title', '')}\n{c.get('text', '')}" for c in chunks]
        context = "\n\n".join(context_parts)
        full_prompt = SYSTEM_PROMPT.format(context=context)
        full_prompt += f"\n\nPregunta del usuario: {query}"

        logger.debug(f"Calling LLM with prompt: {len(full_prompt)} chars")
        answer = self.model_client.generate(full_prompt)

        logger.info(f"Generated answer: {len(answer)} chars")
        return answer

    def _respectful_boundary_response(self) -> AskResponse:
        """Reply with a calm boundary when the user is rude."""

        return AskResponse(
            answer=(
                "No continuaré esta conversación si el trato no es respetuoso. "
                "Si quieres seguir, reformula tu pregunta con amabilidad y con gusto te ayudo."
            ),
            sources=[],
            suggestedLinks=[],
            safeMode=True,
        )

    def _build_success_response(self, answer: str, chunks: List[Dict[str, Any]]) -> AskResponse:
        """Construct successful response with sources and links."""
        filtered_answer = filter_output(answer)
        sources = self._extract_sources(chunks)
        links = self._collect_suggested_links(chunks)

        logger.info(f"Response ready - sources: {len(sources)}, links: {len(links)}")

        return AskResponse(
            answer=filtered_answer,
            sources=sources,
            suggestedLinks=links,
            safeMode=False,
        )

    def _extract_sources(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """Extract metadata from chunks for response."""
        return [
            {
                "chunk_id": chunk.get("chunk_id"),
                "title": chunk.get("title"),
                "section": chunk.get("section"),
                "country": chunk.get("country"),
            }
            for chunk in chunks
        ]

    def _collect_suggested_links(self, chunks: List[Dict[str, Any]]) -> List[str]:
        """Deduplicate suggested links from all chunks."""
        return list({
            link for chunk in chunks
            for link in chunk.get("suggested_links", [])
        })

    def _error_response(self, message: str, safe_mode: bool = True) -> AskResponse:
        """Build error response."""
        return AskResponse(
            answer=message if not safe_mode else (
                "No encontré información suficiente para responder con precisión. "
                "Puedo ayudarte si consultas sobre admisión, certificación, convivencia, contacto o programas del portal."
            ),
            sources=[],
            suggestedLinks=[],
            safeMode=safe_mode,
        )


# Singleton instance
_rag_service = None


def get_rag_service() -> RAGService:
    """Lazy-load RAG service (dependency injection)."""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service


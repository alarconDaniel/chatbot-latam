from typing import List, Dict, Any
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
        """
        Main RAG pipeline:
        1. Sanitize input
        2. Retrieve chunks
        3. Build prompt
        4. Generate answer
        5. Filter output
        """
        logger.debug(f"📥 New request - session: {request.sessionId}, country: {request.country}")

        # Step 1: Sanitize input
        cleaned_message, is_injection = sanitize_input(request.message)

        if is_injection:
            logger.warning(f"🚨 Injection attempt detected - session: {request.sessionId}")
            return AskResponse(
                answer="No puedo procesar esa solicitud. Por favor, hazme una pregunta sobre los portales de Latinoamérica Comparte.",
                sources=[],
                suggestedLinks=[],
                safeMode=True,
            )

        try:
            logger.debug(f"🔍 Retrieving chunks for: '{cleaned_message[:50]}...'")

            # Step 2: Retrieve chunks
            chunks = self.retriever.retrieve(
                query=cleaned_message, country=request.country
            )

            logger.info(f"✅ Retrieved {len(chunks)} chunks - session: {request.sessionId}")

            if not chunks:
                logger.warning(f"⚠️ No relevant chunks found - session: {request.sessionId}")
                return AskResponse(
                    answer="No cuento con información suficiente sobre eso. Te invito a contactarnos directamente en nuestro portal.",
                    sources=[],
                    suggestedLinks=[],
                    safeMode=False,
                )

            logger.debug(f"📚 Context built with {len(chunks)} chunks")

            # Step 3: Build context
            context_parts = []
            for chunk in chunks:
                context_parts.append(f"- {chunk.get('title', '')}\n{chunk.get('text', '')}")

            context = "\n\n".join(context_parts)
            full_prompt = SYSTEM_PROMPT.format(context=context)

            # Add user message
            full_prompt += f"\n\nPregunta del usuario: {cleaned_message}"

            logger.debug(f"🤖 Calling Groq API...")

            # Step 4: Generate answer
            answer = self.model_client.generate(full_prompt)

            logger.debug(f"✨ Answer generated - length: {len(answer)} chars")

            # Step 5: Filter output
            answer = filter_output(answer)

            # Prepare sources (chunk metadata)
            sources = [
                {
                    "chunk_id": chunk.get("chunk_id"),
                    "title": chunk.get("title"),
                    "section": chunk.get("section"),
                    "country": chunk.get("country"),
                }
                for chunk in chunks
            ]

            # Collect unique suggested links
            suggested_links = []
            for chunk in chunks:
                for link in chunk.get("suggested_links", []):
                    if link not in suggested_links:
                        suggested_links.append(link)

            logger.info(f"✅ RAG pipeline complete - session: {request.sessionId}, sources: {len(sources)}, links: {len(suggested_links)}")

            return AskResponse(
                answer=answer,
                sources=sources,
                suggestedLinks=suggested_links,
                safeMode=False,
            )

        except Exception as e:
            logger.error(f"❌ Error in RAG pipeline - session: {request.sessionId}: {str(e)}", exc_info=True)
            return AskResponse(
                answer="Ocurrió un error procesando tu pregunta. Por favor, intenta de nuevo.",
                sources=[],
                suggestedLinks=[],
                safeMode=False,
            )


# Singleton instance
_rag_service = None


def get_rag_service() -> RAGService:
    """Lazy-load RAG service (dependency injection)."""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service

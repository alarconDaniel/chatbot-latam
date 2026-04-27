const DEFAULT_API_BASE_URL = "http://localhost:8000";

/**
 * Envía un mensaje al backend del chatbot.
 *
 * @param {Object} params
 * @param {string} params.message - Mensaje del usuario.
 * @param {string} params.country - País que usa el backend para filtrar contexto.
 * @param {string} params.sessionId - Identificador de sesión de chat.
 * @param {string} [params.apiBaseUrl] - URL base del backend.
 * @returns {Promise<{answer:string,sources:Array,suggestedLinks:Array,safeMode:boolean}>}
 */
export async function askChatbot({
  message,
  country,
  sessionId,
  apiBaseUrl = DEFAULT_API_BASE_URL,
}) {
  const response = await fetch(`${apiBaseUrl}/api/chat/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      country,
      sessionId,
    }),
  });

  if (!response.ok) {
    const fallbackMessage = "Error al consultar el chatbot.";

    try {
      const errorPayload = await response.json();
      throw new Error(errorPayload?.detail || fallbackMessage);
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  return response.json();
}
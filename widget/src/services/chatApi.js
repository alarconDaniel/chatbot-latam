const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Envía un mensaje al backend del chatbot.
 *
 * @param {Object} params
 * @param {string} params.message
 * @param {string} params.country
 * @param {string} params.sessionId
 * @param {string} [params.apiBaseUrl]
 * @returns {Promise<{answer:string,sources:Array,suggestedLinks:Array,safeMode:boolean}>}
 */
export async function askChatbot({
  message,
  country = "latam",
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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const fallbackMessage = "Error al consultar el chatbot.";

    if (Array.isArray(data?.detail)) {
      const readableError = data.detail
        .map((item) => item.msg)
        .filter(Boolean)
        .join(" ");

      throw new Error(readableError || fallbackMessage);
    }

    throw new Error(data?.detail || fallbackMessage);
  }

  return data;
}
import { encryptPayload, decryptPayload } from '../utils/encryption';

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

// Clave de encriptación compartida (64 caracteres hex = 32 bytes)
// Debe coincidir con ENCRYPTION_SECRET en el backend (.env)
const ENCRYPTION_SECRET = import.meta.env.REACT_APP_ENCRYPTION_SECRET ||
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

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
  try {
    // Encriptar payload
    const payload = { message, country, sessionId };
    const encrypted = await encryptPayload(payload, ENCRYPTION_SECRET);

    // Enviar request encriptado
    const response = await fetch(`${apiBaseUrl}/api/chat/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ encrypted }),
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

    // Desencriptar response
    const decrypted = await decryptPayload(data.encrypted, ENCRYPTION_SECRET);

    return decrypted;
  } catch (error) {
    console.error("Error in askChatbot:", error);
    throw error;
  }
}

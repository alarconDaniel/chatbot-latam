import { encryptPayload, decryptPayload, encryptSessionKey, generateSessionKey } from '../utils/encryption';

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

const publicKeyCache = new Map();

async function getServerPublicKey(apiBaseUrl) {
  if (publicKeyCache.has(apiBaseUrl)) {
    return publicKeyCache.get(apiBaseUrl);
  }

  const response = await fetch(`${apiBaseUrl}/api/chat/crypto/public-key`);
  if (!response.ok) {
    throw new Error("No se pudo cargar la clave pública del backend.");
  }

  const data = await response.json();
  if (!data?.publicKey) {
    throw new Error("La respuesta de clave pública es inválida.");
  }

  publicKeyCache.set(apiBaseUrl, data.publicKey);
  return data.publicKey;
}

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
    const payload = { message, country, sessionId };
    const sessionKey = generateSessionKey();
    const publicKeyPem = await getServerPublicKey(apiBaseUrl);
    const encryptedKey = await encryptSessionKey(sessionKey, publicKeyPem);
    const encryptedPayload = await encryptPayload(payload, sessionKey);

    const response = await fetch(`${apiBaseUrl}/api/chat/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        encrypted: {
          encryptedKey,
          iv: encryptedPayload.iv,
          ciphertext: encryptedPayload.ciphertext,
        },
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

    const decrypted = await decryptPayload(data.encrypted, sessionKey);

    return decrypted;
  } catch (error) {
    console.error("Error in askChatbot:", error);
    throw error;
  }
}

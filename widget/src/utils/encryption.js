/**
 * Convierte un hex string a ArrayBuffer
 */
function hexToArrayBuffer(hexString) {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Convierte un ArrayBuffer a base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convierte un base64 string a ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encripta un payload JSON usando AES-256-GCM
 * @param {Object} payload - Objeto a encriptar
 * @param {string} secretKey - Clave de encriptación (64 caracteres hex = 32 bytes)
 * @returns {Promise<Object>} { iv, ciphertext } en formato base64
 */
export async function encryptPayload(payload, secretKey) {
  try {
    // Convertir payload a JSON string
    const plaintext = JSON.stringify(payload);
    const plaintextBuffer = new TextEncoder().encode(plaintext);

    // Convertir hex key a ArrayBuffer
    const keyBuffer = hexToArrayBuffer(secretKey);

    // Importar clave
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Generar IV aleatorio (12 bytes)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encriptar
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      plaintextBuffer
    );

    return {
      iv: arrayBufferToBase64(iv),
      ciphertext: arrayBufferToBase64(ciphertext)
    };
  } catch (error) {
    console.error('Error encriptando payload:', error);
    throw new Error('Fallo en encriptación: ' + error.message);
  }
}

/**
 * Desencripta un payload encriptado con AES-256-GCM
 * @param {Object} encryptedData - { iv, ciphertext }
 * @param {string} secretKey - Clave de desencriptación (64 caracteres hex)
 * @returns {Promise<Object>} Payload desencriptado
 */
export async function decryptPayload(encryptedData, secretKey) {
  try {
    const { iv, ciphertext } = encryptedData;

    // Convertir de base64 a ArrayBuffer
    const ivBuffer = base64ToArrayBuffer(iv);
    const ciphertextBuffer = base64ToArrayBuffer(ciphertext);
    const keyBuffer = hexToArrayBuffer(secretKey);

    // Importar clave
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Desencriptar
    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      key,
      ciphertextBuffer
    );

    // Convertir a string
    const plaintext = new TextDecoder().decode(plaintextBuffer);

    // Parsear JSON
    return JSON.parse(plaintext);
  } catch (error) {
    console.error('Error desencriptando payload:', error);
    throw new Error('Fallo en desencriptación: ' + error.message);
  }
}

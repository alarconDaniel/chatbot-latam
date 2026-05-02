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
 * Convierte texto PEM a ArrayBuffer.
 */
function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '');

  return base64ToArrayBuffer(base64);
}

/**
 * Genera una clave AES efímera de 32 bytes.
 */
export function generateSessionKey() {
  return crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Importa una clave pública RSA-OAEP en formato PEM.
 */
export async function importPublicKey(publicKeyPem) {
  const keyBuffer = pemToArrayBuffer(publicKeyPem);

  return crypto.subtle.importKey(
    'spki',
    keyBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
}

/**
 * Encripta una clave AES con la clave pública del backend.
 */
export async function encryptSessionKey(sessionKey, publicKeyPem) {
  const publicKey = await importPublicKey(publicKeyPem);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    sessionKey
  );

  return arrayBufferToBase64(encryptedKey);
}

/**
 * Encripta un payload JSON usando AES-256-GCM
 * @param {Object} payload - Objeto a encriptar
 * @param {ArrayBufferView|ArrayBuffer} sessionKey - Clave AES efímera (32 bytes)
 * @returns {Promise<Object>} { iv, ciphertext } en formato base64
 */
export async function encryptPayload(payload, sessionKey) {
  try {
    const plaintext = JSON.stringify(payload);
    const plaintextBuffer = new TextEncoder().encode(plaintext);

    const keyMaterial = sessionKey instanceof ArrayBuffer ? sessionKey : sessionKey.buffer;

    const key = await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
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
 * @param {ArrayBufferView|ArrayBuffer} sessionKey - Clave AES efímera (32 bytes)
 * @returns {Promise<Object>} Payload desencriptado
 */
export async function decryptPayload(encryptedData, sessionKey) {
  try {
    const { iv, ciphertext } = encryptedData;
    const ivBuffer = base64ToArrayBuffer(iv);
    const ciphertextBuffer = base64ToArrayBuffer(ciphertext);

    const keyMaterial = sessionKey instanceof ArrayBuffer ? sessionKey : sessionKey.buffer;

    const key = await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      key,
      ciphertextBuffer
    );
    const plaintext = new TextDecoder().decode(plaintextBuffer);
    return JSON.parse(plaintext);
  } catch (error) {
    console.error('Error desencriptando payload:', error);
    throw new Error('Fallo en desencriptación: ' + error.message);
  }
}

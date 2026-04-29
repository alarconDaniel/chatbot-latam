"""
Utilidades de encriptación AES-256-GCM para peticiones API.
"""

import json
import os
from base64 import b64encode, b64decode
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes


def encrypt_payload(payload: dict, secret_key: str) -> dict:
    """
    Encripta un payload JSON usando AES-256-GCM.

    Args:
        payload: Diccionario a encriptar
        secret_key: Clave hex de 64 caracteres (32 bytes)

    Returns:
        dict con { "iv": base64, "ciphertext": base64 }
    """
    try:
        # Convertir payload a JSON
        plaintext = json.dumps(payload).encode('utf-8')

        # Convertir hex key a bytes
        key_bytes = bytes.fromhex(secret_key)

        # Generar IV aleatorio (12 bytes)
        iv = os.urandom(12)

        # Crear cipher
        cipher = AESGCM(key_bytes)

        # Encriptar (GCM no retorna tag por separado, está incluido en ciphertext)
        ciphertext = cipher.encrypt(iv, plaintext, None)

        return {
            "iv": b64encode(iv).decode('utf-8'),
            "ciphertext": b64encode(ciphertext).decode('utf-8')
        }
    except Exception as e:
        raise ValueError(f"Error encriptando payload: {str(e)}")


def decrypt_payload(encrypted_data: dict, secret_key: str) -> dict:
    """
    Desencripta un payload encriptado con AES-256-GCM.

    Args:
        encrypted_data: dict con { "iv": base64, "ciphertext": base64 }
        secret_key: Clave hex de 64 caracteres (32 bytes)

    Returns:
        dict desencriptado
    """
    try:
        # Decodificar base64
        iv = b64decode(encrypted_data["iv"])
        ciphertext = b64decode(encrypted_data["ciphertext"])

        # Convertir hex key a bytes
        key_bytes = bytes.fromhex(secret_key)

        # Crear cipher
        cipher = AESGCM(key_bytes)

        # Desencriptar (incluye validación del tag automáticamente)
        plaintext = cipher.decrypt(iv, ciphertext, None)

        # Decodificar JSON
        return json.loads(plaintext.decode('utf-8'))
    except Exception as e:
        raise ValueError(f"Error desencriptando payload: {str(e)}")

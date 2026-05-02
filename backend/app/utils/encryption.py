"""Utilidades de cifrado híbrido para peticiones API.

El frontend cifra el payload con AES-256-GCM usando una clave efímera por
petición. Esa clave se protege con la clave pública del backend usando RSA-OAEP.
De esta forma no existe un secreto reutilizable dentro del bundle del navegador.
"""

import json
import os
from base64 import b64decode, b64encode

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


_SERVER_PRIVATE_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)
_SERVER_PUBLIC_KEY_PEM = (
    _SERVER_PRIVATE_KEY.public_key()
    .public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    .decode("utf-8")
)


def get_server_public_key_pem() -> str:
    """Devuelve la clave pública del backend en formato PEM."""

    return _SERVER_PUBLIC_KEY_PEM


def get_server_public_key_meta() -> dict:
    """Devuelve metadatos de la clave pública: PEM y un `kid` (SHA256 hex).

    Retorna un dict con `pem` y `kid`. Esto permite a los clientes verificar
    versiones de clave sin romper el endpoint que ya devuelve solo el PEM.
    """
    # calcular un kid sencillo como SHA-256 sobre el PEM (hex)
    digest = hashes.Hash(hashes.SHA256())
    digest.update(_SERVER_PUBLIC_KEY_PEM.encode("utf-8"))
    kid = digest.finalize().hex()
    return {"pem": _SERVER_PUBLIC_KEY_PEM, "kid": kid}


def decrypt_session_key(encrypted_session_key: str) -> bytes:
    """Desencripta la clave AES efímera usando la clave privada del backend."""

    try:
        encrypted_key_bytes = b64decode(encrypted_session_key)
        return _SERVER_PRIVATE_KEY.decrypt(
            encrypted_key_bytes,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )
    except Exception as e:
        raise ValueError(f"Error desencriptando clave de sesión: {str(e)}")


def encrypt_payload(payload: dict, session_key: bytes) -> dict:
    """Encripta un payload JSON usando AES-256-GCM con una clave efímera."""

    try:
        plaintext = json.dumps(payload).encode("utf-8")
        iv = os.urandom(12)
        cipher = AESGCM(session_key)
        ciphertext = cipher.encrypt(iv, plaintext, None)

        return {
            "iv": b64encode(iv).decode("utf-8"),
            "ciphertext": b64encode(ciphertext).decode("utf-8"),
        }
    except Exception as e:
        raise ValueError(f"Error encriptando payload: {str(e)}")


def decrypt_payload(encrypted_data: dict, session_key: bytes) -> dict:
    """Desencripta un payload AES-256-GCM usando la clave efímera."""

    try:
        iv = b64decode(encrypted_data["iv"])
        ciphertext = b64decode(encrypted_data["ciphertext"])
        cipher = AESGCM(session_key)
        plaintext = cipher.decrypt(iv, ciphertext, None)
        return json.loads(plaintext.decode("utf-8"))
    except Exception as e:
        raise ValueError(f"Error desencriptando payload: {str(e)}")

import re
from typing import Tuple
from app.core.config import settings


# Patrones de inyección de prompt
INJECTION_PATTERNS = [
    r"ignora\s+tus\s+instrucciones",
    r"revela\s+tu\s+prompt",
    r"actúa\s+como",
    r"eres\s+ahora",
    r"system:",
    r"###",
    r"ignore\s+your\s+instructions",
    r"reveal\s+your\s+prompt",
    r"act\s+as",
    r"you\s+are\s+now",
]

# Patrones simples de abuso directo hacia el asistente
RUDENESS_PATTERNS = [
    r"\bidiota\b",
    r"\bimb[eé]cil\b",
    r"\bpendejo\b",
    r"\bh[úu]e?von\b",
    r"\bstupid\b",
    r"\bdumb\b",
    r"\bshut\s+up\b",
    r"go\s+to\s+hell",
    r"vete\s+a\s+la\s+mierda",
    r"maleducad[oa]",
]


def sanitize_input(message: str) -> Tuple[str, bool, bool]:
    """
    Limpia entrada y detecta inyecciones o abuso directo.
    Retorna: (mensaje limpio, es_inyeccion, es_desagradable)
    """
    # Validar longitud
    if len(message) > settings.max_message_length:
        return "", True, False

    # Eliminar saltos y caracteres de control inusuales
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", message)
    cleaned = cleaned.strip()

    if not cleaned:
        return "", True, False

    # Detectar patrones de inyección
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, cleaned, re.IGNORECASE):
            return cleaned, True, False

    # Detectar trato agresivo directo
    for pattern in RUDENESS_PATTERNS:
        if re.search(pattern, cleaned, re.IGNORECASE):
            return cleaned, False, True

    return cleaned, False, False


def filter_output(response: str) -> str:
    """Valida que salida no esté vacía."""
    if not response or not response.strip():
        return "No cuento con información suficiente sobre eso. Te invito a contactarnos directamente en nuestro portal."
    return response.strip()

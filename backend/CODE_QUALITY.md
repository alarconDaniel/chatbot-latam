# CODE QUALITY STANDARDS - Chatbot RAG Backend

## 📋 Propósito

Este documento define los estándares de calidad de código aplicados en el backend del Chatbot RAG para Latinoamérica Comparte. Establece patrones, principios y mejores prácticas obligatorias.

**Versión:** 1.0
**Última actualización:** 2026-04-25
**Responsable:** Backend Team

---

## 🏗️ PRINCIPIOS ARQUITECTÓNICOS

### 1. Separation of Concerns (SoC)

Cada módulo debe tener una responsabilidad única y bien definida.

**Estructura de capas:**

```
api/         → HTTP layer (request/response)
services/    → Business logic (no framework dependencies)
schemas/     → Data models (validation)
core/        → Infrastructure (config, logging)
```

**Regla:** Código de `services/` NO debe importar de `api/`. Las capas superiores dependen de las inferiores, nunca al revés.

### 2. Dependency Injection

**Correcto:** ❌ Evitar

```python
# Tightly coupled - imposible mockear
class RAGService:
    def __init__(self):
        self.retriever = Retriever()  # Instancia directa
```

**Correcto:** ✅ Preferir

```python
# Loose coupling - testeable
class RAGService:
    def __init__(self, retriever: RetrievalInterface = Depends(get_retriever)):
        self.retriever = retriever  # Inyectado
```

### 3. Single Responsibility Principle (SRP)

**Incorrecto:** ❌

```python
def ask(request):
    # Valida entrada
    # Recupera chunks
    # Genera respuesta
    # Construye output
    # Formatea links
    # Retorna JSON
    # (97 líneas) ❌
```

**Correcto:** ✅

```python
def ask(request):
    cleaned = self._validate(request.message)
    chunks = self._retrieve(cleaned, request.country)
    answer = self._generate(chunks, cleaned)
    return self._build_response(answer, chunks)
```

---

## 📝 ESTÁNDARES DE CÓDIGO

### Convenciones de Nombres

| Elemento  | Patrón      | Ejemplo                         |
| --------- | ----------- | ------------------------------- |
| Variable  | snake_case  | `user_message`, `top_k`         |
| Función   | snake_case  | `sanitize_input()`              |
| Clase     | PascalCase  | `RAGService`, `ModelClient`     |
| Constante | UPPER_SNAKE | `MAX_MESSAGE_LENGTH`, `LOG_DIR` |
| Privado   | \_prefix    | `_validate_input()`             |
| Protegido | \_prefix    | `_internal_state`               |

### Type Hints - OBLIGATORIO

**Todos** los parámetros y retornos deben tener tipos.

❌ **Incorrecto:**

```python
def retrieve(query, top_k=None):
    return chunks
```

✅ **Correcto:**

```python
from typing import List, Dict, Any

def retrieve(self, query: str, top_k: int = None) -> List[Dict[str, Any]]:
    return chunks
```

✅ **Mejor (usar TypedDict):**

```python
from typing import TypedDict

class ChunkData(TypedDict):
    chunk_id: str
    title: str
    text: str
    country: str

def retrieve(self, query: str, top_k: int = None) -> List[ChunkData]:
    return chunks
```

### Docstrings - Obligatorio en funciones públicas

Usar formato Google:

```python
def retrieve(self, query: str, country: str, top_k: int = None) -> List[Dict]:
    """Retrieve relevant chunks from FAISS index.

    Args:
        query: User message to search for similar chunks
        country: Filter by country code (e.g., 'mx', 'latam')
        top_k: Number of chunks to return. Defaults to settings.top_k

    Returns:
        List of chunk dictionaries containing text and metadata

    Raises:
        ValueError: If query is empty or top_k is invalid
        FileNotFoundError: If FAISS index cannot be loaded
    """
```

### Funciones - Máximo 30 líneas

Si superas 30 líneas, descompón en métodos privados.

```python
# ❌ Malo (97 líneas)
def ask(request):
    # ... todo aquí

# ✅ Bien (15 líneas)
def ask(request):
    cleaned = self._validate(request.message)
    chunks = self._retrieve(cleaned, request.country)
    answer = self._generate(chunks)
    return self._build_response(answer, chunks)
```

### Manejo de Errores - Específico, no genérico

❌ **Incorrecto:**

```python
try:
    result = some_operation()
except Exception as e:  # Demasiado genérico
    logger.error(f"Error: {e}")
    return None
```

✅ **Correcto:**

```python
try:
    result = some_operation()
except ValueError as e:
    logger.error(f"Invalid input: {e}")
    raise ValueError(f"Cannot process: {e}")
except FileNotFoundError as e:
    logger.error(f"Index not found: {e}")
    raise RuntimeError("FAISS index unavailable")
except Exception as e:  # Último recurso
    logger.error(f"Unexpected error: {e}", exc_info=True)
    raise
```

### Logging - Niveles y Consistencia

**DEBUG** - Detalles de cada paso (desarrollo):

```python
logger.debug(f"Encoding query: '{query[:40]}...'")
```

**INFO** - Eventos importantes (producción):

```python
logger.info(f"Retrieved {len(chunks)} chunks")
```

**WARNING** - Anomalías sin error:

```python
logger.warning("Injection attempt detected")
```

**ERROR** - Errores con contexto:

```python
logger.error(f"API timeout after 30s", exc_info=True)
```

**Regla:** NO usar emojis, ej. ❌ `logger.info("✅ Success")`

---

## 🧪 TESTABILIDAD

### Inyección de Dependencias

Para que el código sea testeable, TODAS las dependencias externas deben ser inyectables.

**Testeable:**

```python
class RAGService:
    def __init__(self, retriever: RetrievalInterface, llm: LLMInterface):
        self.retriever = retriever
        self.llm = llm

# En tests:
from unittest.mock import Mock
mock_retriever = Mock(spec=RetrievalInterface)
mock_llm = Mock(spec=LLMInterface)
service = RAGService(mock_retriever, mock_llm)
```

**No testeable:**

```python
class RAGService:
    def __init__(self):
        self.retriever = Retriever()  # ❌ Imposible mockear
        self.llm = ModelClient()       # ❌ Imposible mockear
```

### Evitar Singletons Globales

```python
# ❌ Evitar
_instance = None
def get_service():
    global _instance  # Estado mutable global
    if _instance is None:
        _instance = Service()
    return _instance

# ✅ Usar FastAPI Depends
def get_service() -> Service:
    return Service()

@router.post("/ask")
async def ask(service: Service = Depends(get_service)):
    return service.ask(request)
```

---

## 📦 ESTRUCTURA DE MÓDULOS

### Reglas de importación

1. **Orden:** stdlib → third-party → local
2. **No importar de capas superiores:** `services/` NO importa de `api/`
3. **Usar importes relativos en mismo paquete:**

```python
# ✅ Bien
from app.core.config import settings
from app.schemas.chat import AskRequest
from .guardrails import sanitize_input

# ❌ Evitar
from ..api.routes import router
```

### Archivo `__init__.py`

Cada paquete debe tener `__init__.py` (puede estar vacío):

```
app/
├── __init__.py
├── core/
│   ├── __init__.py
│   ├── config.py
│   └── logging.py
└── services/
    ├── __init__.py
    └── retriever.py
```

---

## 🔒 SEGURIDAD

### Input Validation

Validar SIEMPRE en los límites del sistema (endpoints, APIs externas).

```python
from pydantic import Field

class AskRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    country: str = Field(..., pattern="^[a-z]{2}|latam$")
    sessionId: str = Field(..., description="Unique session identifier")
```

### Secrets Management

- ✅ Guardar en `.env` (gitignored)
- ✅ Leer via `pydantic-settings`
- ❌ Nunca hardcodear keys
- ❌ Nunca commitear `.env`

```python
# ✅ Bien
class Settings(BaseSettings):
    groq_api_key: str  # Desde .env

# ❌ Mal
GROQ_KEY = "sk-xxxx-hardcodeado"
```

### CORS Configuration

Especificar métodos y headers permitidos (no `["*"]`):

```python
# ✅ Seguro
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["GET", "POST"],  # Solo necesarios
    allow_headers=["Content-Type"],
)

# ❌ Inseguro
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 MÉTRICAS DE CALIDAD

### Complejidad Ciclomática

**Máximo 10 líneas de lógica compleja:**

- Si está > 10, refactor en funciones más pequeñas
- Usar herramientas: `radon`, `pylint`

### Cobertura de Tests

- **Objetivo:** ≥ 80% de cobertura
- **Verificar:** `coverage run -m pytest && coverage report`

### Deuda Técnica

Mantener backlog de TODOs técnicos en el repo:

```python
# TODO: Agregar caching de embeddings (2026-05-01)
# Ticket: https://github.com/...
def retrieve(self, query: str) -> List:
```

---

## ✅ CHECKLIST PRE-COMMIT

```
☐ Todos los parámetros typed (sin Any innecesario)
☐ Docstrings en funciones públicas
☐ Funciones < 30 líneas
☐ Sin logging con emojis
☐ Excepciones específicas (no Exception)
☐ Imports ordenados (stdlib → 3rd party → local)
☐ Nombres claros snakecase/PascalCase
☐ Sin código duplicado (DRY)
☐ Tests para lógica nueva
☐ Secrets en .env, no hardcodeados
```

### Validar con:

```bash
# Linting
pylint app/
ruff check app/

# Type checking
mypy app/

# Tests
pytest --cov=app/

# Formateo
black app/ --check
```

---

## 🔄 PROCESO DE REVISIÓN

1. **Autovalidación:** Ejecutar checklist arriba
2. **Linting:** Pasar `ruff` y `pylint`
3. **Tests:** ≥ 80% cobertura
4. **CR (Code Review):** Validar arquitectura + SOLID
5. **Merge:** Solo después de de aprobación

---

## 📚 REFERENCIAS

- **PEP 8:** https://pep8.org/
- **Clean Code:** Robert C. Martin
- **SOLID:** https://en.wikipedia.org/wiki/SOLID
- **Python Style:** https://google.github.io/styleguide/pyguide.html

---

## 📞 Preguntas Frecuentes

**P: ¿Puedo usar `List[Dict[str, Any]]`?**
A: Solo si es realmente genérico. Preferir `TypedDict` para documentar estructura.

**P: ¿Qué nivel de logging en producción?**
A: `INFO` o `WARNING`. `DEBUG` solo en desarrollo.

**P: ¿Cómo hacemos singletons thread-safe?**
A: Usar FastAPI Lifespan o Depends pattern, NO globals.

**P: ¿Debo escribir docstring en funciones privadas?**
A: Solo si es compleja (>15 líneas). Nombres claros + código limpio suele ser suficiente.

---

**Versión:** 1.0
**Próxima revisión:** 2026-06-01
**Contribuyentes:** Felipe, Daniel, Silva

# Encriptación End-to-End de Peticiones API

## Descripción

Todo el contenido JSON intercambiado entre el cliente (frontend) y servidor (backend) está encriptado usando **AES-256-GCM**, protegiendo:

- Mensajes del usuario
- Respuestas del chatbot
- Metadatos (sesiones, país)
- Fuentes de información

Esto previene que la información sensible sea visible en:

- Inspector de DevTools del navegador
- Proxies HTTP no autorizadas
- Logs de tráfico

## Arquitectura

```
Cliente (React)                          Servidor (FastAPI)
    ↓                                         ↑
[{ message, country, sessionId }]
    ↓ (encripta con AES-256-GCM)
[{ iv, ciphertext }] ←─ HTTP POST ─→ (desencripta)
    ↓                                    (procesa RAG)
                                    (encripta respuesta)
    ↓ ←─ HTTP Response ─→ [{ iv, ciphertext }]
(desencripta)
[{ answer, sources, suggestedLinks, safeMode }]
```

## Configuración

### 1. Generar Clave Compartida

```bash
openssl rand -hex 32
```

Ejemplo de salida:

```
bd30427cee9ba319459b690b9d7d6dc24963862c2ab616030b31bddb54e7c3cd
```

### 2. Backend Setup

Agregar a `.env`:

```ini
ENCRYPTION_SECRET=bd30427cee9ba319459b690b9d7d6dc24963862c2ab616030b31bddb54e7c3cd
```

**Validar instalación:**

```bash
pip install -r requirements.txt  # incluye: cryptography
python -c "from app.utils.encryption import encrypt_payload, decrypt_payload; print('OK')"
```

### 3. Frontend Setup

Agregar a `widget/.env`:

```ini
REACT_APP_ENCRYPTION_SECRET=bd30427cee9ba319459b690b9d7d6dc24963862c2ab616030b31bddb54e7c3cd
```

**Validar:**

```bash
cd widget
npm run build  # Debe compilar sin errores
```

## Cómo Funciona

### Encriptación (Frontend → Backend)

```javascript
// widget/src/services/chatApi.js
import { encryptPayload, decryptPayload } from "../utils/encryption";

const plaintext = { message, country, sessionId };
const encrypted = await encryptPayload(plaintext, ENCRYPTION_SECRET);

// Enviar:
// { encrypted: { iv: "...", ciphertext: "..." } }
```

**Detalles técnicos:**

- IV: 12 bytes aleatorios (base64)
- Cipher: AES-256-GCM
- Output: base64 encoded ciphertext (incluye tag de autenticación)

### Desencriptación (Backend → Frontend)

```python
# backend/app/api/routes.py
from app.utils.encryption import encrypt_payload, decrypt_payload

encrypted_data = request.encrypted  # { iv, ciphertext }
plaintext = decrypt_payload(encrypted_data, settings.encryption_secret)

# GCM verifica automáticamente que los datos no fueron manipulados
```

## Seguridad

### ✓ Proporciona

- **Confidencialidad**: AES-256 (128-bit vs 256-bit keys)
- **Autenticidad**: GCM mode detecta manipulación
- **Uniqueness**: Nuevo IV por cada request (previene patrones)

### ⚠ No Proporciona (requiere HTTPS/TLS)

- Protección de headers HTTP
- Protección de URL/query params
- Protección contra MitM de la clave compartida

### Recomendaciones

1. **Desarrollo**: Encriptación JSON es suficiente (localhost)
2. **Producción**: Implementar HTTPS/TLS + Encriptación JSON
   - Protege la clave compartida en tránsito
   - Estándar de seguridad de capas múltiples

## Troubleshooting

### Error: "Fallo en desencriptación"

**Causa**: Clave incorrecta o datos corruptos

```bash
# Verificar que ambos lados usan la misma clave
echo $ENCRYPTION_SECRET  # Backend
cat .env | grep REACT_APP_ENCRYPTION_SECRET  # Frontend
```

### Error: "Clave de encriptación inválida"

Asegúrese que:

- Clave tiene exactamente 64 caracteres hex (32 bytes)
- No contiene espacios
- Generada con: `openssl rand -hex 32`

## Testing

### Backend

```bash
cd backend
python << 'EOF'
from app.utils.encryption import encrypt_payload, decrypt_payload

secret = "bd30427cee9ba319459b690b9d7d6dc24963862c2ab616030b31bddb54e7c3cd"
data = {"message": "test", "country": "latam"}

encrypted = encrypt_payload(data, secret)
decrypted = decrypt_payload(encrypted, secret)

assert decrypted == data
print("✓ Encriptación funciona")
EOF
```

### Frontend (en browser console)

```javascript
const { encryptPayload, decryptPayload } =
  await import("./src/utils/encryption.js");
const secret =
  "bd30427cee9ba319459b690b9d7d6dc24963862c2ab616030b31bddb54e7c3cd";
const data = { message: "test", country: "latam" };

const encrypted = await encryptPayload(data, secret);
const decrypted = await decryptPayload(encrypted, secret);

console.assert(JSON.stringify(decrypted) === JSON.stringify(data));
console.log("✓ Encriptación funciona");
```

### End-to-End

```bash
cd backend
python << 'EOF'
from app.main import app
from app.utils.encryption import encrypt_payload, decrypt_payload
from fastapi.testclient import TestClient

client = TestClient(app)
secret = "bd30427cee9ba319459b690b9d7d6dc24963862c2ab616030b31bddb54e7c3cd"

# Encriptar request
request_data = {"message": "Hello", "country": "latam", "sessionId": "test"}
encrypted_request = encrypt_payload(request_data, secret)

# Enviar y recibir
response = client.post("/api/chat/ask", json={"encrypted": encrypted_request})

# Desencriptar response
if response.status_code == 200:
    encrypted_response = response.json()['encrypted']
    decrypted_response = decrypt_payload(encrypted_response, secret)
    print(f"✓ End-to-end funciona: recibida respuesta con {len(decrypted_response.get('sources', []))} sources")
EOF
```

## Archivos Modificados

### Creados

- `widget/src/utils/encryption.js` - Encriptación con Web Crypto API
- `backend/app/utils/encryption.py` - Encriptación con cryptography
- `widget/.env` - Clave de encriptación (frontend)
- `widget/.env.example` - Template

### Modificados

- `widget/src/services/chatApi.js` - Encriptar/desencriptar requests y responses
- `backend/app/api/routes.py` - Usar EncryptedRequest/EncryptedResponse
- `backend/app/schemas/chat.py` - Agregar modelos encriptados
- `backend/app/core/config.py` - Agregar ENCRYPTION_SECRET
- `backend/.env` - Agregar ENCRYPTION_SECRET
- `backend/.env.example` - Documentar ENCRYPTION_SECRET
- `backend/requirements.txt` - Agregar cryptography
- `widget/package.json` - No cambios requeridos (Web Crypto API es nativa)

## Notas

- **Web Crypto API**: Usada en frontend es estándar W3C, soportado en todos los navegadores modernos
- **AESGCM**: En Python usa `cryptography`, en frontend usa Web Crypto API
- **IV**: Único por request, previene ataque de patrones repetidos
- **Sin dependencias extras**: Frontend no necesita librerías de encriptación (solo crypto-js fue removido)

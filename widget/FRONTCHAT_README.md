# 🚀 Guía rápida para correr el chatbot localmente

Esta guía explica cómo levantar el chatbot en tu computador usando **WSL**, **FastAPI** y **React/Vite**.

El proyecto tiene dos partes principales:

| Parte | Carpeta | Puerto | Para qué sirve |
|---|---|---:|---|
| Backend | `backend/` | `8000` | API que responde las preguntas |
| Frontend / Widget | `widget/` | `3000` | Interfaz visual del chatbot |

---

## 🧩 Antes de empezar

Asegúrate de tener instalado:

- WSL / Ubuntu
- Python 3
- Node.js y npm
- Git
- VS Code
- El archivo `.env` configurado dentro de `backend/`
- El entorno virtual `.venv` creado en la raíz del proyecto

> Importante: el backend está configurado para aceptar el frontend desde `http://localhost:3000`, así que debes abrir exactamente esa URL en el navegador.

---

## 📁 1. Abrir WSL y ubicarte en el proyecto

Abre **WSL / Ubuntu**.

Si estás en PowerShell o Windows Terminal, puedes entrar a WSL con:

```bash
wsl
```

Luego entra a la carpeta donde tengas clonado el proyecto.

Ejemplo general:

```bash
cd /ruta/donde/guardaste/chatbot-latam
```

Si el proyecto está en una carpeta de Windows, la ruta en WSL normalmente empieza por `/mnt/c/`.

Ejemplo:

```bash
cd /mnt/c/Users/TU_USUARIO/Documents/GitHub/chatbot-latam
```

La carpeta correcta debe contener, como mínimo:

```txt
backend/
widget/
.venv/
```

En esta guía, llamaremos a esa carpeta la **raíz del proyecto**.

---

# 🟦 Parte 1: correr el backend

El backend es la API que procesa las preguntas y devuelve respuestas.

## 2. Terminal 1: prender backend

Abre una terminal en WSL.

Desde la raíz del proyecto, entra a la carpeta `backend`:

```bash
cd backend
```

Activa el entorno virtual:

```bash
source ../.venv/bin/activate
```

Carga las variables del archivo `.env`:

```bash
set -a
source .env
set +a
```

Inicia el backend:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level debug
```

Déjalo corriendo. No cierres esta terminal.

Si todo está bien, deberías ver algo parecido a:

```txt
Uvicorn running on http://127.0.0.1:8000
Application startup complete.
```

La primera carga puede demorarse un poco, así que espera a que termine de arrancar.

---

## 3. Verificar que el backend funciona

Abre en el navegador:

```txt
http://127.0.0.1:8000/docs
```

Si abre la documentación de FastAPI, el backend está vivo.

También puedes probar:

```txt
http://127.0.0.1:8000/api/chat/crypto/public-key
```

Si responde con una clave pública en formato JSON, la conexión base del widget con el backend debería estar bien.

> Nota: si abres `http://127.0.0.1:8000/` y aparece `404 Not Found`, no pasa nada. El backend no tiene página principal; solo expone endpoints de API.

---

# 🟩 Parte 2: correr el frontend en producción local

El frontend es la interfaz visual del chatbot.

Esta guía usa `build + preview`, no `npm run dev`, para probar la versión de producción local y evitar exponer directamente archivos fuente como `/src/App.jsx`.

## 4. Terminal 2: prender frontend

Abre una segunda terminal en WSL.

No cierres la terminal del backend.

Desde la raíz del proyecto, entra a la carpeta `widget`:

```bash
cd widget
```

Si es la primera vez que corres el frontend, instala dependencias:

```bash
npm install
```

Luego compila y corre la versión de producción local:

```bash
rm -rf dist
npm run build
npm run preview -- --host localhost --port 3000 --strictPort
```

Si todo está bien, verás algo parecido a:

```txt
Local: http://localhost:3000/
```

Abre en el navegador:

```txt
http://localhost:3000
```

Deja esta terminal abierta también.

---

# 💬 Parte 3: probar el chatbot

Con las dos terminales abiertas:

| Terminal | Debe estar corriendo |
|---|---|
| Terminal 1 | Backend en `http://127.0.0.1:8000` |
| Terminal 2 | Frontend en `http://localhost:3000` |

Abre el frontend:

```txt
http://localhost:3000
```

Escribe una pregunta como:

```txt
Hola
```

o:

```txt
¿Quién es Latinoamérica Comparte?
```

La primera respuesta puede tardar un poco porque el backend puede cargar modelos, recursos internos o componentes del sistema RAG.

Después de esa primera carga, las respuestas deberían ser más rápidas.

---

# 🔐 Parte 4: comprobar que estás viendo producción local

Para confirmar que estás viendo la versión de producción local:

1. Abre:

```txt
http://localhost:3000
```

2. Haz clic derecho en la página.

3. Entra a:

```txt
Ver código fuente de la página
```

Deberías ver algo parecido a:

```html
<script type="module" crossorigin src="/assets/index-xxxxx.js"></script>
```

Eso está bien.

No deberías ver:

```txt
/@vite/client
/@react-refresh
/src/main.jsx
```

Luego prueba estas rutas manualmente en el navegador:

```txt
http://localhost:3000/src/main.jsx
http://localhost:3000/src/App.jsx
http://localhost:3000/src/components/ChatWidget.jsx
http://localhost:3000/src/services/chatApi.js
http://localhost:3000/src/utils/encryption.js
http://localhost:3000/.env
http://localhost:3000/package.json
```

Lo ideal es que no abran código fuente.

---

# ⚡ Comandos rápidos

## Backend

Desde la raíz del proyecto:

```bash
cd backend
source ../.venv/bin/activate
set -a
source .env
set +a
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level debug
```

Verificar backend:

```txt
http://127.0.0.1:8000/docs
```

---

## Frontend producción local

Desde la raíz del proyecto, en otra terminal:

```bash
cd widget
npm install
rm -rf dist
npm run build
npm run preview -- --host localhost --port 3000 --strictPort
```

Abrir chatbot:

```txt
http://localhost:3000
```

---

# 🛠️ Problemas comunes

## No sabes cuál es la raíz del proyecto

La raíz del proyecto es la carpeta que contiene `backend/` y `widget/`.

Puedes comprobarlo con:

```bash
ls
```

Deberías ver algo como:

```txt
backend  widget  .venv
```

Si no ves esas carpetas, todavía no estás en la carpeta correcta.

---

## El backend no arranca

Si aparece un error de módulo faltante, por ejemplo:

```txt
ModuleNotFoundError: No module named 'cryptography'
```

instala las dependencias dentro del entorno virtual:

```bash
cd /ruta/donde/guardaste/chatbot-latam
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Si solo falta `cryptography`:

```bash
pip install cryptography
```

---

## El entorno virtual no existe

Si aparece:

```txt
../.venv/bin/activate: No such file or directory
```

crea el entorno virtual desde la raíz del proyecto:

```bash
cd /ruta/donde/guardaste/chatbot-latam
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Luego vuelve a correr el backend.

---

## Falta el archivo `.env`

Si no existe `backend/.env`, créalo desde el ejemplo:

```bash
cd backend
cp .env.example .env
```

Luego edita `.env` y configura las variables necesarias.

Revisa especialmente que esté permitido el frontend local:

```env
ALLOWED_ORIGINS='["http://localhost:3000"]'
```

---

## Error con saltos de línea en `.env`

Si el backend falla leyendo variables como:

```txt
LOG_TO_CONSOLE=false
```

puede ser porque el `.env` tiene formato Windows.

Corrígelo desde la carpeta `backend`:

```bash
sed -i 's/\r$//' .env
```

---

## El frontend no compila

Si falla `npm run build`, instala las dependencias:

```bash
cd widget
npm install
npm run build
```

Si Vite falla por versión de Node, revisa:

```bash
node -v
```

---

## El puerto 3000 está ocupado

Como se usa `--strictPort`, si el puerto 3000 está ocupado, Vite no saltará a otro puerto automáticamente.

Revisa qué proceso usa el puerto:

```bash
lsof -i :3000
```

Mata el proceso usando su PID:

```bash
kill -9 PID
```

Ejemplo:

```bash
kill -9 12345
```

Luego vuelve a correr el frontend.

---

## El chatbot muestra “No pude conectar con el servidor”

Primero verifica que el backend esté vivo:

```txt
http://127.0.0.1:8000/docs
```

Luego verifica que el frontend esté abierto exactamente en:

```txt
http://localhost:3000
```

No uses:

```txt
http://127.0.0.1:3000
http://localhost:3001
```

porque el backend está configurado para permitir `http://localhost:3000`.

Si sigue fallando, mira la terminal del backend justo después de enviar un mensaje. Si aparece un `500` o un `Traceback`, el frontend sí llegó al backend, pero el backend falló internamente.

---

## El frontend funciona con `npm run dev`, pero falla con `npm run preview`

Asegúrate de tener configurada la URL del backend para producción en el widget.

En `widget/.env.production` debe existir:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Después de crear o modificar ese archivo, vuelve a compilar:

```bash
cd widget
rm -rf dist
npm run build
npm run preview -- --host localhost --port 3000 --strictPort
```

---

# 📌 Archivos importantes

| Archivo | Para qué sirve |
|---|---|
| `backend/.env` | Variables de entorno del backend |
| `backend/app/main.py` | Punto de entrada de FastAPI |
| `widget/.env.production` | URL del backend usada en build de producción |
| `widget/vite.config.js` | Configuración de Vite |
| `widget/src/components/ChatWidget.jsx` | Interfaz visual del chatbot |
| `widget/src/services/chatApi.js` | Conexión del frontend con el backend |
| `widget/src/App.jsx` | Renderiza el widget en la app React |
| `widget/index.html` | Entrada HTML de Vite |

---

# ✅ Flujo general

```txt
Usuario escribe en el chatbot
        ↓
React ChatWidget
        ↓
chatApi.js
        ↓
POST http://127.0.0.1:8000/api/chat/ask
        ↓
Backend FastAPI
        ↓
Respuesta del chatbot
        ↓
Frontend muestra la respuesta
```

---

# 🧠 Recordatorio final

Para usar el chatbot siempre necesitas:

1. Backend corriendo en `http://127.0.0.1:8000`
2. Frontend corriendo en `http://localhost:3000`
3. Archivo `backend/.env` configurado
4. Archivo `widget/.env.production` configurado si usas `npm run preview`
5. No cerrar las terminales mientras pruebas el chatbot

# 🚀 Guía rápida para correr el chatbot localmente

Esta guía explica cómo levantar el chatbot en tu computador usando **WSL**, **FastAPI** y **React/Vite**.

El proyecto tiene dos partes principales:

| Parte | Carpeta | Puerto | Para qué sirve |
|---|---|---:|---|
| Backend | `backend/` | `8000` | API que responde las preguntas |
| Frontend | `widget/` | `3000` | Interfaz visual del chatbot |

---

## 🧩 Antes de empezar

Asegúrate de tener instalado:

- WSL / Ubuntu
- Python 3
- Node.js y npm
- Git
- VS Code
- El archivo `.env` configurado dentro de `backend/`

---

## 📁 1. Ubícate en el proyecto

Abre **WSL / Ubuntu**.

Si estás en PowerShell o Windows Terminal, puedes entrar a WSL con:

```bash
wsl
````

Luego entra a la carpeta donde tengas clonado el proyecto:

```bash
cd /ruta/a/tu/proyecto/chatbot-latam
```

Por ejemplo:

```bash
cd ~/chatbot-latam
```

o:

```bash
cd /mnt/c/Users/TU_USUARIO/Documents/GitHub/chatbot-latam
```

La carpeta correcta es la que contiene estas carpetas:

```txt
backend/
widget/
docs/
knowledge_base/
scripts/
```

---

# 🟦 Parte 1: correr el backend

El backend es la API que procesa las preguntas y devuelve respuestas.

## 2. Abrir una terminal para el backend

Desde la raíz del proyecto, entra a la carpeta `backend`:

```bash
cd /ruta/a/tu/proyecto/chatbot-latam/backend
```

Activa el entorno virtual de Python:

```bash
source ../.venv/bin/activate
```

Cuando funcione, deberías ver algo como esto al inicio de la terminal:

```txt
(.venv)
```

Carga las variables del archivo `.env`:

```bash
set -a
source .env
set +a
```

Ahora inicia el backend:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level debug
```

Si todo está bien, verás algo parecido a:

```txt
Uvicorn running on http://127.0.0.1:8000
Application startup complete.
```

Deja esta terminal abierta.

---

## 3. Verificar que el backend funciona

Abre en el navegador:

```txt
http://127.0.0.1:8000/api/chat/health
```

La respuesta esperada es:

```json
{"status":"ok"}
```

También puedes abrir la documentación automática del backend:

```txt
http://127.0.0.1:8000/docs
```

> Nota: si abres `http://127.0.0.1:8000/` y aparece `404 Not Found`, no pasa nada. El backend no tiene página principal; solo expone endpoints de API.

---

# 🟩 Parte 2: correr el frontend

El frontend es la interfaz visual del chatbot.

## 4. Abrir otra terminal para el frontend

Abre una segunda terminal.
No cierres la terminal del backend.

Desde la raíz del proyecto, entra a la carpeta `widget`:

```bash
cd /ruta/a/tu/proyecto/chatbot-latam/widget
```

Instala las dependencias del frontend:

```bash
npm install
```

Luego inicia el frontend:

```bash
npm run dev
```

Si todo está bien, verás algo parecido a:

```txt
VITE ready
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

| Terminal   | Debe estar corriendo                |
| ---------- | ----------------------------------- |
| Terminal 1 | Backend en `http://127.0.0.1:8000`  |
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

La primera respuesta puede tardar un poco porque el backend puede cargar modelos, weights, batches o recursos internos del sistema RAG.

Después de esa primera carga, las respuestas deberían ser más rápidas.

---

# ⚡ Comandos rápidos

## Backend

```bash
cd /ruta/a/tu/proyecto/chatbot-latam/backend
source ../.venv/bin/activate
set -a
source .env
set +a
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level debug
```

Verificar backend:

```txt
http://127.0.0.1:8000/api/chat/health
```

---

## Frontend

```bash
cd /ruta/a/tu/proyecto/chatbot-latam/widget
npm install
npm run dev
```

Abrir chatbot:

```txt
http://localhost:3000
```

---

# 🛠️ Problemas comunes

## El entorno virtual no existe

Si aparece algo como:

```txt
../.venv/bin/activate: No such file or directory
```

crea el entorno virtual desde la raíz del proyecto:

```bash
cd /ruta/a/tu/proyecto/chatbot-latam
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Luego vuelve a correr el backend.

---

## Falta el archivo `.env`

Si no existe `backend/.env`, créalo desde el ejemplo:

```bash
cd /ruta/a/tu/proyecto/chatbot-latam/backend
cp .env.example .env
```

Luego edita `.env` y configura las variables necesarias.

La más importante es:

```env
GROQ_API_KEY=tu_api_key
```

También revisa que el frontend local esté permitido:

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

Corrígelo con:

```bash
cd /ruta/a/tu/proyecto/chatbot-latam/backend
sed -i 's/\r$//' .env
```

---

## El frontend no instala dependencias

Si falla `npm install`, revisa la versión de Node:

```bash
node -v
```

Si estás usando Node 18 y Vite falla por versión, instala versiones compatibles:

```bash
npm uninstall vite @vitejs/plugin-react
npm install vite@5 @vitejs/plugin-react@4
```

Luego corre de nuevo:

```bash
npm run dev
```

---

## El chatbot no responde

Primero verifica que el backend esté vivo:

```txt
http://127.0.0.1:8000/api/chat/health
```

Si no responde:

1. Revisa que la terminal del backend siga abierta.
2. Reinicia el backend.
3. Revisa que `.env` esté configurado.
4. Revisa que no haya errores en la terminal del backend.

El frontend debe llamar a este endpoint:

```txt
http://127.0.0.1:8000/api/chat/ask
```

---

## La página aparece en blanco

Abre la consola del navegador:

```txt
F12 → Console
```

Revisa si hay errores en rojo.

Causas comunes:

* Falta `widget/index.html`
* Falta `widget/src/main.jsx`
* Falta `widget/src/App.jsx`
* Falta `widget/src/services/chatApi.js`
* Error importando `ChatWidget.jsx`

---

# 📌 Archivos importantes

| Archivo                                | Para qué sirve                       |
| -------------------------------------- | ------------------------------------ |
| `backend/.env`                         | Variables de entorno del backend     |
| `backend/app/main.py`                  | Punto de entrada de FastAPI          |
| `widget/src/components/ChatWidget.jsx` | Interfaz visual del chatbot          |
| `widget/src/services/chatApi.js`       | Conexión del frontend con el backend |
| `widget/src/App.jsx`                   | Renderiza el widget en la app React  |
| `widget/index.html`                    | Entrada HTML de Vite                 |

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
3. Archivo `.env` configurado
4. No cerrar las terminales mientras pruebas el chatbot

```
```

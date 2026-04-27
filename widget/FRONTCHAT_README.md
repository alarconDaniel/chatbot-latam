# 🚀 Cómo correr el chatbot localmente

Esta guía explica cómo levantar el proyecto en local usando:

- **WSL / Ubuntu**
- **Backend FastAPI**
- **Frontend React / Vite**
- **Python**
- **Node.js + npm**

El proyecto tiene dos partes:

| Parte | Carpeta | Puerto | URL |
|---|---|---:|---|
| Backend | `backend/` | `8000` | `http://127.0.0.1:8000` |
| Frontend | `widget/` | `3000` | `http://localhost:3000` |

---

## ✅ Requisitos previos

Antes de empezar, asegúrate de tener instalado:

- WSL / Ubuntu
- Python 3
- Node.js y npm
- Git
- VS Code, recomendado
- Archivo `.env` configurado dentro de `backend/`

---

# 1. Abrir WSL

Desde Windows abre **PowerShell**, **Windows Terminal** o **Ubuntu**.

Si estás en PowerShell, entra a WSL con:

```bash
wsl

Luego entra a la carpeta donde tengas clonado el proyecto:

cd /ruta/a/tu/proyecto/chatbot-latam

Ejemplos de rutas posibles:

cd ~/chatbot-latam

o:

cd /mnt/c/Users/TU_USUARIO/Documents/GitHub/chatbot-latam

Cada persona tendrá una ruta distinta. Lo importante es entrar a la carpeta raíz del proyecto, donde están backend/, widget/, docs/, etc.

2. Correr el backend

Abre una terminal y entra a la carpeta backend:

cd /ruta/a/tu/proyecto/chatbot-latam/backend

Activa el entorno virtual:

source ../.venv/bin/activate

Deberías ver algo como esto al inicio de la terminal:

(.venv)

Carga las variables del archivo .env:

set -a
source .env
set +a

Inicia el backend:

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level debug

Si todo está bien, verás algo parecido a:

Uvicorn running on http://127.0.0.1:8000
Application startup complete.

Deja esta terminal abierta. El backend debe quedarse corriendo mientras usas el chatbot.

Probar que el backend funciona

Abre en el navegador:

http://127.0.0.1:8000/api/chat/health

Respuesta esperada:

{"status":"ok"}

También puedes abrir la documentación del backend:

http://127.0.0.1:8000/docs

Si abres http://127.0.0.1:8000/ y sale 404 Not Found, es normal. El backend no tiene página principal, solo API.

3. Correr el frontend

Abre otra terminal diferente. No cierres la terminal del backend.

Entra a la carpeta widget:

cd /ruta/a/tu/proyecto/chatbot-latam/widget

Instala las dependencias:

npm install

Luego inicia el frontend:

npm run dev

Si todo está bien, verás algo como:

VITE ready
Local: http://localhost:3000/

Abre en el navegador:

http://localhost:3000

Deja esta terminal abierta también. El frontend debe quedarse corriendo mientras usas el chatbot.

4. Probar el chatbot

Con ambas terminales abiertas:

Terminal	Qué debe estar corriendo
Terminal 1	Backend en http://127.0.0.1:8000
Terminal 2	Frontend en http://localhost:3000

Ahora abre:

http://localhost:3000

Escribe una pregunta en el chat, por ejemplo:

Hola

o:

¿Quién es Latinoamérica Comparte?

La primera respuesta puede tardar un poco más porque el backend puede cargar modelos, weights, batches o recursos internos del sistema RAG.

Después de esa primera carga, debería responder más rápido.

⚡ Resumen rápido
Terminal 1 — Backend
cd /ruta/a/tu/proyecto/chatbot-latam/backend
source ../.venv/bin/activate
set -a
source .env
set +a
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level debug

Verificar backend:

http://127.0.0.1:8000/api/chat/health
Terminal 2 — Frontend
cd /ruta/a/tu/proyecto/chatbot-latam/widget
npm install
npm run dev

Abrir chatbot:

http://localhost:3000
🛠️ Problemas comunes
1. El entorno virtual no existe

Si aparece este error:

../.venv/bin/activate: No such file or directory

crea el entorno virtual desde la raíz del proyecto:

cd /ruta/a/tu/proyecto/chatbot-latam
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

Luego vuelve a correr el backend.

2. Falta el archivo .env

Si no existe backend/.env, créalo desde el ejemplo:

cd /ruta/a/tu/proyecto/chatbot-latam/backend
cp .env.example .env

Luego abre .env y configura las variables necesarias.

La más importante es:

GROQ_API_KEY=tu_api_key

También revisa que ALLOWED_ORIGINS permita el frontend local:

ALLOWED_ORIGINS='["http://localhost:3000"]'
3. Error con saltos de línea en .env

Si el backend falla leyendo variables como LOG_TO_CONSOLE=false, puede ser porque el .env tiene formato Windows.

Corrígelo con:

cd /ruta/a/tu/proyecto/chatbot-latam/backend
sed -i 's/\r$//' .env
4. El frontend no instala dependencias

Si npm install falla, revisa tu versión de Node:

node -v

Si estás usando Node 18 y Vite falla por versión, instala versiones compatibles:

npm uninstall vite @vitejs/plugin-react
npm install vite@5 @vitejs/plugin-react@4

Luego vuelve a correr:

npm run dev
5. El chatbot no responde

Primero verifica que el backend esté activo:

http://127.0.0.1:8000/api/chat/health

Si no responde:

Revisa que la terminal del backend siga abierta.
Reinicia el backend.
Revisa que .env esté configurado correctamente.

También confirma que el frontend esté llamando a:

http://127.0.0.1:8000/api/chat/ask
6. La página sale en blanco

Abre la consola del navegador:

F12 → Console

Revisa si hay errores en rojo.

Causas comunes:

Falta widget/index.html
Falta widget/src/main.jsx
Falta widget/src/App.jsx
Falta widget/src/services/chatApi.js
Error importando ChatWidget.jsx
📌 Notas importantes
El backend corre en el puerto 8000.
El frontend corre en el puerto 3000.
Ambos deben estar corriendo al mismo tiempo.
No cierres las terminales mientras uses el chatbot.
La primera respuesta puede tardar porque se cargan recursos del modelo y del índice RAG.
El chatbot visual está en:
widget/src/components/ChatWidget.jsx
La conexión con el backend está en:
widget/src/services/chatApi.js
✅ Flujo final
Usuario escribe en el frontend
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
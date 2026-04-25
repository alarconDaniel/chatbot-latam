# chatbot-latam

![Chatbot Latam](docs/img/chatbot-latam-banner.jpg)

Chatbot para los portales país de Latinoamérica Comparte.

El objetivo del proyecto es construir un chatbot público, seguro y acotado, usando una base documental curada y recuperación de información mediante RAG.

## Antes de empezar

Esta guía está pensada para trabajar desde Windows 10 usando WSL 2 con Ubuntu.

## 1. Abrir PowerShell como administrador

En Windows:

1. Abre el menú de inicio.
2. Busca `PowerShell`.
3. Clic derecho.
4. Selecciona `Ejecutar como administrador`.

## 2. Instalar WSL

En PowerShell:

```powershell
wsl --install
```

Si WSL ya estaba instalado, puedes verificar las distribuciones con:

```powershell
wsl -l -v
```

La distribución debe aparecer con `VERSION 2`.

Si aparece en versión 1, conviértela a WSL 2:

```powershell
wsl --set-version Ubuntu 2
```

Si tu distribución tiene otro nombre, usa el nombre exacto que aparece en `wsl -l -v`.

También puedes dejar WSL 2 como versión por defecto:

```powershell
wsl --set-default-version 2
```

## 3. Entrar a Ubuntu

Desde PowerShell:

```powershell
wsl
```

Una vez dentro de Ubuntu, verifica tu carpeta personal:

```bash
echo ~
```

En este proyecto se recomienda trabajar dentro del home de Linux, no dentro de `/mnt/c`.

Ejemplo recomendado:

```text
/home/admon/chatbot-latam
```

## 4. Instalar dependencias básicas del sistema

Dentro de Ubuntu:

```bash
sudo apt update
sudo apt install -y git python3 python3-venv python3-pip unzip ripgrep build-essential
```

Verifica:

```bash
git --version
python3 --version
pip3 --version
```

## 5. Clonar el repositorio

Ubícate en tu home:

```bash
cd ~
```

Clona el repositorio:

```bash
git clone https://github.com/alarconDaniel/chatbot-latam.git
cd chatbot-latam
```

La ruta final esperada es:

```text
/home/admon/chatbot-latam
```

## 6. Crear y activar el entorno virtual

Desde la raíz del proyecto:

```bash
cd /home/admon/chatbot-latam
python3 -m venv .venv
source .venv/bin/activate
```

Actualiza pip:

```bash
python -m pip install --upgrade pip
```

## 7. Instalar dependencias del proyecto

Instala las dependencias desde el archivo `requirements.txt`:

```bash
pip install -r requirements.txt
```

El proyecto usa PyTorch en CPU para evitar descargar dependencias CUDA/NVIDIA innecesarias en WSL.

## 8. Iniciar sesión en Hugging Face

Algunos modelos o flujos pueden requerir autenticación con Hugging Face.

Sigue esta guía:

[Iniciar sesión en Hugging Face desde consola](docs/HF_AUTH_LOGIN.md)

## 9. Continuar con chunking e índice vectorial

Cuando el entorno ya esté instalado y autenticado, sigue la guía de Daniel para la base de conocimiento:

[Chunking e índice vectorial - chatbot-latam](docs/README_DANIEL_BASE_CONOCIMIENTO.md)

## Documentación útil

- [Chunking e índice vectorial - chatbot-latam](docs/README_DANIEL_BASE_CONOCIMIENTO.md)
- [Glosario RAG para dummies](docs/GLOSARIO_RAG_DUMMIES.md)
- [Iniciar sesión en Hugging Face desde consola](docs/HF_AUTH_LOGIN.md)

## Estructura relevante

```text
chatbot-latam/
├── knowledge_base/
│   ├── raw/
│   ├── processed/
│   └── eval/
├── scripts/
├── docs/
├── requirements.txt
└── README.md
```

## Flujo general del proyecto

```text
Corpus público aprobado
        ↓
Limpieza y curaduría
        ↓
Chunks
        ↓
Embeddings
        ↓
Índice vectorial FAISS
        ↓
Pregunta del usuario
        ↓
Recuperación de contexto
        ↓
Respuesta del chatbot
```

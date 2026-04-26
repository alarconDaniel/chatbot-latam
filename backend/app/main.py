from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import get_logger
from app.api.routes import router

# Initialize logging
logger = get_logger()

app = FastAPI(
    title="Chatbot Latinoamérica Comparte",
    description="RAG-powered chatbot for Latinoamérica Comparte",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Log application startup."""
    logger.info(f"🚀 Chatbot API starting - Log Level: {settings.log_level_str}")
    logger.info(f"📋 Config - Top-K: {settings.top_k}, Max Message: {settings.max_message_length}")


@app.on_event("shutdown")
async def shutdown_event():
    """Log application shutdown."""
    logger.info("🛑 Chatbot API shutting down")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=settings.port)


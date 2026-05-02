from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import logging


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    groq_api_key: str
    groq_model: str = "llama-3.1-8b-instant"
    index_path: str = "../../knowledge_base/processed/faiss_index"
    corpus_path: str = "../../knowledge_base/processed/rag_chunks.jsonl"
    top_k: int = 4
    max_message_length: int = 500
    port: int = 8000
    allowed_origins: List[str] = ["http://localhost:3000"]
    log_level_str: str = "INFO"
    log_to_console: bool = False
    embedding_device: str = "auto"

    @property
    def log_level(self) -> int:
        """Convert LOG_LEVEL string to logging level."""
        level_map = {
            "DEBUG": logging.DEBUG,
            "INFO": logging.INFO,
            "WARNING": logging.WARNING,
            "ERROR": logging.ERROR,
        }
        return level_map.get(self.log_level_str.upper(), logging.INFO)

settings = Settings()


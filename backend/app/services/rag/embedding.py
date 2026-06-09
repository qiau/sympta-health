from langchain_ollama import OllamaEmbeddings
from app.core.config import settings

def get_embeddings():
    return OllamaEmbeddings(
        model=settings.EMBEDDING_MODEL
    )
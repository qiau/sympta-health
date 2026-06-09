from langchain_ollama import OllamaLLM
from app.core.config import settings

def get_llm():
    return OllamaLLM(
        model=settings.LLM_MODEL,
        temperature=0.3,
        timeout=120 
    )
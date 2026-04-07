# Embedding models
from langchain_ollama import OllamaEmbeddings
from app.config.settings import EMBEDDING_MODEL, OLLAMA_BASE_URL


# function to get the embeddings
def get_embeddings():
    return OllamaEmbeddings(model=EMBEDDING_MODEL, base_url=OLLAMA_BASE_URL)

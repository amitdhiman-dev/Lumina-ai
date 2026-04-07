from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from langchain_qdrant import QdrantVectorStore
import os

from app.config.settings import COLLECTION_NAME
from app.services.embedding import get_embeddings


def get_vector_store():
    # Use environment variable or fallback to localhost
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    
    # Parse host and port from URL
    url_clean = qdrant_url.replace("http://", "").replace("https://", "")
    
    if ":" in url_clean:
        host, port_str = url_clean.rsplit(":", 1)
        port = int(port_str)
    else:
        host = url_clean
        port = 6333
    
    print(f"Connecting to Qdrant at {host}:{port}")

    client = QdrantClient(host=host, port=port)

    embeddings = get_embeddings()

    # Create collection if not exists
    collections = client.get_collections().collections
    existing = [c.name for c in collections]

    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=768,  # nomic-embed-text dimension
                distance=Distance.COSINE,
            ),
        )

    vector_store = QdrantVectorStore(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding=embeddings,
    )

    return vector_store
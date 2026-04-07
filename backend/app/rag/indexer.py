from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.services.vector_db import get_vector_store
from app.services.pdf_parser import extract_text_from_pdf
from qdrant_client import QdrantClient
import os
from app.config.settings import COLLECTION_NAME


# function to index pdf
def index_pdf(file_path):

    # Extract text using improved parser
    pages_data = extract_text_from_pdf(file_path)
    
    if not pages_data:
        print("Error: Could not extract text from PDF")
        return "Error: PDF text extraction failed"
    
    # Convert to LangChain Document format
    documents = [
        Document(
            page_content=page["content"],
            metadata={"page": page["page"], "source": file_path}
        )
        for page in pages_data
    ]
    print(f"Documents created: {len(documents)}")

    # Text splitter - more aggressive chunking for better retrieval
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,  # Smaller chunks for better relevance
        chunk_overlap=100,  # More overlap for context
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Chunks created : {len(chunks)}")

    # Clear previous documents from vector db before adding new ones
    try:
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        url_clean = qdrant_url.replace("http://", "").replace("https://", "")
        if ":" in url_clean:
            host, port_str = url_clean.rsplit(":", 1)
            port = int(port_str)
        else:
            host = url_clean
            port = 6333
        
        client = QdrantClient(host=host, port=port)
        
        # Delete old collection and recreate it
        try:
            client.delete_collection(collection_name=COLLECTION_NAME)
            print(f"✓ Cleared previous documents from collection '{COLLECTION_NAME}'")
        except Exception as e:
            print(f"Note: Could not delete collection (may not exist): {e}")
        
        # Recreate collection
        from qdrant_client.models import Distance, VectorParams
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=768,  # nomic-embed-text dimension
                distance=Distance.COSINE,
            ),
        )
        print(f"✓ Created fresh collection '{COLLECTION_NAME}'")
    except Exception as e:
        print(f"Warning: Could not clear vector DB: {e}")

    # vector db store
    vector_store = get_vector_store()
    vector_store.add_documents(chunks)
    print("✓ Embeddings created and stored in vector db")

    return "Indexing completed successfully"

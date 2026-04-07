# RAG workflow
from app.services.vector_db import get_vector_store


def get_retriever():

    vector_store = get_vector_store()

    retriever = vector_store.as_retriever(search_kwargs={"k": 4}) # top 4 chunks

    return retriever

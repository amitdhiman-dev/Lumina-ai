from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rag_chain import get_rag_chain

router = APIRouter()

class QuestionRequest(BaseModel):
    question: str
    system_prompt: str = None  # Optional system prompt (backward compatible)
    mode: str = "teach"  # Study mode: 'teach', 'visualize', 'duck'

class StudyNotesRequest(BaseModel):
    document: str


@router.post("/ask")
async def ask_question(data: QuestionRequest):
    # Use mode parameter if provided, otherwise fall back to system_prompt
    chain = get_rag_chain(mode=data.mode)

    result = chain.invoke({
        "question": data.question
    })

    return {"answer": result}


@router.post("/study-notes")
async def generate_study_notes(data: StudyNotesRequest):
    """Generate study notes from the uploaded document using RAG notes mode."""
    
    # Use the notes mode which has optimized study notes generation
    chain = get_rag_chain(mode="notes")
    
    result = chain.invoke({
        "question": f"Synthesize study notes from: {data.document}"
    })
    
    return {"notes": result}
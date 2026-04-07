from fastapi import APIRouter, UploadFile, File
import uuid
import os

from app.rag.indexer import index_pdf

router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    path = os.path.join(UPLOAD_DIR, file.filename)

    contents = await file.read()

    if not contents:
        return {"error": "Uploaded file is empty"}

    with open(path, "wb") as f:
        f.write(contents)

    result = index_pdf(path)

    return {
        "file_id": str(uuid.uuid4()),
        "message": "Upload successful",
        "index": result
    }
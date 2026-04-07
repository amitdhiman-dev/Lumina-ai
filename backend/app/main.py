# FastAPI entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uuid

from app.rag.indexer import index_pdf
from app.api import router
from app.routes.ask import router as ask_router

app = FastAPI(title="Study Assistant API")

# Add CORS middleware BEFORE routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Include routers after middleware
app.include_router(router)
app.include_router(ask_router)

@app.get("/")
def health():
    return {"status": "API is up and running"}

@app.head("/")
def health_head():
    return {"status": "API is up and running"}

@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return {"status": "ok"}



# Lumina - AI Study Assistant Setup Guide

## Quick Start

### Prerequisites
- Docker & Docker Compose
- OR Python 3.11+, Node.js 20+, and Ollama for local development

### Run with Docker

```bash
# Build and start all services
docker compose up -d --build

# Wait for all services to be healthy (30-60 seconds)
docker compose ps

# Access the application
- Frontend: http://localhost
- Backend API: http://localhost:8000
- Vector DB: http://localhost:6333
```

### Run Locally (Development)

#### Terminal 1: Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
# Backend will run on http://localhost:8000
```

#### Terminal 2: Frontend
```bash
cd frontend/ui
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

#### Terminal 3: Ollama
```bash
ollama run llama3
# Or use a different model
```

#### Terminal 4: Vector DB (Qdrant)
```bash
docker run -p 6333:6333 qdrant/qdrant
```

## CORS Configuration

The application includes proper CORS setup to handle requests across different origins:

### Backend (FastAPI)
- Location: `backend/app/main.py`
- CORS middleware configured with:
  - `allow_origins=["*"]` - Allows all origins (configurable for production)
  - OPTIONS preflight handler for cross-origin requests
  - Proper headers exposure

### Frontend
- **Development**: Vite proxy forwards `/ask` requests to `http://localhost:8000`
- **Docker**: Nginx proxy forwards `/ask` requests to backend container

### API Endpoints

#### Upload PDF
```bash
curl -X POST -F "file=@document.pdf" http://localhost:8000/upload
```

#### Ask Question (RAG)
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"question": "What is this document about?"}' \
  http://localhost:8000/ask
```

## Architecture

### Services

1. **Vector Database (Qdrant)**
   - Port: 6333
   - Stores PDF embeddings
   - Persistent volume: `qdrant_data`

2. **Backend API (FastAPI)**
   - Port: 8000
   - RAG chain with LLM integration
   - PDF indexing and retrieval
   - Hot-reload enabled for development

3. **Frontend (React + Vite)**
   - Port: 80 (Docker) / 5173 (Dev)
   - Modern UI with markdown rendering
   - Real-time chat interface

4. **Ollama (LLM)**
   - Port: 11434 (local) / host.docker.internal (from Docker container)
   - Language model inference
   - Run models: `ollama pull llama3`

## Environment Variables

See `.env.example` for all available configuration options.

### Key Variables

```env
# Backend
QDRANT_URL=http://vector-db:6333
OLLAMA_BASE_URL=http://host.docker.internal:11434

# Frontend
VITE_API_BASE=http://localhost:8000
```

## Troubleshooting

### CORS Errors
**Error**: `Access to fetch at 'http://localhost:8000/ask' from origin 'http://localhost' has been blocked by CORS policy`

**Solution**: Already fixed! The application now:
1. Uses relative API paths (`/ask`) instead of absolute URLs
2. Has proper CORS middleware with `expose_headers`
3. Implements OPTIONS endpoint handlers
4. Routes API calls through Nginx proxy in Docker

### Backend Connection Issues
- Ensure Ollama is running: `ollama run llama3`
- Check Vector DB health: `curl http://localhost:6333/health`
- View backend logs: `docker logs lumina-backend`

### Frontend Not Loading
- Clear browser cache: `Ctrl+Shift+Delete`
- Check frontend logs: `docker logs lumina-frontend`
- Verify nginx config: In container, check `/etc/nginx/nginx.conf`

## Development Tips

### Hot Reload
- **Backend**: Enabled with `--reload` flag in uvicorn
- **Frontend**: Built-in with Vite dev server
- **Changes**: Modify files and refresh browser/restart as needed

### Debugging
```bash
# Backend logs
docker logs -f lumina-backend

# Frontend access logs
docker logs -f lumina-frontend

# Vector DB logs
docker logs -f lumina-vector-db

# Run commands in container
docker exec lumina-backend python -c "import app; print(app)"
```

### Database Reset
```bash
# Clear all Vector DB data
docker volume rm lumina_qdrant_data

# Rebuild services
docker compose up -d --build
```

## Production Deployment

For production, update:
1. CORS origins to specific domains (not `*`)
2. Remove `--reload` flag from backend
3. Enable HTTPS with proper certificates
4. Use environment variables for secrets
5. Enable authentication on Qdrant

```yaml
# Example production settings
backend:
  environment:
    - QDRANT_API_KEY=your-secure-key
    - CORS_ORIGINS=["https://yourdomain.com"]
```

## API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py         (FastAPI app + CORS setup)
│   │   ├── api.py          (Upload endpoint)
│   │   ├── routes/ask.py   (RAG ask endpoint)
│   │   ├── rag/            (RAG pipeline)
│   │   └── services/       (LLM, embeddings)
│   ├── uploads/            (Uploaded PDFs)
│   ├── Dockerfile          (Backend container)
│   └── requirements.txt
├── frontend/ui/
│   ├── src/
│   │   ├── App.jsx
│   │   └── page/StudyAssistant.jsx
│   ├── Dockerfile          (Frontend container)
│   ├── nginx.conf          (Nginx proxy config)
│   ├── vite.config.js      (Dev server proxy)
│   └── package.json
├── docker-compose.yml      (Multi-service orchestration)
└── .env.example            (Configuration template)
```

## Support

For issues:
1. Check logs: `docker compose logs`
2. Verify services: `docker compose ps`
3. Restart services: `docker compose restart`
4. Full rebuild: `docker compose up -d --build`

---

**Lumina** - AI Study Assistant | Powered by RAG + LLaMA

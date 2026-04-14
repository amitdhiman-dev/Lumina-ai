# 📚 Lumina - AI Study Assistant

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![Node.js](https://img.shields.io/badge/node.js-20+-green.svg)

**Lumina** is an intelligent study assistant powered by AI that helps users upload PDF documents and ask questions about them using Retrieval-Augmented Generation (RAG). Built with modern open-source technologies, it provides a seamless experience for document analysis and learning.

## ✨ Features

- 📄 **PDF Upload & Processing** - Upload study materials and documents for analysis
- 🤖 **AI-Powered Q&A** - Ask questions about your documents using advanced language models
- 🔍 **Semantic Search** - Retrieve relevant information using vector embeddings
- 🎨 **Modern UI** - Clean, intuitive interface built with React and Vite
- 🐳 **Docker Support** - Fully containerized for easy deployment
- ⚡ **Real-time Responses** - Quick and responsive answers powered by Ollama
- 📊 **Context-Aware** - RAG ensures answers are grounded in your documents

## 🏗️ Architecture

Lumina operates as a three-tier microservices architecture:

```
┌─────────────────┐
│   Frontend      │ (React + Vite)
│  Port: 80/5173  │
└────────┬────────┘
         │
┌────────▼────────────────┐
│   Backend API           │ (FastAPI + Uvicorn)
│   Port: 8000            │
│   - PDF Processing      │
│   - RAG Chain           │
│   - LLM Integration     │
└────────┬────────────────┘
         │
┌────────▼────────────────┐
│  Vector Database        │ (Qdrant)
│  Port: 6333             │
│  - Embeddings Storage   │
│  - Semantic Search      │
└─────────────────────────┘
         │
         └─────────────────► Ollama (LLM + Embeddings)
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern web framework for building APIs
- **LangChain** - Framework for building RAG applications
- **Qdrant** - Vector database for semantic search
- **Ollama** - Local LLM inference engine
- **PyPDF** - PDF parsing and extraction

### Frontend
- **React 19** - UI library
- **Vite** - Fast build tool and development server
- **React Markdown** - Markdown rendering for responses
- **Highlight.js** - Code syntax highlighting
- **jsPDF** - PDF export functionality

### Infrastructure
- **Docker & Docker Compose** - Containerization and orchestration
- **Nginx** - Reverse proxy and static file serving

## 🚀 Quick Start

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker & Docker Compose
- Ollama (running locally or via Docker)

**Steps:**

```bash
# Clone or navigate to the project directory
cd f:\AI Study Assistant

# Build and start all services
docker compose up -d --build

# Verify services are running (wait 30-60 seconds for health checks)
docker compose ps

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
# Vector DB: http://localhost:6333
```

**View logs:**
```bash
docker compose logs -f backend
docker compose logs -f vector-db
```

**Stop services:**
```bash
docker compose down
```

### Option 2: Local Development

**Prerequisites:**
- Python 3.11+
- Node.js 20+
- Ollama

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
# Backend runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend/ui
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

**Terminal 3 - Ollama:**
```bash
ollama run llama3
# Or use another model (e.g., 'llama2', 'neural-chat')
```

**Terminal 4 - Vector Database:**
```bash
docker run -p 6333:6333 qdrant/qdrant
```

## 📖 API Documentation

### Endpoints

#### 1. Upload PDF
**Upload a PDF file for processing and indexing**

```bash
POST /upload
Content-Type: multipart/form-data

curl -X POST -F "file=@study_guide.pdf" http://localhost:8000/upload
```

**Response:**
```json
{
  "message": "File processed successfully",
  "filename": "study_guide.pdf",
  "pages": 42,
  "chunks": 128
}
```

#### 2. Ask Question
**Query the uploaded documents using natural language**

```bash
POST /ask
Content-Type: application/json

curl -X POST -H "Content-Type: application/json" \
  -d '{"question": "What are the main topics covered in this document?"}' \
  http://localhost:8000/ask
```

**Response:**
```json
{
  "question": "What are the main topics covered in this document?",
  "answer": "The document covers...",
  "sources": [
    {
      "page": 3,
      "chunk": "Relevant excerpt from the document..."
    }
  ]
}
```

### CORS Configuration

- **Development**: Vite proxy automatically forwards `/ask` requests to the backend
- **Docker**: Nginx reverse proxy handles request routing
- **Backend**: FastAPI CORS middleware accepts all origins (configurable for production)

## 📁 Project Structure

```
AI Study Assistant/
├── README.md                    # This file
├── SETUP.md                     # Setup guide
├── docker-compose.yml           # Docker orchestration
│
├── backend/                     # Python FastAPI Backend
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── api.py              # API route handler
│   │   ├── config/
│   │   │   └── settings.py      # Configuration settings
│   │   ├── rag/
│   │   │   ├── indexer.py       # PDF indexing logic
│   │   │   └── retriever.py     # Document retrieval logic
│   │   ├── routes/
│   │   │   └── ask.py           # Question answering routes
│   │   ├── services/
│   │   │   ├── embedding.py     # Embedding generation
│   │   │   ├── pdf_parser.py    # PDF parsing
│   │   │   ├── rag_chain.py     # RAG chain orchestration
│   │   │   └── vector_db.py     # Vector database client
│   │   └── config/
│   └── uploads/                 # Uploaded PDF storage
│
└── frontend/                    # React + Vite Frontend
    └── ui/
        ├── Dockerfile
        ├── package.json
        ├── vite.config.js
        ├── nginx.conf
        ├── index.html
        ├── public/
        └── src/
            ├── main.jsx
            ├── index.css
            ├── components/
            │   └── SaaSLayout.jsx
            ├── page/
            │   ├── App.jsx
            │   ├── LandingPage.jsx
            │   └── StudyAssistant.jsx
            └── styles/
                └── landing.css
```

## ⚙️ Configuration

### Backend Settings
Edit `backend/app/config/settings.py` to configure:
- LLM model selection
- Vector database URL
- Embedding model
- API parameters

### Environment Variables
The Docker Compose setup uses these environment variables:

```env
QDRANT_URL=http://vector-db:6333
OLLAMA_BASE_URL=http://host.docker.internal:11434
PYTHON_UNBUFFERED=1
```

## 🔧 Development

### Backend Development
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run with hot reload
python -m uvicorn app.main:app --reload

# Run tests (if available)
pytest
```

### Frontend Development
```bash
cd frontend/ui

# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🐛 Troubleshooting

### Docker Issues

**"Port already in use" error:**
```bash
# Find and stop existing services
docker compose down
# Or change ports in docker-compose.yml
```

**Services not starting:**
```bash
# Check logs
docker compose logs --tail=50

# Wait for health checks
docker compose ps
```

### Backend Issues

**"Cannot connect to Ollama":**
- Ensure Ollama is running (`ollama serve` or `ollama run llama3`)
- Check `OLLAMA_BASE_URL` configuration

**"Vector DB connection failed":**
- Verify Qdrant is running on port 6333
- Check network connectivity between services

### Frontend Issues

**"API requests failing":**
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify Vite proxy configuration in `vite.config.js`

## 📚 Dependencies

### Backend
- FastAPI 0.104+
- LangChain 0.1+
- Qdrant Client
- PyPDF2
- Python 3.11+

### Frontend
- React 19+
- Vite 7+
- Node.js 20+

### Infrastructure
- Docker 24+
- Docker Compose 2.20+
- Ollama (local LLM inference)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Backend: Follow PEP 8 guidelines
- Frontend: Use ESLint configuration provided
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙋 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation in SETUP.md
- Review API documentation above

## 🎯 Roadmap

- [ ] User authentication and accounts
- [ ] Multiple document management per user
- [ ] Advanced filtering and search options
- [ ] Export answers to PDF/Word
- [ ] Multi-language support
- [ ] Custom model fine-tuning
- [ ] Conversation history and bookmarks
- [ ] Collaborative features

## 🙏 Acknowledgments

Built with:
- FastAPI & Uvicorn
- LangChain
- Qdrant
- Ollama
- React
- Vite
- Open source community

---

**Made with ❤️ for students and learners everywhere**

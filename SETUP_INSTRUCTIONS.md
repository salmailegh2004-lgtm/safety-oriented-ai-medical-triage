# 🚀 Medical Triage Assistant - Setup & Run Instructions

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

1. **Python 3.10+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 18+** - [Download Node.js](https://nodejs.org/)
3. **Git** - [Download Git](https://git-scm.com/downloads)

## 📦 Quick Start

### Step 1: Clone the Repository

```bash
git clone https://github.com/cleora88/amine-project.git
cd amine-project
```

### Step 2: Backend Setup (Python)

#### 2.1 Create Virtual Environment

**Windows:**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### 2.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Install & Setup Ollama AI

**Windows:**
```powershell
winget install ollama
```

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Then pull the AI model:
```bash
ollama pull llama3.2
```

#### 2.4 Setup Neo4j (Optional but Recommended)

**Option A: Using Neo4j Desktop (Recommended)**

1. Download Neo4j Desktop: [neo4j.com/download](https://neo4j.com/download/)
2. Install and open Neo4j Desktop
3. Create a new project
4. Add a Local DBMS:
   - Name: `medical-triage`
   - Password: `password`
   - Version: 5.x (latest)
5. Click "Start" to run the database

Then initialize the medical knowledge graph:
```bash
python setup_neo4j.py
```

**Option B: Skip Neo4j** (System works without it)
- The application will run with Ollama + FAISS only
- Neo4j features will be gracefully disabled

### Step 3: Frontend Setup (React + TypeScript)

```bash
npm install
```

## ▶️ Running the Application

### Start Backend (Terminal 1)

**Windows:**
```powershell
.venv\Scripts\Activate.ps1
python backend_main.py
```

**macOS/Linux:**
```bash
source .venv/bin/activate
python backend_main.py
```

**Expected Output:**
```
✓ Ollama AI service initialized
✓ FAISS vector database initialized (10 documents)
✓ Neo4j graph database initialized
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Start Frontend (Terminal 2)

```bash
npm run dev
```

**Expected Output:**
```
VITE v5.4.21 ready in XXX ms
➜ Local: http://localhost:3001/
```

## 🌐 Access the Application

Open your browser and navigate to:
```
http://localhost:3001
```

## 📊 API Documentation

Once the backend is running, you can access the interactive API documentation at:
```
http://localhost:8000/docs
```

## 🧪 Testing the Application

### Test Symptom Analysis:

1. Enter symptoms in the text area, for example:
   - "chest pain, shortness of breath, sweating"
   - "fever, cough, headache for 3 days"
   - "severe headache, confusion, vision changes"

2. Optionally enter age (e.g., 45) and allergies

3. Click "Analyze Symptoms"

4. View AI-powered triage results:
   - **Urgency Level**: LOW, MEDIUM, HIGH, or CRITICAL
   - **Confidence Score**: AI's confidence in the assessment
   - **Medical Advice**: Detailed recommendations
   - **Detected Symptoms**: Parsed symptoms list

### Test Chat Feature:

1. Click the chat icon in the bottom right
2. Ask medical questions like:
   - "What should I do for a high fever?"
   - "How do I know if chest pain is serious?"
   - "What are signs of a stroke?"

## 🤖 AI Services Status

The application uses three AI technologies:

1. **✅ Ollama LLM (llama3.2)**
   - Provides intelligent medical analysis
   - Powers the chat assistant
   - Required for the system to work

2. **✅ FAISS Vector Database**
   - Semantic search through medical knowledge base
   - Pre-loaded with 10 medical documents
   - Automatically initialized

3. **⚠️ Neo4j Graph Database (Optional)**
   - Maps symptom-disease relationships
   - 5 diseases, 17 symptoms, 17 relationships
   - System works without it (graceful fallback)

## 🔧 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Windows
netstat -ano | findstr :8000
Stop-Process -Id <PID> -Force

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

**Ollama not responding:**
```bash
# Check if Ollama is running
ollama list

# If not running, start it
ollama serve
```

**Neo4j connection error:**
- The system will work without Neo4j (it will show a warning but continue)
- To enable Neo4j, follow Step 2.4 above

### Frontend Issues

**Port 3000/3001 already in use:**
- Vite will automatically try the next available port
- Use the URL shown in the terminal output

**Module not found errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure

```
amine-project/
├── backend_main.py           # FastAPI server
├── triage_engine.py          # AI-powered triage logic
├── ai_service.py             # Ollama LLM integration
├── vector_db_service.py      # FAISS vector database
├── graph_db_service.py       # Neo4j graph database
├── monitoring_service.py     # Performance monitoring
├── setup_neo4j.py            # Neo4j initialization script
├── medical_triage_ui.tsx     # Main React component
├── requirements.txt          # Python dependencies
├── package.json              # Node.js dependencies
├── README.md                 # Project documentation
└── AI_SETUP_GUIDE.md         # Detailed AI setup guide
```

## 🛑 Stopping the Application

1. **Backend**: Press `Ctrl+C` in the terminal running Python
2. **Frontend**: Press `Ctrl+C` in the terminal running npm
3. **Neo4j**: Stop the database in Neo4j Desktop (if running)

## 📚 Additional Resources

- **Complete AI Setup Guide**: See `AI_SETUP_GUIDE.md` for detailed AI services configuration
- **Project Documentation**: See `README.md` for architecture and features overview
- **API Documentation**: Visit http://localhost:8000/docs when backend is running

## 💡 Tips for Teachers/Evaluators

### Quick Demo Path (Minimal Setup - 5 minutes):

1. Install Ollama and pull llama3.2
2. Install Python/Node dependencies
3. Run backend + frontend
4. System works with Ollama + FAISS (Neo4j optional)

### Full Feature Demo (Complete Setup - 15 minutes):

1. Complete all steps including Neo4j
2. Run `setup_neo4j.py` to initialize graph database
3. All three AI services will be operational
4. Test symptom analysis and chat features

### Key Features to Demonstrate:

- ✅ **AI-Powered Analysis**: Real LLM (not rule-based)
- ✅ **Semantic Search**: Vector database finds relevant medical info
- ✅ **Knowledge Graph**: Neo4j maps symptom-disease relationships
- ✅ **Professional UI**: Modern React with Tailwind CSS
- ✅ **Real-time Chat**: AI medical assistant
- ✅ **Monitoring**: Request metrics and performance tracking

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Ensure Ollama is running: `ollama list`
4. Check backend logs for detailed error messages
5. Review `AI_SETUP_GUIDE.md` for AI-specific issues

---

**Built with:** Python, FastAPI, React, TypeScript, Ollama, FAISS, Neo4j, Tailwind CSS

**GitHub Repository:** https://github.com/cleora88/amine-project

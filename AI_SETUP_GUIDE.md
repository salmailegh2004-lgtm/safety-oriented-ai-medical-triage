# 🤖 AI Services Setup Guide

Quick guide to get all three AI services running for the Medical Triage Assistant.

## 📋 Prerequisites Checklist

- [ ] Python 3.8+ installed
- [ ] All Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Internet connection for downloading AI models

## 1️⃣ Ollama Setup (Required - 10 minutes)

### Windows
1. **Download Ollama**
   - Visit [https://ollama.ai/download](https://ollama.ai/download)
   - Download `OllamaSetup.exe`
   - Run installer (installs to `C:\Program Files\Ollama\`)

2. **Pull Medical AI Model**
   ```powershell
   # Open PowerShell or Command Prompt
   ollama pull llama3.2
   ```
   This downloads ~2GB - takes 5-10 minutes depending on connection.

3. **Verify Installation**
   ```powershell
   ollama list
   # Should show: llama3.2:latest
   
   ollama run llama3.2 "What are symptoms of a heart attack?"
   # Should respond with medical information
   ```

4. **Ollama Runs Automatically**
   - Ollama service starts automatically on Windows startup
   - Runs on `http://localhost:11434`
   - No manual start needed!

### macOS
```bash
brew install ollama
ollama pull llama3.2
ollama list
```

### Linux
```bash
curl https://ollama.ai/install.sh | sh
ollama pull llama3.2
ollama list
```

## 2️⃣ Neo4j Setup (Optional but Recommended - 5 minutes)

### Quick Option: Docker (Easiest)

```powershell
# Install Docker Desktop if not installed: https://www.docker.com/products/docker-desktop

# Pull and run Neo4j
docker run -d `
  --name neo4j `
  -p 7474:7474 -p 7687:7687 `
  -e NEO4J_AUTH=neo4j/password `
  neo4j:latest

# Verify it's running
docker ps
# Should show neo4j container running

# Access Neo4j Browser (optional)
# Open: http://localhost:7474
# Login: neo4j / password
```

### Alternative: Neo4j Desktop
1. Download from [https://neo4j.com/download/](https://neo4j.com/download/)
2. Install and create a new project
3. Create a database with password: `password`
4. Click "Start" to run the database

### Cloud Option: Neo4j Aura (Free Tier)
1. Sign up at [https://neo4j.com/cloud/aura-free/](https://neo4j.com/cloud/aura-free/)
2. Create a free instance (takes 2-3 minutes)
3. Save your connection URI and password
4. Update `triage_engine.py` line 48:
   ```python
   self.graph_db = GraphDBService(
       uri="neo4j+s://xxxxx.databases.neo4j.io",  # Your Aura URI
       user="neo4j",
       password="your-generated-password"
   )
   ```

## 3️⃣ FAISS Vector Database (Automatic - 0 minutes)

✅ **No setup needed!** FAISS is automatically initialized when you run the backend.

Data is stored in: `data/vector_db/`

## 🚀 Starting Everything

### Step 1: Start Neo4j (if using Docker)
```powershell
docker start neo4j
```

### Step 2: Start Backend (AI services auto-initialize)
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start backend - watch for AI service confirmations
python backend_main.py
```

**Look for these success messages:**
```
INFO: ✓ Ollama AI service initialized
INFO: ✓ FAISS vector database initialized
INFO: ✓ Neo4j graph database initialized
INFO: TriageEngine initialization complete
```

### Step 3: Start Frontend
```powershell
# In a new terminal
npm run dev
```

### Step 4: Test AI Integration
Open browser to `http://localhost:3000`

Test symptoms:
- "chest pain radiating to left arm" → Should detect emergency
- "fever for 4 days" → Should recommend consultation
- "mild headache" → Should suggest self-care

## 🔍 Troubleshooting

### Ollama Issues

**Problem:** `ollama: command not found`
- **Solution:** Restart PowerShell/terminal after installation
- **Or:** Add to PATH: `C:\Program Files\Ollama\`

**Problem:** `Failed to connect to Ollama`
- **Solution:** Check if Ollama service is running:
  ```powershell
  # Windows: Check Task Manager for "ollama"
  # Or restart Ollama Desktop app
  ```

**Problem:** Model download fails
- **Solution:** Check internet connection, try again:
  ```powershell
  ollama pull llama3.2
  ```

### Neo4j Issues

**Problem:** `Failed to connect to Neo4j`
- **Solution:** Check if running:
  ```powershell
  docker ps  # Should show neo4j container
  docker start neo4j  # If not running
  ```

**Problem:** Authentication failed
- **Solution:** Default password is `password`. If changed, update `triage_engine.py` line 48

**Problem:** Port already in use
- **Solution:** Stop existing Neo4j:
  ```powershell
  docker stop neo4j
  docker start neo4j
  ```

### Backend Issues

**Problem:** `WARNING: Neo4j not available: ...`
- **Impact:** System still works! Falls back to Vector DB + AI only
- **Solution:** Neo4j is optional. Install if you want full features.

**Problem:** `WARNING: Ollama AI not available: ...`
- **Impact:** System falls back to graph-based triage
- **Solution:** Make sure Ollama is running and llama3.2 is pulled

**Problem:** `ERROR: Failed to initialize vector database`
- **Solution:** Check `data/` folder permissions, reinstall faiss-cpu:
  ```powershell
  pip install --force-reinstall faiss-cpu
  ```

## ✅ Verification Checklist

Run these checks to ensure everything works:

```python
# Test 1: Ollama connectivity
from ai_service import AIService
ai = AIService()
if ai.check_model_available():
    print("✅ Ollama working!")
else:
    print("❌ Ollama not responding")

# Test 2: Vector DB
from vector_db_service import VectorDBService
vdb = VectorDBService()
results = vdb.get_relevant_knowledge("fever")
print(f"✅ Vector DB working! Found {len(results)} results")

# Test 3: Neo4j
from graph_db_service import GraphDBService
try:
    gdb = GraphDBService()
    print("✅ Neo4j connected!")
except Exception as e:
    print(f"⚠️ Neo4j not available: {e}")
```

## 🎯 Quick Start Summary

**Minimum Setup (5 minutes):**
1. Install Ollama
2. Pull llama3.2 model
3. Run backend (FAISS auto-initializes)
4. ✅ You have AI-powered triage!

**Full Setup (15 minutes):**
1. Install Ollama + pull llama3.2
2. Start Neo4j with Docker
3. Run backend (all services initialize)
4. ✅ You have full three-AI system!

## 📚 Next Steps

- Read the main [README.md](README.md) for API documentation
- Check logs in `logs/triage.log` for debugging
- Test the `/triage` endpoint with different symptoms
- Try the chat interface for conversational AI

## 🔗 Useful Links

- **Ollama Documentation:** [https://github.com/ollama/ollama](https://github.com/ollama/ollama)
- **Neo4j Documentation:** [https://neo4j.com/docs/](https://neo4j.com/docs/)
- **FAISS Documentation:** [https://github.com/facebookresearch/faiss](https://github.com/facebookresearch/faiss)
- **Project GitHub:** [https://github.com/cleora88/amine-project](https://github.com/cleora88/amine-project)

---

**Need Help?** Check the logs or create an issue on GitHub!

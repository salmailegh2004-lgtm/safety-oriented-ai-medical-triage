# 🏥 Medical Triage Assistant

A professional medical triage system with AI-powered symptom analysis, built with FastAPI (Python) and React (TypeScript). Provides intelligent urgency classification, patient history tracking, and real-time performance monitoring.

## ✨ Features

- **🚨 Smart Triage System**: Rule-based symptom analysis with three urgency levels
  - **Urgence** (Emergency): Immediate medical attention required
  - **Consultation**: Healthcare professional needed within 24-48h
  - **Auto-soin** (Self-care): Mild symptoms, self-care appropriate

- **💬 AI Chat Assistant**: Conversational interface for medical guidance
- **📊 Real-time Metrics Dashboard**: Performance monitoring and analytics
- **📝 Patient History Tracking**: Persistent triage history with GDPR compliance
- **🎨 Modern UI**: Dark theme with gradient accents and smooth animations
- **🔒 CORS Security**: Restricted to localhost for development safety
- **📈 Performance Monitoring**: Latency tracking, error rates, usage patterns

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** (Tested with Python 3.14)
- **Node.js 16+** (Tested with Node.js 24.11.1)
- **npm 7+** (Tested with npm 11.6.2)

### Installation

1. **Clone the repository**
```bash
cd "c:\Users\User\Downloads\amine project"
```

2. **Backend Setup**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
# Install Node dependencies
npm install
```

### Running the Application

**Terminal 1 - Backend Server:**
```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start FastAPI server
python backend_main.py
```
Backend runs on: **http://localhost:8000**  
API Documentation: **http://localhost:8000/docs**

**Terminal 2 - Frontend Server:**
```bash
# Start Vite dev server
npm run dev
```
Frontend runs on: **http://localhost:3000**

## 📁 Project Structure

```
amine-project/
├── backend_main.py              # FastAPI application server
├── triage_engine.py             # Symptom analysis engine
├── monitoring_service.py        # Performance metrics tracking
├── requirements.txt             # Python dependencies
├── package.json                 # Node.js dependencies
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── medical_triage_app.tsx       # Main React component
├── index.html                   # HTML entry point
├── src/
│   └── main.tsx                 # React entry point
├── data/                        # Persistent data storage
│   ├── triage_history.json      # Patient history
│   └── metrics.json             # Performance metrics
└── logs/
    └── triage.log               # Application logs
```

## 🔌 API Endpoints

### Triage
- **POST** `/triage` - Analyze symptoms and determine urgency
  ```json
  {
    "symptoms": "chest pain radiating to left arm",
    "age": 45,
    "allergies": "none"
  }
  ```

### Chat
- **POST** `/chat` - Conversational medical guidance
  ```json
  {
    "message": "What should I do about a fever?"
  }
  ```

### History
- **GET** `/history` - Retrieve patient triage history (last 50)
- **DELETE** `/history` - Clear all history (GDPR compliance)

### Monitoring
- **GET** `/metrics` - System performance metrics
- **GET** `/health` - Health check with component status

## 🛠️ Configuration

### Backend Configuration (`backend_main.py`)

```python
# CORS Settings (Line ~70)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Change for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Server Settings (Line ~363)
uvicorn.run(
    app, 
    host="0.0.0.0",  # Change to specific IP in production
    port=8000,
    log_level="info"
)
```

### Frontend Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  server: {
    port: 3000,  // Change frontend port here
  }
})
```

## 📊 Triage Logic

### Emergency Patterns
- Chest pain with arm radiation
- Difficulty breathing / Shortness of breath
- Neurological symptoms (slurred speech, facial droop, weakness)

### Consultation Patterns
- Fever lasting 3+ days or ≥39°C
- Infected wounds (redness, swelling, pus)

### Self-Care Patterns
- Common cold symptoms
- Mild headaches
- General fatigue

## 🧪 Testing

Run the test script:
```bash
python test_script.py
```

## 📝 Logging

Logs are written to:
- **File**: `logs/triage.log`
- **Console**: Real-time output

Log format includes:
- Timestamp
- Log level (INFO, WARNING, ERROR, CRITICAL)
- File and line number
- Message

## 🔐 Security Features

- **Input Validation**: Pydantic models with custom validators
- **CORS Restrictions**: Localhost-only in development
- **Error Handling**: Comprehensive try/catch with proper HTTP status codes
- **Logging**: Full audit trail with stack traces for errors

## 📈 Performance Monitoring

The monitoring service tracks:
- **Request Count**: Total API calls
- **Latency**: Average and recent response times
- **Error Rates**: Overall and recent error percentages
- **Urgency Distribution**: Classification statistics
- **Uptime**: System availability tracking

Access metrics at: `http://localhost:8000/metrics`

## 🚀 Production Deployment

### Environment Variables
```bash
ENV=production  # Triggers production mode in startup logs
```

### Recommended Changes
1. **Update CORS origins** to production domain
2. **Change host** from `0.0.0.0` to specific IP
3. **Enable HTTPS** with SSL certificates
4. **Use production ASGI server** (Gunicorn + Uvicorn workers)
5. **Set up database** for history (replace JSON files)
6. **Configure log rotation** for production logs
7. **Add authentication** for sensitive endpoints

### Production Command
```bash
gunicorn backend_main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --log-level info \
  --access-logfile logs/access.log \
  --error-logfile logs/error.log
```

## 📦 Dependencies

### Backend
- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **Requests**: HTTP library

### Frontend
- **React 18.3.1**: UI framework
- **TypeScript 5.5.3**: Type safety
- **Vite 5.4.21**: Build tool
- **Lucide React**: Icons

## 🐛 Troubleshooting

### Backend won't start
- Ensure virtual environment is activated
- Check port 8000 is not in use: `netstat -ano | findstr :8000`
- Verify Python version: `python --version`

### Frontend won't start
- Clear node_modules and reinstall: `rm -r node_modules; npm install`
- Check port 3000 is available
- Verify Node version: `node --version`

### API calls fail
- Check backend is running on port 8000
- Verify CORS settings allow frontend origin
- Check browser console for detailed errors

## 📄 License

This project is provided as-is for educational and development purposes.

## 👥 Contributing

Contributions welcome! Please ensure:
- Code follows existing style (type hints, docstrings)
- All tests pass
- New features include documentation
- Commit messages are descriptive

## 🔗 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Built with ❤️ for better healthcare triage**

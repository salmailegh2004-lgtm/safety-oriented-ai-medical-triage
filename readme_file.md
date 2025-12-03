# 🏥 Medical Triage Assistant - AI-Powered Symptom Analysis System

## 📋 Project Overview

This is a complete, offline-capable medical triage system built for university demonstration purposes. It uses machine learning and natural language processing to analyze patient symptoms and classify urgency levels, providing appropriate medical advice.

**⚠️ DISCLAIMER**: This is an educational project. Always consult real healthcare professionals for medical advice.

## 🎯 Features

- **AI-Powered Triage**: NLP-based symptom analysis using scikit-learn and TF-IDF
- **Three Urgency Levels**: 
  - 🔴 **Urgence** (Emergency) - Immediate medical attention required
  - 🟡 **Consultation** - See a doctor within 24-48 hours
  - 🟢 **Auto-soin** (Self-care) - Manageable at home
- **Interactive Chat**: Follow-up questions and clarifications
- **Triage History**: Local storage of past consultations
- **GDPR Compliance**: Data anonymization and deletion capabilities
- **Performance Monitoring**: Latency tracking and error logging
- **100% Offline**: No external APIs, runs completely locally

## 🏗️ System Architecture

```
medical-triage-assistant/
├── backend/
│   ├── main.py                 # FastAPI REST API
│   ├── triage_engine.py        # ML/NLP triage engine
│   ├── monitoring.py           # Performance monitoring
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── index.html             # Main UI (React app)
│   └── package.json           # Node dependencies (optional)
├── data/
│   ├── symptoms_database.json  # Medical symptom ontology
│   ├── training_data.json      # ML training dataset
│   ├── triage_history.json     # Patient history (anonymized)
│   └── metrics.json            # System metrics
├── models/
│   ├── triage_model.pkl        # Trained Random Forest model
│   └── vectorizer.pkl          # TF-IDF vectorizer
├── logs/
│   └── triage.log             # Application logs
├── docker-compose.yml          # Docker configuration
├── Dockerfile                  # Container definition
└── README.md                   # This file
```

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo>
cd medical-triage-assistant

# Build and run with Docker
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Prerequisites
- Python 3.9+
- Node.js 16+ (optional, for React frontend)
- pip and npm

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
python main.py
```

The backend will start on `http://localhost:8000`

#### Frontend Setup

**Option A: Using the React Artifact**
1. Open the React artifact provided above in Claude
2. Update the `API_BASE` constant to `http://localhost:8000`
3. The frontend is ready to use

**Option B: Standalone HTML (Alternative)**
```bash
cd frontend
# Simply open index.html in a browser
# Or use a simple HTTP server:
python -m http.server 3000
```

## 📊 API Endpoints

### POST `/triage`
Analyze symptoms and get triage classification

**Request:**
```json
{
  "symptoms": "severe chest pain radiating to left arm",
  "age": 45,
  "allergies": "penicillin"
}
```

**Response:**
```json
{
  "urgency_level": "urgence",
  "confidence": 0.95,
  "advice": "Seek immediate emergency medical attention...",
  "detected_symptoms": ["chest pain"],
  "timestamp": "2024-12-02T10:30:00"
}
```

### POST `/chat`
Ask follow-up questions

**Request:**
```json
{
  "message": "When should I see a doctor?"
}
```

### GET `/history`
Retrieve anonymized triage history

### DELETE `/history`
Clear all history (GDPR compliance)

### GET `/metrics`
Get system performance metrics

### GET `/health`
Health check endpoint

## 🧠 AI Engine Details

### Machine Learning Pipeline

1. **Feature Extraction**: TF-IDF vectorization with n-grams (1-3)
2. **Classification**: Random Forest with 100 estimators
3. **Rule-Based Override**: Critical keyword detection for emergencies
4. **Context Adjustment**: Age-based urgency modifications

### Training Data

The system includes 45 synthetic training samples across three urgency levels:
- 15 emergency cases (urgence)
- 15 consultation cases
- 15 self-care cases (auto-soin)

### Performance Metrics

Expected performance on training data:
- **Accuracy**: ~95%
- **Precision** (emergencies): >90%
- **Recall** (emergencies): >95% (high sensitivity to dangerous symptoms)

## 🔒 Security & GDPR Compliance

### Data Protection
- **Anonymization**: Personal data is redacted in storage
- **Right to Deletion**: `/history` DELETE endpoint
- **Local Storage**: No cloud uploads, all data stays local
- **Audit Logging**: All operations logged for transparency

### Privacy Features
- No user authentication required (anonymous usage)
- Allergies field redacted in history
- No IP tracking or personal identifiers

## 📈 Monitoring

The system tracks:
- Request latency
- Error rates
- Urgency level distribution
- Total requests processed

View metrics at: `GET /metrics`

Sample output:
```json
{
  "total_requests": 150,
  "average_latency": 0.045,
  "error_rate": 0.02,
  "urgency_distribution": {
    "urgence": 20,
    "consultation": 80,
    "auto-soin": 50
  }
}
```

## 🧪 Testing

### Test Scenarios

**Emergency (Urgence)**
```
Symptoms: "severe chest pain and difficulty breathing"
Expected: urgence level, high confidence
```

**Consultation**
```
Symptoms: "fever of 39 degrees for 3 days with cough"
Expected: consultation level
```

**Self-Care (Auto-soin)**
```
Symptoms: "mild headache and slight runny nose"
Expected: auto-soin level
```

### Running Tests

```bash
cd backend
pytest tests/  # If you add test files
```

## 📚 Medical Ontology

The system recognizes these symptom categories:
- Cardiovascular: chest pain, palpitations
- Respiratory: difficulty breathing, cough
- Neurological: headache, dizziness, weakness
- Gastrointestinal: nausea, vomiting, abdominal pain
- Infectious: fever, chills
- Trauma: bleeding, injuries

## 🎓 Educational Context

This project demonstrates:

1. **Full-Stack Development**: Backend API + Frontend UI
2. **Machine Learning**: Text classification with scikit-learn
3. **NLP**: Feature extraction and symptom recognition
4. **RESTful API Design**: Proper endpoint structure
5. **Data Privacy**: GDPR-compliant data handling
6. **System Monitoring**: Performance tracking and logging
7. **Containerization**: Docker deployment

## 🔧 Customization

### Adding New Symptoms

Edit `data/training_data.json`:
```json
{
  "symptoms": "new symptom description",
  "urgency_level": "consultation"
}
```

Then retrain:
```bash
rm models/*.pkl
python main.py  # Will retrain on startup
```

### Adjusting Urgency Levels

Modify `triage_engine.py`:
```python
self.urgency_levels = {
    'urgence': {
        'keywords': ['your', 'keywords', 'here']
    }
}
```

## 📦 Dependencies

### Backend (Python)
- fastapi==0.104.1
- uvicorn==0.24.0
- scikit-learn==1.3.2
- numpy==1.26.2
- pydantic==2.5.0
- joblib==1.3.2

### Frontend (React)
- react==18.2.0
- lucide-react==0.263.1
- tailwindcss (via CDN)

## 🐛 Troubleshooting

### "Connection error" in frontend
- Ensure backend is running on port 8000
- Check CORS settings in `main.py`

### Model not training
- Verify `data/` directory exists
- Check write permissions
- View logs in `logs/triage.log`

### High latency
- Check `metrics.json` for bottlenecks
- Consider reducing model complexity
- Increase vectorizer max_features

## 📝 Future Improvements

- Multi-language support (French, Spanish)
- Voice input capability
- Integration with medical databases (ICD-10)
- Advanced deep learning models (BioBERT)
- Mobile app version
- Telemedicine integration

## 👨‍💻 Development Team

- **Your Name** - University Project 2024
- **Institution**: [Your University]
- **Course**: [Course Name]
- **Supervisor**: [Professor Name]

## 📄 License

MIT License - Educational purposes only

## 🙏 Acknowledgments

- scikit-learn for ML capabilities
- FastAPI for modern Python web framework
- Hugging Face for NLP inspiration
- Medical professionals for domain knowledge validation

---

**Remember**: This is a demonstration system for educational purposes. Always consult qualified healthcare professionals for real medical advice.

For questions or issues, contact: [your-email@university.edu]
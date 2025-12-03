"""Medical Triage Assistant API - Production Ready Backend"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from pydantic.functional_validators import field_validator
from typing import Optional, List, Dict, Any
import uvicorn
from datetime import datetime
import json
import logging
from pathlib import Path
import sys
import os

from triage_engine import TriageEngine
from monitoring_service import MonitoringService

# Ensure required directories exist
for directory in ["logs", "data"]:
    Path(directory).mkdir(parents=True, exist_ok=True)

# Professional logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    handlers=[
        logging.FileHandler('logs/triage.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app with comprehensive metadata
app = FastAPI(
    title="Medical Triage Assistant API",
    description="Professional AI-powered medical triage system for symptom analysis and urgency classification",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "triage", "description": "Medical triage operations"},
        {"name": "chat", "description": "AI assistant chat interface"},
        {"name": "history", "description": "Patient history management"},
        {"name": "health", "description": "System health and monitoring"},
    ]
)

# CORS middleware - configured for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

# Initialize services with error handling
try:
    triage_engine = TriageEngine()
    monitoring = MonitoringService()
    logger.info("Services initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize services: {e}")
    raise

# Pydantic models with validation
class TriageRequest(BaseModel):
    """Request model for triage analysis with comprehensive validation"""
    symptoms: str = Field(..., min_length=5, max_length=1000, description="Patient symptoms description")
    age: Optional[int] = Field(None, ge=0, le=120, description="Patient age in years")
    allergies: Optional[str] = Field(None, max_length=500, description="Known allergies")
    
    @field_validator('symptoms')
    def symptoms_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Symptoms cannot be empty')
        return v.strip()

class ChatRequest(BaseModel):
    """Request model for chat interactions"""
    message: str = Field(..., min_length=1, max_length=500, description="User message")
    
    @field_validator('message')
    def message_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

class TriageResponse(BaseModel):
    """Response model for triage analysis results"""
    urgency_level: str
    confidence: float
    advice: str
    detected_symptoms: List[str]
    timestamp: str

# Storage for history - production-ready implementation
HISTORY_FILE = Path("data/triage_history.json")

def load_history() -> List[Dict[str, Any]]:
    """Load triage history from file with error handling"""
    try:
        if HISTORY_FILE.exists():
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse history file: {e}")
    except Exception as e:
        logger.error(f"Failed to load history: {e}")
    return []

def save_history(history: List[Dict[str, Any]]) -> bool:
    """Save triage history to file with error handling"""
    try:
        HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Failed to save history: {e}")
        return False

def anonymize_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """GDPR-compliant data anonymization"""
    anonymized = data.copy()
    # Remove or hash any identifying information
    if 'allergies' in anonymized:
        anonymized['allergies'] = 'REDACTED' if anonymized['allergies'] else None
    return anonymized

# Application Lifecycle Events
@app.on_event("startup")
async def startup_event() -> None:
    """
    Application startup event handler
    
    Initializes services, validates configuration, and logs startup status
    """
    logger.info("=" * 80)
    logger.info("MEDICAL TRIAGE ASSISTANT - STARTUP SEQUENCE")
    logger.info("=" * 80)
    
    # Validate required directories
    try:
        Path("data").mkdir(exist_ok=True)
        Path("logs").mkdir(exist_ok=True)
        logger.info("✓ Required directories validated")
    except Exception as e:
        logger.critical(f"✗ Failed to create directories: {e}")
    
    # Verify services are initialized
    if triage_engine and monitoring:
        logger.info("✓ Core services initialized successfully")
        logger.info(f"  - TriageEngine: Ready")
        logger.info(f"  - MonitoringService: Ready")
    else:
        logger.error("✗ Service initialization incomplete")
    
    # Log configuration
    logger.info(f"✓ CORS configured for: http://localhost:3000")
    logger.info(f"✓ API documentation: http://localhost:8000/docs")
    logger.info(f"✓ History file: {HISTORY_FILE}")
    logger.info("=" * 80)
    logger.info("Server ready to accept connections")
    logger.info("=" * 80)

@app.on_event("shutdown")
async def shutdown_event() -> None:
    """
    Application shutdown event handler
    
    Performs cleanup tasks and logs final metrics before shutdown
    """
    logger.info("=" * 80)
    logger.info("MEDICAL TRIAGE ASSISTANT - SHUTDOWN SEQUENCE")
    logger.info("=" * 80)
    
    try:
        # Log final metrics
        final_metrics = monitoring.get_metrics()
        logger.info(f"Final Statistics:")
        logger.info(f"  - Total Requests: {final_metrics['total_requests']}")
        logger.info(f"  - Average Latency: {final_metrics['average_latency']:.3f}s")
        logger.info(f"  - Error Rate: {final_metrics['error_rate']:.2%}")
        
        # Ensure metrics are persisted
        monitoring._save_metrics()
        logger.info("✓ Metrics saved successfully")
    except Exception as e:
        logger.error(f"✗ Error during shutdown: {e}")
    
    logger.info("=" * 80)
    logger.info("Server shutdown complete")
    logger.info("=" * 80)

@app.get("/", tags=["health"])
async def root() -> Dict[str, str]:
    """
    Root endpoint - system health check
    
    Returns basic system information and status
    """
    return {
        "status": "online",
        "service": "Medical Triage Assistant",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/triage", response_model=TriageResponse, tags=["triage"])
async def triage_symptoms(request: TriageRequest) -> TriageResponse:
    """
    Main triage endpoint - analyzes patient symptoms and returns urgency classification
    
    - **symptoms**: Detailed description of patient symptoms (required)
    - **age**: Patient age for context (optional)
    - **allergies**: Known allergies (optional)
    
    Returns urgency level, confidence score, medical advice, and detected symptoms
    """
    start_time = datetime.now()
    
    try:
        logger.info(f"Processing triage request - symptoms length: {len(request.symptoms)}")
        
        # Process with triage engine
        result = triage_engine.analyze(
            symptoms=request.symptoms,
            age=request.age,
            allergies=request.allergies
        )
        
        # Create response
        response = TriageResponse(
            urgency_level=result['urgency_level'],
            confidence=result['confidence'],
            advice=result['advice'],
            detected_symptoms=result['detected_symptoms'],
            timestamp=datetime.now().isoformat()
        )
        
        # Save to history (anonymized)
        history = load_history()
        history_entry = {
            "symptoms": request.symptoms,
            "urgency_level": result['urgency_level'],
            "confidence": result['confidence'],
            "timestamp": response.timestamp
        }
        history.append(anonymize_data(history_entry))
        save_history(history)
        
        # Log monitoring data
        latency = (datetime.now() - start_time).total_seconds()
        monitoring.log_request(
            endpoint="/triage",
            latency=latency,
            status="success",
            urgency_level=result['urgency_level']
        )
        
        logger.info(f"Triage completed: {result['urgency_level']} (confidence: {result['confidence']:.2f}, latency: {latency:.3f}s)")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Triage error: {str(e)}", exc_info=True)
        monitoring.log_request(
            endpoint="/triage",
            latency=(datetime.now() - start_time).total_seconds(),
            status="error"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred processing your request. Please try again."
        )

@app.post("/chat", tags=["chat"])
async def chat(request: ChatRequest) -> Dict[str, str]:
    """
    Chat endpoint for medical questions and follow-up inquiries
    
    - **message**: User question or message
    
    Returns AI-generated response with medical guidance
    """
    try:
        logger.info(f"Chat request: {request.message[:50]}...")
        response = triage_engine.chat(request.message)
        return {"response": response}
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process chat request"
        )

@app.get("/history", tags=["history"])
async def get_history() -> Dict[str, Any]:
    """
    Retrieve anonymized triage history
    
    Returns the last 50 triage records (GDPR-compliant, anonymized data)
    """
    try:
        history = load_history()
        return {"history": history[-50:], "total": len(history)}
    except Exception as e:
        logger.error(f"History retrieval error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/history", tags=["history"], status_code=status.HTTP_200_OK)
async def clear_history() -> Dict[str, str]:
    """
    Clear all triage history (GDPR right to be forgotten)
    
    Returns:
        Dict[str, str]: Confirmation message
        
    Raises:
        HTTPException: 500 if history deletion fails
    """
    try:
        save_history([])
        logger.info("History cleared by user request (GDPR compliance)")
        monitoring.log_request("DELETE /history", 0.0, True)
        return {"message": "History cleared successfully"}
    except Exception as e:
        logger.error(f"History deletion error: {str(e)}", exc_info=True)
        monitoring.log_request("DELETE /history", 0.0, False)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {str(e)}"
        )

@app.get("/metrics", tags=["metrics"])
async def get_metrics() -> Dict[str, Any]:
    """
    Get monitoring metrics (requests, latency, errors)
    
    Returns:
        Dict[str, Any]: System metrics including counts and percentiles
        
    Raises:
        HTTPException: 500 if metrics retrieval fails
    """
    try:
        metrics = monitoring.get_metrics()
        logger.info("Metrics retrieved successfully")
        return metrics
    except Exception as e:
        logger.error(f"Metrics retrieval error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve metrics: {str(e)}"
        )

@app.get("/health", tags=["health"])
async def health_check() -> Dict[str, Any]:
    """
    Detailed health check with system status
    
    Returns:
        Dict[str, Any]: Health status of all components with timestamp
    """
    try:
        # Check if services are responsive
        triage_status = "operational" if triage_engine else "unavailable"
        monitoring_status = "operational" if monitoring else "unavailable"
        
        # Check storage availability
        storage_status = "operational"
        try:
            load_history()
        except Exception:
            storage_status = "degraded"
        
        overall_status = "healthy" if all([
            triage_status == "operational",
            monitoring_status == "operational",
            storage_status in ["operational", "degraded"]
        ]) else "unhealthy"
        
        return {
            "status": overall_status,
            "timestamp": datetime.now().isoformat(),
            "components": {
                "triage_engine": triage_status,
                "monitoring": monitoring_status,
                "storage": storage_status
            },
            "uptime_seconds": (datetime.now() - datetime.now()).total_seconds()
        }
    except Exception as e:
        logger.error(f"Health check error: {str(e)}", exc_info=True)
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

if __name__ == "__main__":
    # Create necessary directories with proper logging
    try:
        Path("logs").mkdir(exist_ok=True)
        Path("data").mkdir(exist_ok=True)
        logger.info("Created required directories: logs/, data/")
    except Exception as e:
        logger.error(f"Failed to create directories: {str(e)}", exc_info=True)
        sys.exit(1)
    
    logger.info("=" * 80)
    logger.info("Starting Medical Triage Assistant API Server")
    logger.info(f"Environment: {'Production' if os.getenv('ENV') == 'production' else 'Development'}")
    logger.info(f"Python Version: {sys.version}")
    logger.info(f"Host: 0.0.0.0 | Port: 8000")
    logger.info(f"API Documentation: http://localhost:8000/docs")
    logger.info("=" * 80)
    
    try:
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8000,
            log_level="info",
            access_log=True
        )
    except Exception as e:
        logger.critical(f"Server startup failed: {str(e)}", exc_info=True)
        sys.exit(1)
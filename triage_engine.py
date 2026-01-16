"""
Medical Triage Engine Module - AI-Powered Version

Integrates:
- Ollama AI for intelligent symptom analysis
- FAISS Vector Database for medical knowledge retrieval
- Neo4j Graph Database for symptom-disease relationships
"""

from typing import Optional, Dict, List
import logging
from ai_service import AIService
from vector_db_service import VectorDBService
from graph_db_service import GraphDBService

logger = logging.getLogger(__name__)


class TriageEngine:
    """
    AI-powered triage engine for medical symptom analysis.
    
    Combines three AI technologies:
    1. Ollama LLM for natural language understanding and analysis
    2. Vector DB for semantic search of medical knowledge
    3. Graph DB for symptom-disease relationship mapping
    """

    def __init__(self) -> None:
        """Initialize the triage engine with AI services."""
        logger.info("Initializing AI-powered TriageEngine...")
        
        try:
            # Initialize AI service (Ollama)
            self.ai_service = AIService(model="llama3.2")
            logger.info("✓ Ollama AI service initialized")
        except Exception as e:
            logger.warning(f"Ollama AI not available: {e}")
            self.ai_service = None
        
        try:
            # Initialize Vector Database (FAISS)
            self.vector_db = VectorDBService()
            logger.info("✓ FAISS vector database initialized")
        except Exception as e:
            logger.error(f"Failed to initialize vector database: {e}")
            self.vector_db = None
        
        # Initialize Graph Database (Neo4j) - optional
        self.graph_db = None
        try:
            self.graph_db = GraphDBService(
                uri="bolt://localhost:7687",
                user="neo4j",
                password="password"  # TODO: Use environment variable
            )
            logger.info("✓ Neo4j graph database initialized")
        except Exception as e:
            logger.warning(f"Neo4j not available: {str(e)[:100]}. Using fallback.")
            self.graph_db = None
        
        logger.info("TriageEngine initialization complete")
        self.cache = {}
    def analyze(
        self, 
        symptoms: str, 
        age: Optional[int] = None, 
        allergies: Optional[str] = None
    ) -> Dict:
        """
        Analyze patient symptoms using AI and knowledge bases.
        
        Args:
            symptoms: Patient symptom description
            age: Patient age (optional)
            allergies: Known allergies (optional)
            
        Returns:
            Dict with urgency_level, confidence, advice, detected_symptoms
        """
        logger.info(f"Analyzing symptoms: {symptoms[:50]}...")
        
        # 1. Get relevant medical knowledge from Vector DB
        relevant_knowledge = []
        if self.vector_db:
            try:
                relevant_knowledge = []
                if self.vector_db and len(symptoms.split()) > 6:
                 relevant_knowledge = self.vector_db.get_relevant_knowledge(symptoms, k=2)
                logger.info(f"Retrieved {len(relevant_knowledge)} relevant documents from vector DB")
            except Exception as e:
                logger.warning(f"Vector DB query failed: {e}")
        
        # 2. Query Graph DB for symptom-disease relationships
        graph_insights = []
        if self.graph_db:
            try:
                # Extract simple symptom keywords for graph query
                symptom_keywords = symptoms.lower().split()
                graph_insights = self.graph_db.find_related_diseases(symptom_keywords)
                logger.info(f"Found {len(graph_insights)} related diseases in graph DB")
            except Exception as e:
                logger.warning(f"Graph DB query failed: {e}")
        
        # 3. Use AI for comprehensive analysis
        if self.ai_service:
            try:
                # Add context from knowledge bases to AI prompt
                context_info = ""
                if relevant_knowledge:
                    context_info += "\n\nRelevant medical knowledge:\n"
                    for doc in relevant_knowledge[:2]:
                        context_info += f"- {doc['text']}\n"
                
                if graph_insights:
                    context_info += "\n\nRelated conditions from knowledge graph:\n"
                    for insight in graph_insights[:3]:
                        context_info += f"- {insight['disease']} (urgency: {insight['urgency']}, confidence: {insight['confidence']:.2f})\n"
                
                enhanced_symptoms = symptoms + context_info
                result = self.ai_service.analyze_symptoms(enhanced_symptoms, age, allergies)
                logger.info(f"AI analysis complete: {result['urgency_level']}")
                return result
                
            except Exception as e:
                logger.error(f"AI analysis failed: {e}")
        
        # Fallback: Use graph insights if available
        # =========================

                if graph_insights:
                    top = graph_insights[0]
                    if top["confidence"] >= 0.6:
                        result = {
            "urgency_level": top["urgency"],
            "confidence": top["confidence"],
            "advice": (
                f"Based on detected symptoms, {top['disease']} is a possibility. "
                "Please consult a healthcare professional."
            ),
            "detected_symptoms": symptoms.split()[:5]
        }

        # cache result
        self.cache[symptoms.lower().strip()] = result
        return result

    def chat(self, message: str) -> str:
        """
        Provide conversational responses to patient questions using AI.
        
        Args:
            message: Patient question or statement
            
        Returns:
            AI-generated response string
        """
        if not message or not message.strip():
            logger.warning("Empty message provided to chat()")
            raise ValueError("Message cannot be empty")
        
        logger.info(f"Chat request: {message[:50]}...")
        
        # Use AI service for chat
        if self.ai_service:
            try:
                response = self.ai_service.chat(message)
                return response
            except Exception as e:
                logger.error(f"AI chat failed: {e}")
        
        # Fallback response
        return (
            "I'm here to help with medical triage guidance. Please describe your symptoms "
            "for a comprehensive analysis, or consult a healthcare professional directly."
        )

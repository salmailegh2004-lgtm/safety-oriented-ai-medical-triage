"""AI Service using Ollama for medical triage analysis"""
import ollama
import logging
from typing import Dict, Any, List, Optional
import json

logger = logging.getLogger(__name__)


class AIService:
    """Ollama-powered AI service for medical analysis"""

    def __init__(self, model: str = "llama3.2"):
        """
        Initialize AI service with Ollama

        Args:
            model: Ollama model to use (default: llama3.2)
        """
        self.model = model

        # 🔴 TRIAGE PROMPT (STRUCTURED, JSON OUTPUT)
        self.triage_prompt = """You are a professional medical triage assistant.

Your task:
- Analyze patient symptoms
- Determine urgency level (CRITICAL, HIGH, MODERATE, LOW, MINIMAL)
- Estimate confidence between 0.0 and 1.0
- Provide safe medical advice
- Extract detected symptoms

Rules:
- Respond ONLY with valid JSON
- No explanations outside JSON
- When in doubt, prioritize patient safety
"""

        # 🟢 CHAT PROMPT (EDUCATIONAL, NON-DIAGNOSTIC)
        self.chat_prompt = """You are a medical information assistant.

Rules:
- Do NOT diagnose diseases
- Do NOT prescribe medication or dosages
- Provide general medical information only
- Explain symptoms in an educational way
- Clearly state when medical attention should be sought
- Be calm, helpful, and supportive
"""

        logger.info(f"AIService initialized with model: {model}")

    # ==========================================================
    # 🔴 TRIAGE ANALYSIS
    # ==========================================================
    def analyze_symptoms(
        self,
        symptoms: str,
        age: Optional[int] = None,
        allergies: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze patient symptoms using Ollama
        """

        try:
            context = f"Symptoms: {symptoms}"
            if age is not None:
                context += f"\nAge: {age} years"
            if allergies:
                context += f"\nAllergies: {allergies}"

            user_prompt = f"""{context}

Provide a medical triage assessment in this JSON format:
{{
  "urgency_level": "CRITICAL/HIGH/MODERATE/LOW/MINIMAL",
  "confidence": 0.0,
  "advice": "medical advice",
  "detected_symptoms": ["symptom1", "symptom2"]
}}
"""

            response = ollama.chat(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.triage_prompt},
                    {"role": "user", "content": user_prompt},
                ]
            )

            response_text = response["message"]["content"].strip()

            # Handle fenced code blocks if present
            if "```" in response_text:
                response_text = response_text.split("```")[1].strip()

            result = json.loads(response_text)

            logger.info(
                f"AI triage complete: {result['urgency_level']} "
                f"(confidence: {result['confidence']})"
            )
            return result

        except Exception as e:
            logger.error(f"AI triage failed: {e}", exc_info=True)
            return {
                "urgency_level": "MODERATE",
                "confidence": 0.5,
                "advice": (
                    "Unable to analyze symptoms with AI. "
                    "Please consult a healthcare professional."
                ),
                "detected_symptoms": [symptoms[:100]],
            }

    # ==========================================================
    # 🟢 CHAT / ASK QUESTIONS
    # ==========================================================
    def chat(
        self,
        message: str,
        context: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Chat with AI assistant about medical questions
        """

        try:
            messages = [{"role": "system", "content": self.chat_prompt}]

            if context:
                messages.extend(context)

            messages.append({"role": "user", "content": message})

            response = ollama.chat(
                model=self.model,
                messages=messages
            )

            return response["message"]["content"]

        except Exception as e:
            logger.error(f"Chat failed: {e}", exc_info=True)
            return (
                "I can provide general medical information, but if your "
                "symptoms are severe or persistent, please consult a "
                "healthcare professional."
            )

    # ==========================================================
    # 🔍 MODEL CHECK
    # ==========================================================
    def check_model_available(self) -> bool:
        """Check if the Ollama model is available"""
        try:
            ollama.list()
            return True
        except Exception as e:
            logger.warning(f"Ollama not available: {e}")
            return False

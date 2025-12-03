"""
Medical Triage Engine Module

This module provides a rule-based medical triage system that analyzes patient symptoms
and determines appropriate urgency levels (emergency, consultation, self-care).
"""

from typing import Optional, Dict, List, Tuple
import re
import logging

logger = logging.getLogger(__name__)


class TriageEngine:
    """
    Rule-based triage engine for medical symptom analysis.
    
    Classifies patient symptoms into three urgency levels:
    - urgence: Emergency requiring immediate medical attention
    - consultation: Requires healthcare professional within 24-48h
    - auto-soin: Self-care appropriate for mild symptoms
    
    Uses pattern matching against predefined symptom patterns with
    confidence scoring based on number and severity of matches.
    """

    EMERGENCY_PATTERNS: List[str] = [
        r"\bchest pain\b",
        r"radiating to left arm",
        r"difficulty breathing|shortness of breath",
        r"slurred speech|face droop|weakness on one side|one side of body",
        r"sudden weakness"
    ]

    CONSULTATION_PATTERNS: List[str] = [
        r"\bfever\b.*(3\s*days|three\s*days|39)",
        r"infected wound|wound.*(red|redness|swelling|pus)"
    ]

    SELF_CARE_PATTERNS: List[str] = [
        r"common cold|runny nose",
        r"mild headache|slight headache|feeling tired"
    ]

    def __init__(self) -> None:
        """Initialize the triage engine with predefined patterns."""
        logger.info("TriageEngine initialized with pattern-based rules")

    def _detect(self, text: str, patterns: List[str]) -> List[str]:
        """
        Detect matching patterns in symptom text.
        
        Args:
            text: Patient symptom description
            patterns: List of regex patterns to match
            
        Returns:
            List of matched pattern strings
        """
        found: List[str] = []
        for pattern in patterns:
            if re.search(pattern, text, flags=re.IGNORECASE):
                found.append(pattern)
        return found

    def _extract_symptoms(self, text: str) -> List[str]:
        """
        Extract specific symptoms from text using keyword matching.
        
        Args:
            text: Patient symptom description
            
        Returns:
            List of identified symptom keywords
        """
        detected_symptoms: List[str] = []
        
        symptom_keywords: List[Tuple[str, str]] = [
            (r"chest pain", "chest pain"),
            (r"left arm", "arm radiation"),
            (r"breath|breathing", "breathing difficulty"),
            (r"slurred speech|weakness", "neurological deficit"),
            (r"fever|39", "fever"),
            (r"cough", "cough"),
            (r"infected wound|wound", "wound infection"),
            (r"runny nose|cold", "common cold"),
            (r"headache", "headache"),
        ]
        
        for pattern, symptom_name in symptom_keywords:
            if re.search(pattern, text, re.IGNORECASE):
                detected_symptoms.append(symptom_name)
        
        return detected_symptoms if detected_symptoms else ["unspecified"]

    def analyze(
        self, 
        symptoms: str, 
        age: Optional[int] = None, 
        allergies: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Analyze patient symptoms and determine urgency level.
        
        Args:
            symptoms: Patient symptom description
            age: Patient age (optional, for future risk stratification)
            allergies: Known allergies (optional, for future medication guidance)
            
        Returns:
            Dictionary containing:
                - urgency_level: "urgence" | "consultation" | "auto-soin"
                - confidence: Float between 0-1
                - advice: Professional medical guidance string
                - detected_symptoms: List of identified symptoms
                
        Raises:
            ValueError: If symptoms string is empty or invalid
        """
        if not symptoms or not symptoms.strip():
            logger.warning("Empty symptoms provided to analyze()")
            raise ValueError("Symptoms cannot be empty")
        
        text = symptoms.strip()
        logger.info(f"Analyzing symptoms: {text[:100]}...")

        # Pattern detection
        emergency_hits = self._detect(text, self.EMERGENCY_PATTERNS)
        consultation_hits = self._detect(text, self.CONSULTATION_PATTERNS)
        selfcare_hits = self._detect(text, self.SELF_CARE_PATTERNS)

        detected_symptoms = self._extract_symptoms(text)

        # Urgency classification with confidence scoring
        if emergency_hits:
            urgency = "urgence"
            confidence = 0.9 if len(emergency_hits) >= 2 else 0.85
            advice = (
                "Emergency signs detected. Call your local emergency number or go to the nearest ER immediately. "
                "Do not delay seeking care."
            )
            logger.warning(f"EMERGENCY detected: {emergency_hits}")
        elif consultation_hits:
            urgency = "consultation"
            confidence = 0.7
            advice = (
                "Your symptoms suggest you should see a healthcare professional soon. "
                "Book a consultation within 24–48 hours or sooner if symptoms worsen."
            )
            logger.info(f"Consultation recommended: {consultation_hits}")
        else:
            urgency = "auto-soin"
            confidence = 0.7 if selfcare_hits else 0.6
            advice = (
                "Symptoms appear mild. Rest, stay hydrated, and consider over-the-counter remedies. "
                "Seek medical care if symptoms persist or worsen."
            )
            logger.info(f"Self-care recommended: confidence={confidence}")

        result = {
            "urgency_level": urgency,
            "confidence": float(confidence),
            "advice": advice,
            "detected_symptoms": detected_symptoms,
        }
        
        return result

    def chat(self, message: str) -> str:
        """
        Provide conversational responses to patient questions.
        
        Args:
            message: Patient question or statement
            
        Returns:
            Appropriate guidance response string
            
        Raises:
            ValueError: If message is empty
        """
        if not message or not message.strip():
            logger.warning("Empty message provided to chat()")
            raise ValueError("Message cannot be empty")
        
        msg = message.strip().lower()
        logger.info(f"Chat request: {msg[:50]}...")
        
        # Pattern-based responses
        if any(keyword in msg for keyword in ["emergency", "urgent", "911", "112"]):
            return "If you suspect an emergency, call your local emergency number immediately."
        
        if "fever" in msg:
            return (
                "A fever is a temporary rise in body temperature, often due to infection. "
                "Seek care if it lasts more than 3 days, is ≥39°C, or if you have severe symptoms."
            )
        
        if any(keyword in msg for keyword in ["doctor", "see a doctor", "consult"]):
            return "See a healthcare professional if symptoms are severe, persistent, or concerning."
        
        # Default response
        return (
            "I'm here to help with general triage guidance. Describe your symptoms, duration, and severity, "
            "and I'll suggest an urgency level."
        )

"""
Neo4j Graph Database Service for Medical Knowledge Graph
FULL AND CLEAN IMPLEMENTATION
"""

from neo4j import GraphDatabase
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)




class GraphDBService:
    """
    Neo4j-based medical knowledge graph service
    Handles:
    - Symptom → ClinicalPattern → Disease reasoning
    """

    # =========================
    # INIT
    # =========================
    def __init__(
        self,
        uri: str = "bolt://localhost:7687",
        user: str = "neo4j",
        password: str = "password",
    ):
        self.driver = None

        try:
            self.driver = GraphDatabase.driver(
                uri,
                auth=(user, password),
                connection_timeout=2,
                max_connection_lifetime=10,
            )
            logger.info("Neo4j driver initialized successfully")
        except Exception as e:
            logger.warning(f"Neo4j not available: {e}")
            self.driver = None

    # =====================================================
    # FIND RELATED DISEASES
    # Symptom → Pattern → Disease
    # =====================================================
    def find_related_diseases(self, symptoms: List[str]) -> List[Dict]:
        if not self.driver:
            return []

        with self.driver.session() as session:
            result = session.run(
                """
                UNWIND $symptoms AS symptomText
                MATCH (s:Symptom)-[r:PART_OF]->(p:ClinicalPattern)-[i:INDICATES]->(d:Disease)
                WHERE toLower(s.name) CONTAINS toLower(symptomText)
                WITH d,
                     COUNT(DISTINCT s) AS matched_symptoms,
                     AVG(r.weight * i.confidence) AS base_confidence
                RETURN
                    d.name AS disease,
                    d.urgency AS base_urgency,
                    base_confidence,
                    matched_symptoms
                ORDER BY base_confidence DESC
                LIMIT 5
                """,
                symptoms=symptoms,
            )

            diseases = []

            for record in result:
                confidence = float(record["base_confidence"])
                matched = int(record["matched_symptoms"])

                diseases.append(
                    {
                        "disease": record["disease"],
                        "urgency": classify_urgency(confidence, matched),
                        "confidence": round(confidence, 3),
                        "matching_symptoms": matched,
                    }
                )

            return diseases

    # =====================================================
    # ADD / UPDATE DIRECT Symptom → Disease
    # (optional utility)
    # =====================================================
    def add_symptom_disease_relationship(
        self,
        symptom: str,
        disease: str,
        urgency: str,
        confidence: float = 0.7,
    ):
        if not self.driver:
            return

        with self.driver.session() as session:
            session.run(
                """
                MERGE (s:Symptom {name: $symptom})
                MERGE (d:Disease {name: $disease})
                SET d.urgency = $urgency
                MERGE (s)-[r:INDICATES]->(d)
                SET r.confidence = $confidence
                """,
                symptom=symptom,
                disease=disease,
                urgency=urgency,
                confidence=confidence,
            )

    # =====================================================
    # GET SYMPTOM NETWORK
    # =====================================================
    def get_symptom_network(self, symptom: str) -> Dict:
        if not self.driver:
            return {}

        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (s:Symptom {name: $symptom})-[r:INDICATES]->(d:Disease)
                OPTIONAL MATCH (d)<-[:INDICATES]-(related:Symptom)
                WHERE related.name <> $symptom
                RETURN d.name AS disease,
                       d.urgency AS urgency,
                       r.confidence AS confidence,
                       COLLECT(DISTINCT related.name) AS related_symptoms
                """,
                symptom=symptom,
            )

            network = {
                "diseases": [],
                "related_symptoms": set(),
            }

            for record in result:
                network["diseases"].append(
                    {
                        "name": record["disease"],
                        "urgency": record["urgency"],
                        "confidence": float(record["confidence"]),
                    }
                )
                network["related_symptoms"].update(record["related_symptoms"])

            network["related_symptoms"] = list(network["related_symptoms"])
            return network
# =========================
# Adaptive triage thresholds
# =========================
def classify_urgency(confidence: float, matched_symptoms: int) -> str:
    score = confidence * (1 + 0.15 * matched_symptoms)

    if score >= 0.85:
        return "CRITICAL"
    elif score >= 0.60:
        return "MODERATE"
    else:
        return "LOW"

    # =========================
    # CLOSE
    # =========================
    def close(self):
        if self.driver:
            self.driver.close()
            logger.info("Neo4j connection closed")

"""Neo4j Graph Database Service for medical knowledge graph"""
from neo4j import GraphDatabase
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class GraphDBService:
    """Neo4j-based knowledge graph for symptoms, diseases, and relationships"""
    
    def __init__(self, uri: str = "bolt://localhost:7687", 
                 user: str = "neo4j", 
                 password: str = "password"):
        """
        Initialize Neo4j connection
        
        Args:
            uri: Neo4j connection URI
            user: Database username
            password: Database password
        """
        self.uri = uri
        self.user = user
        self.password = password
        self.driver = None
        
        try:
            from neo4j import GraphDatabase
            # Create driver with short timeout
            self.driver = GraphDatabase.driver(
                uri, 
                auth=(user, password),
                connection_timeout=2,  # 2 second timeout
                max_connection_lifetime=10
            )
            # Don't verify connectivity - let it fail lazily on first use
            logger.info("Neo4j driver created (will initialize on first query)")
            # Skip initialization - don't try to connect during startup
            # self._initialize_medical_graph()
        except Exception as e:
            logger.warning(f"Neo4j not available: {str(e)[:80]}. Graph features will be limited.")
            self.driver = None
            # Don't raise - allow system to continue without Neo4j
    
    def _initialize_medical_graph(self):
        """Initialize medical knowledge graph with nodes and relationships"""
        if not self.driver:
            return
        
        try:
            with self.driver.session() as session:
                # Create constraints and indexes
                session.run("""
                    CREATE CONSTRAINT IF NOT EXISTS 
                    FOR (s:Symptom) REQUIRE s.name IS UNIQUE
                """)
                session.run("""
                    CREATE CONSTRAINT IF NOT EXISTS 
                    FOR (d:Disease) REQUIRE d.name IS UNIQUE
                """)
                
                # Add sample medical knowledge
                session.run("""
                    // Common cold
                    MERGE (cold:Disease {name: 'Common Cold', urgency: 'LOW'})
                    MERGE (runnyNose:Symptom {name: 'Runny Nose'})
                    MERGE (soreThroat:Symptom {name: 'Sore Throat'})
                    MERGE (mildCough:Symptom {name: 'Mild Cough'})
                    MERGE (runnyNose)-[:INDICATES {confidence: 0.7}]->(cold)
                    MERGE (soreThroat)-[:INDICATES {confidence: 0.6}]->(cold)
                    MERGE (mildCough)-[:INDICATES {confidence: 0.5}]->(cold)
                    
                    // Heart attack
                    MERGE (heartAttack:Disease {name: 'Heart Attack', urgency: 'CRITICAL'})
                    MERGE (chestPain:Symptom {name: 'Chest Pain'})
                    MERGE (breathShortness:Symptom {name: 'Shortness of Breath'})
                    MERGE (sweating:Symptom {name: 'Excessive Sweating'})
                    MERGE (armPain:Symptom {name: 'Arm Pain'})
                    MERGE (chestPain)-[:INDICATES {confidence: 0.9}]->(heartAttack)
                    MERGE (breathShortness)-[:INDICATES {confidence: 0.85}]->(heartAttack)
                    MERGE (sweating)-[:INDICATES {confidence: 0.7}]->(heartAttack)
                    MERGE (armPain)-[:INDICATES {confidence: 0.8}]->(heartAttack)
                    
                    // Stroke
                    MERGE (stroke:Disease {name: 'Stroke', urgency: 'CRITICAL'})
                    MERGE (severeHeadache:Symptom {name: 'Severe Headache'})
                    MERGE (confusion:Symptom {name: 'Confusion'})
                    MERGE (visionChanges:Symptom {name: 'Vision Changes'})
                    MERGE (speechDifficulty:Symptom {name: 'Speech Difficulty'})
                    MERGE (severeHeadache)-[:INDICATES {confidence: 0.85}]->(stroke)
                    MERGE (confusion)-[:INDICATES {confidence: 0.9}]->(stroke)
                    MERGE (visionChanges)-[:INDICATES {confidence: 0.8}]->(stroke)
                    MERGE (speechDifficulty)-[:INDICATES {confidence: 0.95}]->(stroke)
                    
                    // Flu
                    MERGE (flu:Disease {name: 'Influenza', urgency: 'MODERATE'})
                    MERGE (fever:Symptom {name: 'Fever'})
                    MERGE (bodyAches:Symptom {name: 'Body Aches'})
                    MERGE (fatigue:Symptom {name: 'Fatigue'})
                    MERGE (fever)-[:INDICATES {confidence: 0.8}]->(flu)
                    MERGE (bodyAches)-[:INDICATES {confidence: 0.75}]->(flu)
                    MERGE (fatigue)-[:INDICATES {confidence: 0.7}]->(flu)
                    
                    // Allergic reaction
                    MERGE (allergy:Disease {name: 'Severe Allergic Reaction', urgency: 'CRITICAL'})
                    MERGE (faceSwelling:Symptom {name: 'Facial Swelling'})
                    MERGE (breathDifficulty:Symptom {name: 'Difficulty Breathing'})
                    MERGE (hives:Symptom {name: 'Hives'})
                    MERGE (faceSwelling)-[:INDICATES {confidence: 0.95}]->(allergy)
                    MERGE (breathDifficulty)-[:INDICATES {confidence: 0.98}]->(allergy)
                    MERGE (hives)-[:INDICATES {confidence: 0.85}]->(allergy)
                """)
                
                logger.info("Medical knowledge graph initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize medical graph: {str(e)[:80]}")
            # Clear driver if initialization fails
            self.driver = None
    
    def find_related_diseases(self, symptoms: List[str]) -> List[Dict]:
        """
        Find diseases related to given symptoms
        
        Args:
            symptoms: List of symptom descriptions
            
        Returns:
            List of related diseases with confidence scores
        """
        if not self.driver:
            return []
        
        try:
            with self.driver.session() as session:
                # Query for diseases matching symptoms
                result = session.run("""
                    UNWIND $symptoms AS symptomText
                    MATCH (s:Symptom)-[r:INDICATES]->(d:Disease)
                    WHERE toLower(s.name) CONTAINS toLower(symptomText)
                    RETURN d.name AS disease, 
                           d.urgency AS urgency,
                           AVG(r.confidence) AS confidence,
                           COUNT(DISTINCT s) AS symptom_count
                    ORDER BY confidence DESC, symptom_count DESC
                    LIMIT 5
                """, symptoms=symptoms)
                
                diseases = []
                for record in result:
                    diseases.append({
                        "disease": record["disease"],
                        "urgency": record["urgency"],
                        "confidence": float(record["confidence"]),
                        "matching_symptoms": int(record["symptom_count"])
                    })
                
                return diseases
        except Exception as e:
            logger.error(f"Failed to query diseases: {e}")
            return []
    
    def add_symptom_disease_relationship(self, symptom: str, disease: str, 
                                         urgency: str, confidence: float = 0.7):
        """Add or update a symptom-disease relationship"""
        if not self.driver:
            return
        
        try:
            with self.driver.session() as session:
                session.run("""
                    MERGE (s:Symptom {name: $symptom})
                    MERGE (d:Disease {name: $disease, urgency: $urgency})
                    MERGE (s)-[r:INDICATES]->(d)
                    ON CREATE SET r.confidence = $confidence
                    ON MATCH SET r.confidence = ($confidence + r.confidence) / 2
                """, symptom=symptom, disease=disease, urgency=urgency, confidence=confidence)
                
                logger.info(f"Added relationship: {symptom} -> {disease}")
        except Exception as e:
            logger.error(f"Failed to add relationship: {e}")
    
    def get_symptom_network(self, symptom: str) -> Dict:
        """Get the network of related symptoms and diseases"""
        if not self.driver:
            return {}
        
        try:
            with self.driver.session() as session:
                result = session.run("""
                    MATCH (s:Symptom {name: $symptom})-[r:INDICATES]->(d:Disease)
                    OPTIONAL MATCH (d)<-[:INDICATES]-(related:Symptom)
                    WHERE related.name <> $symptom
                    RETURN d.name AS disease,
                           d.urgency AS urgency,
                           r.confidence AS confidence,
                           COLLECT(DISTINCT related.name) AS related_symptoms
                """, symptom=symptom)
                
                network = {
                    "diseases": [],
                    "related_symptoms": set()
                }
                
                for record in result:
                    network["diseases"].append({
                        "name": record["disease"],
                        "urgency": record["urgency"],
                        "confidence": float(record["confidence"])
                    })
                    network["related_symptoms"].update(record["related_symptoms"])
                
                network["related_symptoms"] = list(network["related_symptoms"])
                return network
        except Exception as e:
            logger.error(f"Failed to get symptom network: {e}")
            return {}
    
    def close(self):
        """Close database connection"""
        if self.driver:
            self.driver.close()
            logger.info("Neo4j connection closed")

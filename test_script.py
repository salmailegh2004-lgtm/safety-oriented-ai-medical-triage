#!/usr/bin/env python3
"""
Test script for the Medical Triage Assistant
Tests various symptom scenarios and validates responses
"""

import requests
import json
from datetime import datetime

API_BASE = "http://localhost:8000"

# Test cases with expected outcomes
TEST_CASES = [
    {
        "name": "Emergency - Chest Pain",
        "symptoms": "severe chest pain radiating to left arm, difficulty breathing",
        "age": 55,
        "expected_urgency": "urgence",
        "min_confidence": 0.8
    },
    {
        "name": "Emergency - Stroke Symptoms",
        "symptoms": "sudden weakness on one side of body, slurred speech",
        "age": 68,
        "expected_urgency": "urgence",
        "min_confidence": 0.8
    },
    {
        "name": "Consultation - Persistent Fever",
        "symptoms": "fever of 39 degrees for 3 days with cough",
        "age": 35,
        "expected_urgency": "consultation",
        "min_confidence": 0.6
    },
    {
        "name": "Consultation - Infection",
        "symptoms": "infected wound with redness and swelling",
        "age": 42,
        "expected_urgency": "consultation",
        "min_confidence": 0.6
    },
    {
        "name": "Self-Care - Common Cold",
        "symptoms": "mild runny nose and slight sore throat",
        "age": 28,
        "expected_urgency": "auto-soin",
        "min_confidence": 0.6
    },
    {
        "name": "Self-Care - Minor Headache",
        "symptoms": "mild headache, feeling tired",
        "age": 25,
        "expected_urgency": "auto-soin",
        "min_confidence": 0.6
    }
]

def test_health_check():
    """Test if the API is running"""
    print("\n🔍 Testing API Health Check...")
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            print("✅ API is healthy")
            return True
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to connect to API: {e}")
        return False

def test_triage(test_case):
    """Test a single triage case"""
    print(f"\n🧪 Testing: {test_case['name']}")
    print(f"   Symptoms: {test_case['symptoms'][:60]}...")
    
    try:
        response = requests.post(
            f"{API_BASE}/triage",
            json={
                "symptoms": test_case['symptoms'],
                "age": test_case['age'],
                "allergies": None
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Validate urgency level
            urgency_match = result['urgency_level'] == test_case['expected_urgency']
            confidence_ok = result['confidence'] >= test_case['min_confidence']
            
            print(f"   Urgency: {result['urgency_level']} (expected: {test_case['expected_urgency']})")
            print(f"   Confidence: {result['confidence']:.2f} (min: {test_case['min_confidence']})")
            print(f"   Detected: {', '.join(result['detected_symptoms'])}")
            
            if urgency_match and confidence_ok:
                print("   ✅ PASSED")
                return True
            else:
                print(f"   ❌ FAILED - Urgency: {urgency_match}, Confidence: {confidence_ok}")
                return False
        else:
            print(f"   ❌ Request failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_chat():
    """Test chat functionality"""
    print("\n💬 Testing Chat Endpoint...")
    
    test_messages = [
        "When should I see a doctor?",
        "What is a fever?",
        "Tell me about emergency symptoms"
    ]
    
    passed = 0
    for message in test_messages:
        try:
            response = requests.post(
                f"{API_BASE}/chat",
                json={"message": message}
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'response' in result and len(result['response']) > 0:
                    print(f"   ✅ '{message[:30]}...' - Got response")
                    passed += 1
                else:
                    print(f"   ❌ '{message[:30]}...' - Empty response")
            else:
                print(f"   ❌ '{message[:30]}...' - Request failed")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    return passed == len(test_messages)

def test_history():
    """Test history endpoints"""
    print("\n📚 Testing History Endpoints...")
    
    try:
        # Get history
        response = requests.get(f"{API_BASE}/history")
        if response.status_code == 200:
            history = response.json()
            print(f"   ✅ Retrieved history ({len(history.get('history', []))} entries)")
        else:
            print(f"   ❌ Failed to get history: {response.status_code}")
            return False
        
        # Clear history
        response = requests.delete(f"{API_BASE}/history")
        if response.status_code == 200:
            print("   ✅ History cleared successfully")
        else:
            print(f"   ❌ Failed to clear history: {response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_metrics():
    """Test metrics endpoint"""
    print("\n📊 Testing Metrics Endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/metrics")
        if response.status_code == 200:
            metrics = response.json()
            print(f"   Total Requests: {metrics.get('total_requests', 0)}")
            print(f"   Average Latency: {metrics.get('average_latency', 0):.3f}s")
            print(f"   Error Rate: {metrics.get('error_rate', 0):.2%}")
            print("   ✅ Metrics retrieved successfully")
            return True
        else:
            print(f"   ❌ Failed to get metrics: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def run_all_tests():
    """Run all tests and report results"""
    print("=" * 70)
    print("🏥 MEDICAL TRIAGE ASSISTANT - TEST SUITE")
    print("=" * 70)
    print(f"Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    # Health check
    if not test_health_check():
        print("\n❌ API is not running. Please start the backend first.")
        print("   Run: python main.py")
        return
    
    # Test triage cases
    print("\n" + "=" * 70)
    print("TRIAGE CLASSIFICATION TESTS")
    print("=" * 70)
    
    for test_case in TEST_CASES:
        results["total"] += 1
        if test_triage(test_case):
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Test other endpoints
    print("\n" + "=" * 70)
    print("ENDPOINT FUNCTIONALITY TESTS")
    print("=" * 70)
    
    for test_func in [test_chat, test_history, test_metrics]:
        results["total"] += 1
        if test_func():
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Final report
    print("\n" + "=" * 70)
    print("TEST RESULTS SUMMARY")
    print("=" * 70)
    print(f"Total Tests: {results['total']}")
    print(f"Passed: {results['passed']} ✅")
    print(f"Failed: {results['failed']} ❌")
    print(f"Success Rate: {(results['passed']/results['total']*100):.1f}%")
    print("=" * 70)
    
    if results['failed'] == 0:
        print("\n🎉 ALL TESTS PASSED! System is working correctly.")
    else:
        print(f"\n⚠️  {results['failed']} test(s) failed. Please review the output above.")
    
    print(f"\nEnd Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    run_all_tests()
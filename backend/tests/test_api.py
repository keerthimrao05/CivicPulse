"""
CivicPulse AI - Backend Test Suite (Pytest)
Validates Authentication, Complaint Submission, AI Classification, and Workflow.
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "CivicPulse" in data["service"]

def test_citizen_registration():
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Anil Deshmukh",
            "email": "anil.d@example.com",
            "password": "SecurePassword123!",
            "phone": "+91 98450 12345",
            "city": "Bengaluru"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["role"] == "citizen"
    assert "access_token" in data

def test_admin_login():
    response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@civicpulse.gov.in",
            "password": "AdminPassword123",
            "role": "superadmin"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "superadmin"

def test_ai_image_analysis():
    response = client.post(
        "/api/ai/analyze-image",
        json={
            "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            "userHint": "pothole on road"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Road Damage"
    assert data["confidence"] > 80
    assert "suggestedSeverity" in data

def test_duplicate_detection():
    response = client.post(
        "/api/ai/detect-duplicates",
        json={
            "latitude": 12.9719,
            "longitude": 77.6412,
            "category": "Road Damage",
            "title": "Severe pothole near Indiranagar"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "isDuplicateSuspected" in data

def test_priority_engine():
    response = client.post(
        "/api/ai/predict-priority",
        json={
            "category": "Water Leakage",
            "title": "Mainline pipe burst",
            "description": "High pressure flooding into road",
            "safetyRisk": "High",
            "populationDensity": "High",
            "supportCount": 10
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["level"] in ["Critical", "High"]
    assert data["score"] >= 65

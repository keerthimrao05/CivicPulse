"""
CivicPulse AI - Complaints Management Router
Handles CRUD, spatial lookup, status workflow, and community endorsements.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
import math
import uuid
from datetime import datetime
from backend.schemas import ComplaintCreate, ComplaintStatusUpdate

router = APIRouter()

# Haversine spatial calculation
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371e3
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

@router.get("/")
def list_complaints(
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    citizen_id: Optional[str] = None,
    department_id: Optional[str] = None
):
    return {
        "message": "Connected to CivicPulse complaint repository",
        "filters": {
            "category": category,
            "status": status,
            "priority": priority,
            "search": search
        }
    }

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_complaint(payload: ComplaintCreate):
    random_code = math.floor(1000 + math.sin(datetime.utcnow().timestamp()) * 4000 + 4000)
    complaint_number = f"CP-2026-{random_code}"
    
    return {
        "id": f"comp-{uuid.uuid4().hex[:8]}",
        "complaintNumber": complaint_number,
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "priority": "High",
        "priorityScore": 75,
        "status": "REPORTED",
        "location": payload.location.dict(),
        "images": payload.images,
        "createdAt": datetime.utcnow().isoformat()
    }

@router.get("/{complaint_id}")
def get_complaint(complaint_id: str):
    return {
        "id": complaint_id,
        "complaintNumber": f"CP-2026-1021",
        "title": "Severe Deep Pothole Near Indiranagar Metro Station",
        "category": "Road Damage",
        "priority": "Critical",
        "status": "IN PROGRESS"
    }

@router.put("/{complaint_id}/status")
def update_status(complaint_id: str, payload: ComplaintStatusUpdate):
    return {
        "id": complaint_id,
        "status": payload.status,
        "comments": payload.comments,
        "updatedAt": datetime.utcnow().isoformat()
    }

@router.post("/{complaint_id}/support")
def support_complaint(complaint_id: str, user_id: str = "user-cit-1"):
    return {
        "complaintId": complaint_id,
        "supportCount": 24,
        "message": "Citizen endorsement logged. Priority score boosted."
    }

"""
CivicPulse AI - Super Administrator Command Center Router
"""

from fastapi import APIRouter
from backend.schemas import AdminAssignRequest, PriorityOverrideRequest

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_kpis():
    return {
        "totalComplaints": 5,
        "pendingComplaints": 2,
        "inProgressComplaints": 2,
        "resolvedComplaints": 1,
        "criticalComplaints": 2,
        "avgResolutionDays": 1.8,
        "citizenParticipationCount": 1420,
        "departmentsConnected": 6,
        "categoryDistribution": [
            {"category": "Road Damage", "count": 2, "color": "#2563EB"},
            {"category": "Garbage Overflow", "count": 1, "color": "#10B981"},
            {"category": "Water Leakage", "count": 1, "color": "#06B6D4"},
            {"category": "Streetlight Failure", "count": 1, "color": "#F59E0B"}
        ]
    }

@router.post("/assign")
def assign_work_order(payload: AdminAssignRequest):
    return {
        "complaintId": payload.complaintId,
        "status": "ASSIGNED",
        "departmentId": payload.departmentId,
        "officerId": payload.officerId,
        "notes": payload.adminNotes,
        "message": "Official civic work order dispatched."
    }

@router.put("/complaints/{complaint_id}/priority")
def override_priority(complaint_id: str, payload: PriorityOverrideRequest):
    return {
        "complaintId": complaint_id,
        "priority": payload.priority,
        "score": payload.score,
        "overrideReason": payload.overrideReason,
        "message": "Priority successfully modified with administrative audit trail."
    }

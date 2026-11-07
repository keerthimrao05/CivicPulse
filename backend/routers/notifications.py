"""
CivicPulse AI - Citizen and Municipal Notification Router
"""

from fastapi import APIRouter
from typing import Optional

router = APIRouter()

@router.get("/")
def get_notifications(user_id: Optional[str] = None):
    return [
        {
            "id": "notif-1",
            "userId": user_id or "user-cit-1",
            "complaintId": "comp-101",
            "title": "Road Repair Team Dispatched",
            "message": "Senior Engineer Sarah Jenkins has commenced cold-mix asphalt repair on CP-2026-1021.",
            "isRead": False,
            "createdAt": "2026-11-06T14:30:00Z"
        }
    ]

@router.put("/{notif_id}/read")
def mark_read(notif_id: str):
    return {"id": notif_id, "isRead": True}

@router.put("/read-all")
def mark_all_read():
    return {"success": True, "message": "All notifications marked as read."}

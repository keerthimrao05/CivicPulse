"""
CivicPulse AI - Department Management Router
"""

from fastapi import APIRouter
from typing import List

router = APIRouter()

DEPARTMENTS_DATA = [
    {
        "id": "dept-road",
        "name": "Road Infrastructure & Maintenance",
        "code": "PWD-ROADS",
        "headName": "Er. Rajesh V. Patil",
        "contactEmail": "pwd.roads@civicpulse.gov.in",
        "totalAssigned": 42,
        "totalResolved": 35,
        "avgResolutionHours": 36,
        "officersCount": 8
    },
    {
        "id": "dept-sanitation",
        "name": "Solid Waste & Public Sanitation",
        "code": "SWM-BBMP",
        "headName": "Dr. Ananya Sharma",
        "contactEmail": "sanitation@civicpulse.gov.in",
        "totalAssigned": 38,
        "totalResolved": 31,
        "avgResolutionHours": 18,
        "officersCount": 12
    },
    {
        "id": "dept-water",
        "name": "Water Supply & Sewerage Board",
        "code": "BWSSB-WATER",
        "headName": "Er. K. Murthy",
        "contactEmail": "water.ops@civicpulse.gov.in",
        "totalAssigned": 29,
        "totalResolved": 24,
        "avgResolutionHours": 24,
        "officersCount": 6
    }
]

@router.get("/")
def get_departments():
    return DEPARTMENTS_DATA

@router.get("/{dept_id}/officers")
def get_department_officers(dept_id: str):
    return [
        {
            "id": "off-1",
            "name": "Sarah Jenkins",
            "email": "sarah.jenkins@civicpulse.gov.in",
            "departmentId": dept_id,
            "designation": "Senior Engineer",
            "activeTasks": 4,
            "completedTasks": 18
        }
    ]

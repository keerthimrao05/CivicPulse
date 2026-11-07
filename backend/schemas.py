"""
CivicPulse AI - Pydantic Request/Response Validation Schemas
"""

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    address: Optional[str] = None
    city: str = "Bengaluru"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str]
    role: str
    city: str
    address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class BoundingBoxSchema(BaseModel):
    x: float
    y: float
    width: float
    height: float
    label: str
    confidence: float

class AIImageAnalysisRequest(BaseModel):
    imageBase64: str
    mimeType: str = "image/jpeg"
    userHint: Optional[str] = None

class AIImageAnalysisResponse(BaseModel):
    detectedIssue: str
    category: str
    confidence: float
    suggestedSeverity: str
    safetyRisk: str
    explanation: str
    boundingBoxes: Optional[List[BoundingBoxSchema]] = None
    source: Optional[str] = None

class DuplicateCheckRequest(BaseModel):
    latitude: float
    longitude: float
    category: str
    title: Optional[str] = None
    description: Optional[str] = None

class PriorityPredictionRequest(BaseModel):
    category: str
    title: str
    description: str
    safetyRisk: Optional[str] = "Medium"
    populationDensity: Optional[str] = "High"
    supportCount: Optional[int] = 1

class VoiceDraftRequest(BaseModel):
    speechText: str
    language: Optional[str] = "en"

class ResolutionVerificationRequest(BaseModel):
    beforeImageBase64: str
    afterImageBase64: str
    complaintTitle: Optional[str] = None

class LocationCreate(BaseModel):
    address: str
    city: str = "Bengaluru"
    latitude: float
    longitude: float
    landmark: Optional[str] = None

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str
    location: LocationCreate
    images: List[str] = []
    citizenId: Optional[str] = None
    citizenName: Optional[str] = None
    citizenPhone: Optional[str] = None

class ComplaintStatusUpdate(BaseModel):
    status: str
    changedBy: Optional[str] = None
    changedByName: Optional[str] = None
    comments: Optional[str] = None
    afterImageUrl: Optional[str] = None

class AdminAssignRequest(BaseModel):
    complaintId: str
    departmentId: str
    officerId: str
    adminNotes: Optional[str] = None

class PriorityOverrideRequest(BaseModel):
    priority: str
    score: int
    overrideReason: str
    officerName: Optional[str] = None

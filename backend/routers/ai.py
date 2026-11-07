"""
CivicPulse AI - AI Computer Vision & NLP Routing Service
Integrates YOLO detection, Duplicate Clustering, Priority Engine, Voice Draft, and Resolution Verification
"""

from fastapi import APIRouter, HTTPException
from backend.schemas import (
    AIImageAnalysisRequest,
    AIImageAnalysisResponse,
    DuplicateCheckRequest,
    PriorityPredictionRequest,
    VoiceDraftRequest,
    ResolutionVerificationRequest
)
from backend.ai_services import (
    analyze_civic_image,
    detect_duplicate_complaints,
    predict_priority_score,
    transcribe_and_draft_voice,
    verify_resolution_photo
)

router = APIRouter()

@router.post("/analyze-image", response_model=AIImageAnalysisResponse)
async def analyze_image_endpoint(payload: AIImageAnalysisRequest):
    result = await analyze_civic_image(payload.imageBase64, payload.mimeType, payload.userHint)
    return result

@router.post("/detect-duplicates")
def detect_duplicates_endpoint(payload: DuplicateCheckRequest):
    return detect_duplicate_complaints(
        payload.latitude,
        payload.longitude,
        payload.category,
        payload.title,
        payload.description
    )

@router.post("/predict-priority")
def predict_priority_endpoint(payload: PriorityPredictionRequest):
    return predict_priority_score(
        payload.category,
        payload.title,
        payload.description,
        payload.safetyRisk,
        payload.populationDensity,
        payload.supportCount
    )

@router.post("/voice-draft")
async def voice_draft_endpoint(payload: VoiceDraftRequest):
    return await transcribe_and_draft_voice(payload.speechText, payload.language)

@router.post("/verify-resolution")
async def verify_resolution_endpoint(payload: ResolutionVerificationRequest):
    return await verify_resolution_photo(
        payload.beforeImageBase64,
        payload.afterImageBase64,
        payload.complaintTitle
    )

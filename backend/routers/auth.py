"""
CivicPulse AI - Authentication & JWT Access Control Router
"""

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
import uuid
import hashlib
from backend.schemas import UserRegister, UserLogin, Token, UserOut

router = APIRouter()

SECRET_KEY = "civicpulse_production_jwt_secret_token_key"
ALGORITHM = "HS256"

# Mock hash function for demonstrability without bcrypt binary dependency
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister):
    # Only citizens can register through the public registration interface
    user_id = f"user-cit-{uuid.uuid4().hex[:8]}"
    
    mock_user = UserOut(
        id=user_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        role="citizen",
        city=payload.city,
        address=payload.address,
        created_at=datetime.utcnow()
    )
    
    return {
        "access_token": f"bearer_{user_id}_{hashlib.md5(payload.email.encode()).hexdigest()}",
        "token_type": "bearer",
        "user": mock_user
    }

@router.post("/login", response_model=Token)
def login_user(payload: UserLogin):
    email = payload.email.lower()
    
    # Check for Super Administrator login
    if payload.role == "superadmin" or email == "admin@civicpulse.gov.in":
        admin_user = UserOut(
            id="admin-1",
            name="Dr. Vikram Malhotra",
            email=email,
            phone="+91 80 2200 9000",
            role="superadmin",
            city="Bengaluru",
            address="Municipal Commissioner Headquarters, Corporation Circle",
            created_at=datetime.utcnow()
        )
        return {
            "access_token": "bearer_admin_superadmin_session",
            "token_type": "bearer",
            "user": admin_user
        }
        
    # Check for Department Officer login
    if payload.role == "officer" or "officer" in email or "jenkins" in email:
        officer_user = UserOut(
            id="off-1",
            name="Sarah Jenkins",
            email=email,
            phone="+91 98450 11223",
            role="officer",
            city="Bengaluru",
            address="Zonal Engineering Command, Indiranagar",
            created_at=datetime.utcnow()
        )
        return {
            "access_token": "bearer_officer_sarah_session",
            "token_type": "bearer",
            "user": officer_user
        }
        
    # Default Citizen Account
    citizen_user = UserOut(
        id="user-cit-1",
        name="Keerthi Rao",
        email=email,
        phone="+91 98451 22334",
        role="citizen",
        city="Bengaluru",
        address="100 Feet Road, Indiranagar",
        created_at=datetime.utcnow()
    )
    return {
        "access_token": f"bearer_citizen_{citizen_user.id}",
        "token_type": "bearer",
        "user": citizen_user
    }

@router.post("/logout")
def logout_user():
    return {"message": "Session invalidated successfully."}

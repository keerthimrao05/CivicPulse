"""
CivicPulse AI - PostgreSQL & PostGIS Relational Database Models
Implements all 13 required civic schema entities with foreign keys and spatial indexes.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
import enum
from backend.database import Base

class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    OFFICER = "officer"
    SUPERADMIN = "superadmin"

class IssueCategory(str, enum.Enum):
    ROAD_DAMAGE = "Road Damage"
    GARBAGE_OVERFLOW = "Garbage Overflow"
    WATER_LEAKAGE = "Water Leakage"
    DRAINAGE_BLOCKAGE = "Drainage Blockage"
    STREETLIGHT_FAILURE = "Streetlight Failure"
    PUBLIC_INFRASTRUCTURE = "Public Infrastructure Damage"
    WATER_STAGNATION = "Water Stagnation"
    OTHER = "Other Civic Issues"

class IssuePriority(str, enum.Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class IssueStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    UNDER_REVIEW = "UNDER REVIEW"
    VERIFIED = "VERIFIED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    REJECTED = "REJECTED"
    REOPENED = "REOPENED"
    AWAITING_INFO = "AWAITING INFORMATION"

# 1. users
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CITIZEN, nullable=False)
    address = Column(Text, nullable=True)
    city = Column(String(100), default="Bengaluru", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="citizen")
    notifications = relationship("Notification", back_populates="user")

# 6. departments
class Department(Base):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    head_name = Column(String(120), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(30), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    officers = relationship("DepartmentOfficer", back_populates="department")
    complaints = relationship("Complaint", back_populates="department")

# 7. department_officers
class DepartmentOfficer(Base):
    __tablename__ = "department_officers"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    department_id = Column(String, ForeignKey("departments.id"), nullable=False)
    designation = Column(String(100), nullable=False)
    zone = Column(String(100), nullable=True)
    active_tasks = Column(Integer, default=0)

    department = relationship("Department", back_populates="officers")

# 4. locations
class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, index=True)
    address = Column(Text, nullable=False)
    city = Column(String(100), default="Bengaluru")
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    landmark = Column(String(200), nullable=True)
    postal_code = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# 2. complaints
class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SQLEnum(IssueCategory), nullable=False, index=True)
    priority = Column(SQLEnum(IssuePriority), default=IssuePriority.MEDIUM, index=True)
    priority_score = Column(Integer, default=50)
    priority_reasoning = Column(Text, nullable=True)
    status = Column(SQLEnum(IssueStatus), default=IssueStatus.REPORTED, index=True)
    
    citizen_id = Column(String, ForeignKey("users.id"), nullable=False)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    department_id = Column(String, ForeignKey("departments.id"), nullable=True)
    assigned_officer_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    support_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    citizen = relationship("User", foreign_keys=[citizen_id], back_populates="complaints")
    department = relationship("Department", back_populates="complaints")
    location = relationship("Location")
    images = relationship("ComplaintImage", back_populates="complaint")
    ai_analysis = relationship("AIAnalysis", back_populates="complaint", uselist=False)
    history = relationship("ComplaintHistory", back_populates="complaint")
    supports = relationship("ComplaintSupport", back_populates="complaint")
    resolution = relationship("ResolutionVerification", back_populates="complaint", uselist=False)

# 3. complaint_images
class ComplaintImage(Base):
    __tablename__ = "complaint_images"

    id = Column(String, primary_key=True, index=True)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    image_url = Column(Text, nullable=False)
    is_primary = Column(Boolean, default=False)
    file_size_bytes = Column(Integer, nullable=True)
    mime_type = Column(String(50), default="image/jpeg")
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="images")

# 5. ai_analysis
class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(String, primary_key=True, index=True)
    complaint_id = Column(String, ForeignKey("complaints.id"), unique=True, nullable=False)
    detected_issue = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    suggested_severity = Column(String(50), nullable=False)
    explanation = Column(Text, nullable=False)
    safety_risk = Column(String(20), default="Medium")
    bounding_boxes_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="ai_analysis")

# 8. assignments
class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String, primary_key=True, index=True)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    department_id = Column(String, ForeignKey("departments.id"), nullable=False)
    assigned_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    assigned_to_officer_id = Column(String, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)

# 9. complaint_history
class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id = Column(String, primary_key=True, index=True)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    changed_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    comments = Column(Text, nullable=True)
    supporting_photo_url = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="history")

# 10. duplicate_reports
class DuplicateReport(Base):
    __tablename__ = "duplicate_reports"

    id = Column(String, primary_key=True, index=True)
    original_complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    potential_duplicate_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    similarity_score = Column(Float, nullable=False)
    distance_meters = Column(Float, nullable=False)
    action_taken = Column(String(50), default="PROCEEDED_SEPARATE") # MERGED, REJECTED, PROCEEDED
    created_at = Column(DateTime, default=datetime.utcnow)

# 11. notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="status_change")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

# 12. complaint_support
class ComplaintSupport(Base):
    __tablename__ = "complaint_support"

    id = Column(String, primary_key=True, index=True)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    supported_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="supports")

# 13. resolution_verification
class ResolutionVerification(Base):
    __tablename__ = "resolution_verification"

    id = Column(String, primary_key=True, index=True)
    complaint_id = Column(String, ForeignKey("complaints.id"), unique=True, nullable=False)
    before_image_url = Column(Text, nullable=False)
    after_image_url = Column(Text, nullable=False)
    status = Column(String(50), nullable=False) # Improvement Detected, No Clear Improvement, Unable to Verify
    confidence_score = Column(Float, nullable=False)
    verification_notes = Column(Text, nullable=True)
    verified_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="resolution")

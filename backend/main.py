"""
CivicPulse AI - Python FastAPI Enterprise Backend
Primary Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, complaints, ai, departments, admin, notifications
from backend.database import engine, Base

# Initialize DB tables if PostgreSQL is connected
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database table sync notification: {e}")

app = FastAPI(
    title="CivicPulse AI - Smart Civic Management Platform API",
    description="Enterprise RESTful backend for AI-powered civic issue detection, spatial clustering, priority evaluation, and lifecycle resolution.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication & RBAC"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["Civic Complaints"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI & Computer Vision Engine"])
app.include_router(departments.router, prefix="/api/departments", tags=["Department Operations"])
app.include_router(admin.router, prefix="/api/admin", tags=["Super Administrator"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notification Service"])

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "CivicPulse AI API",
        "version": "1.0.0",
        "spatial_engine": "PostGIS enabled",
        "ai_vision": "YOLOv8 + Gemini 3.8 Multimodal"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

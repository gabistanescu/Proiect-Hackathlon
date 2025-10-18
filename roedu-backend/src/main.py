import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.api.v1 import auth, administrators, professors, students, materials, quizzes, comments, suggestions, groups, ai_evaluation_reports
from src.config.database import init_db
from src.config.settings import settings


# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting up RoEdu Educational Platform...")
    init_db()
    print("✅ Database initialized successfully!")
    yield
    # Shutdown
    print("🛑 Shutting down RoEdu Educational Platform...")


# Initialize FastAPI app with lifespan
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# CORS middleware - PERMITE TOATE ORIGINILE pentru development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite toate originile
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(administrators.router, prefix="/api/v1/administrators", tags=["Administrators"])
app.include_router(professors.router, prefix="/api/v1/professors", tags=["Professors"])
app.include_router(students.router, prefix="/api/v1/students", tags=["Students"])
app.include_router(materials.router, prefix="/api/v1/materials", tags=["Materials"])
app.include_router(suggestions.router, prefix="/api/v1/materials", tags=["Suggestions"])
app.include_router(quizzes.router, prefix="/api/v1/quizzes", tags=["Quizzes"])
app.include_router(comments.router, prefix="/api/v1/comments", tags=["Comments"])
app.include_router(groups.router, prefix="/api/v1/groups", tags=["Groups"])
app.include_router(ai_evaluation_reports.router, prefix="/api/v1/ai_evaluation_reports", tags=["AI Evaluation Reports"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to RoEdu Educational Platform API",
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
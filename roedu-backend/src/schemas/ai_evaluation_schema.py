from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

class EvaluationStatus(str, Enum):
    PENDING = "pending"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class AIEvaluationReportCreate(BaseModel):
    """Student creates a report disputing AI evaluation"""
    reason: str = Field(..., min_length=10, description="Why student disputes the evaluation")

class ReviewReportRequest(BaseModel):
    """Professor reviews and potentially corrects the AI evaluation"""
    status: EvaluationStatus = Field(..., description="Resolution status")
    professor_feedback: str = Field(..., min_length=10, description="Professor's feedback")
    new_score: Optional[float] = Field(None, ge=0, le=100, description="Corrected score (0-100%)")

class AIEvaluationReportResponse(BaseModel):
    id: int
    quiz_attempt_id: int
    question_id: int
    student_id: int
    
    # AI Evaluation Details
    ai_score: float
    ai_feedback: Optional[str]
    ai_reasoning: Optional[str]
    ai_model_version: Optional[str]
    
    # Student Report
    reason: str
    status: str
    created_at: datetime
    
    # Professor Review
    professor_id: Optional[int]
    professor_feedback: Optional[str]
    new_score: Optional[float]
    reviewed_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import json

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
    ai_score_breakdown: Optional[Dict[str, Any]] = None  # {correctness, completeness, clarity}
    ai_strengths: Optional[List[str]] = None  # List of strengths
    ai_improvements: Optional[List[str]] = None  # List of areas for improvement
    ai_suggestions: Optional[List[str]] = None  # List of suggestions for learning
    
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
    
    @field_validator('ai_score_breakdown', mode='before')
    @classmethod
    def parse_score_breakdown(cls, v):
        """Parse JSON string to dict"""
        if isinstance(v, str):
            try:
                return json.loads(v) if v else None
            except:
                return None
        return v
    
    @field_validator('ai_strengths', mode='before')
    @classmethod
    def parse_strengths(cls, v):
        """Parse JSON string to list"""
        if isinstance(v, str):
            try:
                return json.loads(v) if v else []
            except:
                return []
        return v if v else []
    
    @field_validator('ai_improvements', mode='before')
    @classmethod
    def parse_improvements(cls, v):
        """Parse JSON string to list"""
        if isinstance(v, str):
            try:
                return json.loads(v) if v else []
            except:
                return []
        return v if v else []
    
    @field_validator('ai_suggestions', mode='before')
    @classmethod
    def parse_suggestions(cls, v):
        """Parse JSON string to list"""
        if isinstance(v, str):
            try:
                return json.loads(v) if v else []
            except:
                return []
        return v if v else []

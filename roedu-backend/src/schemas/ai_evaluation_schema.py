from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
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
    
    @property
    def ai_score_breakdown_dict(self) -> Optional[Dict[str, Any]]:
        """Parse ai_score_breakdown JSON if it's a string"""
        if isinstance(self.ai_score_breakdown, str):
            import json
            try:
                return json.loads(self.ai_score_breakdown)
            except:
                return None
        return self.ai_score_breakdown
    
    @property
    def ai_strengths_list(self) -> List[str]:
        """Parse ai_strengths JSON if it's a string"""
        if isinstance(self.ai_strengths, str):
            import json
            try:
                return json.loads(self.ai_strengths)
            except:
                return []
        return self.ai_strengths or []
    
    @property
    def ai_improvements_list(self) -> List[str]:
        """Parse ai_improvements JSON if it's a string"""
        if isinstance(self.ai_improvements, str):
            import json
            try:
                return json.loads(self.ai_improvements)
            except:
                return []
        return self.ai_improvements or []
    
    @property
    def ai_suggestions_list(self) -> List[str]:
        """Parse ai_suggestions JSON if it's a string"""
        if isinstance(self.ai_suggestions, str):
            import json
            try:
                return json.loads(self.ai_suggestions)
            except:
                return []
        return self.ai_suggestions or []

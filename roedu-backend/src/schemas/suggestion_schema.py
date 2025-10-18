"""
Pydantic schemas for Material Suggestions and Feedback
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


class SuggestionStatus(str, Enum):
    OPEN = "open"
    RESOLVED = "resolved"
    CLOSED = "closed"


# Material Suggestion Schemas
class SuggestionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)


class SuggestionCreate(SuggestionBase):
    pass


class SuggestionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[SuggestionStatus] = None


class SuggestionResponse(SuggestionBase):
    id: int
    material_id: int
    professor_id: int
    status: SuggestionStatus
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    comments_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)


# Suggestion Comment Schemas
class SuggestionCommentCreate(BaseModel):
    content: str = Field(..., min_length=1)


class SuggestionCommentResponse(BaseModel):
    id: int
    suggestion_id: int
    professor_id: int
    content: str
    created_at: datetime
    updated_at: datetime
    professor_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


# Feedback Schemas
class FeedbackToggleResponse(BaseModel):
    material_id: int
    user_id: int
    helpful: bool
    message: str


class FeedbackStatsResponse(BaseModel):
    material_id: int
    professors_count: int
    students_count: int
    user_has_feedback: bool
